const express = require("express");
const router = express.Router();

const collectionTeamController = require("../controllers/collectionTeamController");

// IMPORTANT:
// authMiddleware exports protect directly
const protect = require("../middleware/authMiddleware");

// roleMiddleware exports the function directly
const roleMiddleware = require("../middleware/roleMiddleware");


// ==========================================
// COLLECTION TEAM ROUTES
// Municipal Admin only
// ==========================================

// Create team
router.post(
    "/",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.createTeam
);

// Get all teams
router.get(
    "/",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.getAllTeams
);

// Get available collectors for Kebele
// MUST come before /:id
router.get(
    "/available-collectors/:kebele",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.getAvailableCollectors
);

// Get one team
router.get(
    "/:id",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.getTeamById
);

// Update team
router.put(
    "/:id",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.updateTeam
);

// Delete team
router.delete(
    "/:id",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.deleteTeam
);

// Add collector
router.post(
    "/:id/collectors",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.addCollector
);

// Remove collector
router.delete(
    "/:id/collectors/:collectorId",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.removeCollector
);

// Set team leader
router.put(
    "/:id/leader",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.setTeamLeader
);

// Remove team leader
router.delete(
    "/:id/leader",
    protect,
    roleMiddleware("MunicipalAdmin"),
    collectionTeamController.removeTeamLeader
);


module.exports = router;