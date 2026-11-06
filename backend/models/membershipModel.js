
const { sql, connectDB } = require("../config/db");

// Retrieve all students and their latest membership
async function getAllMemberships() {
    const pool = await connectDB();

    const result = await pool.request().query(`
        SELECT
            s.StudentId,
            s.StudentNumber,
            u.DisplayName,
            u.Email,
            u.AccountStatus,
            d.Name AS DojoName,
            CONVERT(VARCHAR(10), s.JoinedOn, 23) AS JoinedOn,

            latest.MembershipId,
            latest.StartsOn,
            latest.ExpiresOn,
            COALESCE(latest.Status, 'No Membership') AS MembershipStatus

        FROM Students s

        INNER JOIN Users u
            ON s.UserId = u.UserId

        INNER JOIN Dojos d
            ON s.HomeDojoId = d.DojoId

        OUTER APPLY (
            SELECT TOP 1
                m.MembershipId,
                CONVERT(VARCHAR(10), m.StartsOn, 23) AS StartsOn,
                CONVERT(VARCHAR(10), m.ExpiresOn, 23) AS ExpiresOn,
                m.Status

            FROM Memberships m

            WHERE m.StudentId = s.StudentId

            ORDER BY m.StartsOn DESC, m.MembershipId DESC
        ) latest

        ORDER BY u.DisplayName ASC;
    `);

    return result.recordset;
}


// Retrieve a student's details and membership history
async function getMembershipByStudentId(studentId) {
    const pool = await connectDB();

    const result = await pool.request()
        .input("studentId", sql.Int, studentId)
        .query(`
            SELECT
                s.StudentId,
                s.StudentNumber,
                u.DisplayName,
                u.Email,
                u.AccountStatus,
                d.Name AS DojoName,
                CONVERT(VARCHAR(10), s.JoinedOn, 23) AS JoinedOn,

                m.MembershipId,
                CONVERT(VARCHAR(10), m.StartsOn, 23) AS StartsOn,
                CONVERT(VARCHAR(10), m.ExpiresOn, 23) AS ExpiresOn,
                m.Status AS MembershipStatus

            FROM Students s

            INNER JOIN Users u
                ON s.UserId = u.UserId

            INNER JOIN Dojos d
                ON s.HomeDojoId = d.DojoId

            LEFT JOIN Memberships m
                ON s.StudentId = m.StudentId

            WHERE s.StudentId = @studentId

            ORDER BY m.StartsOn DESC;
        `);

    return result.recordset;
}


// Update an existing membership
async function updateMembership(
    membershipId,
    startsOn,
    expiresOn,
    status
) {
    const pool = await connectDB();

    const result = await pool.request()
        .input("membershipId", sql.Int, membershipId)
        .input("startsOn", sql.Date, startsOn)
        .input("expiresOn", sql.Date, expiresOn)
        .input("status", sql.VarChar(16), status)
        .query(`
            UPDATE Memberships

            SET
                StartsOn = @startsOn,
                ExpiresOn = @expiresOn,
                Status = @status

            OUTPUT
                INSERTED.MembershipId,
                CONVERT(VARCHAR(10), INSERTED.StartsOn, 23) AS StartsOn,
                CONVERT(VARCHAR(10), INSERTED.ExpiresOn, 23) AS ExpiresOn,
                INSERTED.Status AS MembershipStatus

            WHERE MembershipId = @membershipId;
        `);

    return result.recordset[0];
}


module.exports = {
    getAllMemberships,
    getMembershipByStudentId,
    updateMembership
};
