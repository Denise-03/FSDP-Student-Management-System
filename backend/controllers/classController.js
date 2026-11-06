
const classModel = require("../models/classModel");

async function getAllClasses(req, res) {
    try {
        const classes = await classModel.getAllClasses();

        res.status(200).json(classes);
    } catch (error) {
        console.error("Error retrieving classes:", error);

        res.status(500).json({
            message: "Failed to retrieve classes."
        });
    }
}

async function enrolStudent(req, res) {
    try {
        const { studentId, classSessionId } = req.body;

        if (
            !Number.isInteger(studentId) ||
            studentId <= 0 ||
            !Number.isInteger(classSessionId) ||
            classSessionId <= 0
        ) {
            return res.status(400).json({
                message: "Valid studentId and classSessionId are required."
            });
        }

        const result = await classModel.enrolStudent(
            studentId,
            classSessionId
        );

        res.status(201).json(result);

    } catch (error) {
        console.error("Enrolment error:", error);

        res.status(error.statusCode || 500).json({
            message: error.message || "Failed to enrol in class."
        });
    }
}

module.exports = {
    getAllClasses,
    enrolStudent
};
