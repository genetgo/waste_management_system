
const express = require("express");

const router = express.Router();
const requestController = require("../controllers/requestController");


const protect = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");





// ==========================================
// Create On-Demand Request
// → Pending
// ==========================================
router.post(
    "/on-demand",
    protect,
    roleMiddleware("BUSINESS_OWNER"),
    requestController.createRequest
);


// ==========================================
// Get My Requests
// ==========================================
router.get(
    "/my-requests",
    protect,
    roleMiddleware("BUSINESS_OWNER"),
    requestController.getMyRequests
);


// ==========================================
// Cancel Request
// Pending / Approved → Cancelled
// ==========================================
router.patch(
    "/:id/cancel",
    protect,
    roleMiddleware("BUSINESS_OWNER"),
    requestController.cancelRequest
);


// ==========================================
// Confirm Collection
// Collected → Completed
// ==========================================
router.patch(
    "/:id/confirm",
    protect,
    roleMiddleware("BUSINESS_OWNER"),
    requestController.confirmCompletion
);



// =====================================================
// MUNICIPAL ADMINISTRATOR
// =====================================================


// ==========================================
// Get Pending Requests
// ==========================================
router.get(
    "/pending",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN"),
    requestController.getPendingRequests
);


// ==========================================
// Approve Request
// Pending → Approved
// ==========================================
router.patch(
    "/:id/approve",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN"),
    requestController.approveRequest
);


// ==========================================
// Reject Request
// Pending → Rejected
// ==========================================
router.patch(
    "/:id/reject",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN"),
    requestController.rejectRequest
);


// ==========================================
// Assign Collector
// Approved → Assigned
// ==========================================
router.patch(
    "/:id/assign",
    protect,
    roleMiddleware("MUNICIPAL_ADMIN"),
    requestController.assignCollector
);



// =====================================================
// COLLECTOR
// =====================================================


// ==========================================
// Get My Assigned Requests
// ==========================================
router.get(
    "/collector/my-requests",
    protect,
    roleMiddleware("COLLECTOR"),
    requestController.getMyCollectorRequests
);


// ==========================================
// Start Collection
// Assigned → In Progress
// ==========================================
router.patch(
    "/:id/start",
    protect,
    roleMiddleware("COLLECTOR"),
    requestController.startCollection
);


// ==========================================
// Collected Successfully
// In Progress → Collected
// ==========================================
router.patch(
    "/:id/collect",
    protect,
    roleMiddleware("COLLECTOR"),
    requestController.completeCollection
);



// =====================================================
// SYSTEM ADMIN + MUNICIPAL ADMIN
// =====================================================


// ==========================================
// Get All Requests
// ==========================================
router.get(
    "/",
    protect,
    roleMiddleware(
        "SYSTEM_ADMIN",
        "MUNICIPAL_ADMIN"
    ),
    requestController.getAllRequests
);


// ==========================================
// Get Single Request
// ==========================================
router.get(
    "/:id",
    protect,
    requestController.getRequestById
);



// =====================================================
// SYSTEM ADMIN
// =====================================================


// ==========================================
// Delete Request
// ==========================================
router.delete(
    "/:id",
    protect,
    roleMiddleware("SYSTEM_ADMIN"),
    requestController.deleteRequest
);


module.exports = router;
