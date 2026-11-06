
const membershipModel = require("../models/membershipModel");


// GET all students
async function getAllMemberships(req, res) {
    try {
        const memberships = await membershipModel.getAllMemberships();

        res.status(200).json(memberships);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve memberships."
        });
    }
}


// GET student details and membership history
async function getMembershipByStudentId(req, res) {
    try {
        const studentId = Number(req.params.studentId);

        if (!Number.isInteger(studentId) || studentId <= 0) {
            return res.status(400).json({
                message: "Invalid student ID."
            });
        }

        const memberships =
            await membershipModel.getMembershipByStudentId(studentId);

        if (memberships.length === 0) {
            return res.status(404).json({
                message: "Student not found."
            });
        }

        const student = {
            studentId: memberships[0].StudentId,
            studentNumber: memberships[0].StudentNumber,
            name: memberships[0].DisplayName,
            email: memberships[0].Email,
            accountStatus: memberships[0].AccountStatus,
            dojo: memberships[0].DojoName,
            joinedOn: memberships[0].JoinedOn,

            memberships: memberships
                .filter(m => m.MembershipId !== null)
                .map(m => ({
                    membershipId: m.MembershipId,
                    startsOn: m.StartsOn,
                    expiresOn: m.ExpiresOn,
                    status: m.MembershipStatus
                }))
        };

        res.status(200).json(student);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to retrieve student details."
        });
    }
}


// PUT update membership
async function updateMembership(req, res) {
    try {
        const membershipId = Number(req.params.membershipId);

        const { startsOn, expiresOn, status } = req.body;

        if (!Number.isInteger(membershipId) || membershipId <= 0) {
            return res.status(400).json({
                message: "Invalid membership ID."
            });
        }

        const isValidDate = (value) => {
            if (typeof value !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                return false;
            }

            const date = new Date(`${value}T00:00:00Z`);

            return !Number.isNaN(date.getTime()) &&
                date.toISOString().slice(0, 10) === value;
        };

        if (!isValidDate(startsOn) || !isValidDate(expiresOn)) {
            return res.status(400).json({
                message: "Please provide valid membership dates."
            });
        }

        if (expiresOn < startsOn) {
            return res.status(400).json({
                message: "Expiry date cannot be before the start date."
            });
        }

        const validStatuses = [
            "Active",
            "Suspended",
            "Cancelled"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid membership status."
            });
        }

        const updatedMembership =
            await membershipModel.updateMembership(
                membershipId,
                startsOn,
                expiresOn,
                status
            );

        if (!updatedMembership) {
            return res.status(404).json({
                message: "Membership record not found."
            });
        }

        res.status(200).json({
            message: "Membership updated successfully.",
            membership: updatedMembership
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update membership."
        });
    }
}


module.exports = {
    getAllMemberships,
    getMembershipByStudentId,
    updateMembership
};
