
const express = require("express");

const router = express.Router();

const membershipController =
    require("../controllers/membershipController");

// Retrieve all students and their latest membership
router.get(
    "/",
    membershipController.getAllMemberships
);

// Retrieve one student's details and membership history
router.get(
    "/student/:studentId",
    membershipController.getMembershipByStudentId
);

// Update a membership record
router.put(
    "/:membershipId",
    membershipController.updateMembership
);

module.exports = router;
