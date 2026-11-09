
const { sql, connectDB } = require("../config/db");

async function getAllClasses(studentId = null) {
    const pool = await connectDB();
    const request = pool.request().input("StudentId", sql.Int, studentId);

    const result = await request.query(`
        SELECT
            cs.ClassSessionId,
            cs.SessionCode,
            cs.Title,
            cs.StartsAtLocal,
            cs.EndsAtLocal,
            CONVERT(VARCHAR(16), cs.StartsAtLocal, 120) AS StartsAtLocalText,
            CONVERT(VARCHAR(16), cs.EndsAtLocal, 120) AS EndsAtLocalText,
            cs.Capacity,
            cs.Status,
            cs.CountsForGrading,

            d.DojoId,
            d.Name AS DojoName,
            d.Address AS DojoAddress,
            d.PostalCode,

            CAST(CASE WHEN EXISTS (
                SELECT 1
                FROM dbo.ClassEnrolments ownEnrolment
                WHERE ownEnrolment.ClassSessionId = cs.ClassSessionId
                  AND ownEnrolment.StudentId = @StudentId
                  AND ownEnrolment.Status = 'Enrolled'
            ) THEN 1 ELSE 0 END AS BIT) AS IsEnrolled,

            (
                SELECT COUNT(*)
                FROM dbo.ClassEnrolments ce
                WHERE ce.ClassSessionId = cs.ClassSessionId
                AND ce.Status = 'Enrolled'
            ) AS EnrolledCount

        FROM dbo.ClassSessions cs

        INNER JOIN dbo.Dojos d
            ON cs.DojoId = d.DojoId

        WHERE cs.Status = 'Scheduled'
        AND d.IsActive = 1
        AND cs.StartsAtLocal > GETDATE()

        ORDER BY cs.StartsAtLocal ASC;
    `);

    return result.recordset;
}


async function getStudentSchedule(studentId) {
    const pool = await connectDB();

    const result = await pool.request()
        .input("StudentId", sql.Int, studentId)
        .query(`
            SELECT
                ce.ClassEnrolmentId,
                ce.StudentId,
                cs.ClassSessionId,
                cs.SessionCode,
                cs.Title,
                cs.StartsAtLocal,
                cs.EndsAtLocal,
                CONVERT(VARCHAR(16), cs.StartsAtLocal, 120) AS StartsAtLocalText,
                CONVERT(VARCHAR(16), cs.EndsAtLocal, 120) AS EndsAtLocalText,
                cs.Status AS ClassStatus,
                d.DojoId,
                d.Name AS DojoName,
                d.Address AS DojoAddress
            FROM dbo.ClassEnrolments ce
            INNER JOIN dbo.ClassSessions cs
                ON ce.ClassSessionId = cs.ClassSessionId
            INNER JOIN dbo.Dojos d
                ON cs.DojoId = d.DojoId
            WHERE ce.StudentId = @StudentId
              AND ce.Status = 'Enrolled'
            ORDER BY cs.StartsAtLocal ASC;
        `);

    return result.recordset;
}


async function enrolStudent(studentId, classSessionId) {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        // 1. Check whether the student has an active membership.
        const membershipResult = await new sql.Request(transaction)
            .input("StudentId", sql.Int, studentId)
            .query(`
                SELECT TOP 1 m.MembershipId
                FROM dbo.Memberships m
                INNER JOIN dbo.Students s
                    ON m.StudentId = s.StudentId
                WHERE s.StudentId = @StudentId
                  AND m.Status = 'Active'
                  AND CAST(GETDATE() AS DATE)
                      BETWEEN m.StartsOn AND m.ExpiresOn;
            `);

        if (membershipResult.recordset.length === 0) {
            throw Object.assign(
                new Error("You need an active membership to enrol in classes."),
                { statusCode: 403 }
            );
        }

        // 2. Check whether the class exists and is available.
        // Lock the class row to prevent concurrent enrolments
        // from exceeding its capacity.
        const classResult = await new sql.Request(transaction)
            .input("ClassSessionId", sql.Int, classSessionId)
            .query(`
                SELECT cs.ClassSessionId, cs.Capacity
                FROM dbo.ClassSessions cs WITH (UPDLOCK, HOLDLOCK)
                INNER JOIN dbo.Dojos d
                    ON cs.DojoId = d.DojoId
                WHERE cs.ClassSessionId = @ClassSessionId
                  AND cs.Status = 'Scheduled'
                  AND d.IsActive = 1
                  AND cs.StartsAtLocal > GETDATE();
            `);

        if (classResult.recordset.length === 0) {
            throw Object.assign(
                new Error("Class not found or unavailable for enrolment."),
                { statusCode: 404 }
            );
        }

        const capacity = classResult.recordset[0].Capacity;

        // 3. Check the number of confirmed enrolments.
        const countResult = await new sql.Request(transaction)
            .input("ClassSessionId", sql.Int, classSessionId)
            .query(`
                SELECT COUNT(*) AS EnrolledCount
                FROM dbo.ClassEnrolments
                WHERE ClassSessionId = @ClassSessionId
                  AND Status = 'Enrolled';
            `);

        const enrolledCount = countResult.recordset[0].EnrolledCount;

        if (enrolledCount >= capacity) {
            throw Object.assign(
                new Error("This class is full."),
                { statusCode: 409 }
            );
        }

        // 4. Check whether the student has enrolled before.
        const existingResult = await new sql.Request(transaction)
            .input("StudentId", sql.Int, studentId)
            .input("ClassSessionId", sql.Int, classSessionId)
            .query(`
                SELECT ClassEnrolmentId, Status
                FROM dbo.ClassEnrolments
                WHERE StudentId = @StudentId
                  AND ClassSessionId = @ClassSessionId;
            `);

        if (existingResult.recordset.length > 0) {
            const existing = existingResult.recordset[0];

            if (existing.Status === "Enrolled") {
                throw Object.assign(
                    new Error("You are already enrolled in this class."),
                    { statusCode: 409 }
                );
            }

            // Reactivate a previously cancelled enrolment.
            await new sql.Request(transaction)
                .input("ClassEnrolmentId", sql.Int, existing.ClassEnrolmentId)
                .query(`
                    UPDATE dbo.ClassEnrolments
                    SET Status = 'Enrolled',
                        EnrolledAtUtc = SYSUTCDATETIME(),
                        CancelledAtUtc = NULL
                    WHERE ClassEnrolmentId = @ClassEnrolmentId;
                `);

        } else {
            // 5. Create a new enrolment.
            await new sql.Request(transaction)
                .input("StudentId", sql.Int, studentId)
                .input("ClassSessionId", sql.Int, classSessionId)
                .query(`
                    INSERT INTO dbo.ClassEnrolments
                        (StudentId, ClassSessionId, Status)
                    VALUES
                        (@StudentId, @ClassSessionId, 'Enrolled');
                `);
        }

        await transaction.commit();

        return {
            message: "Successfully enrolled in class."
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}


module.exports = {
    getAllClasses,
    getStudentSchedule,
    enrolStudent
};
