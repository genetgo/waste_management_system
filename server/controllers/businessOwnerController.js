const businessOwnerRepository = require("../repositories/businessOwnerRepository");
const municipalAdminRepository = require("../repositories/municipalAdminRepository");
const authService = require("../services/authService");
// =================================
// Get All Business Owners
// =================================
const getAllBusinessOwners = async (req, res, next) => {
    try {

        let kifleKetema = null;

        // Municipal Admin ከሆነ የራሱን ክፍለ ከተማ ብቻ ያያል
        if (req.user.role === "MUNICIPAL_ADMIN") {

            const admin =
                await municipalAdminRepository.getAdminById(req.user.id);

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: "Municipal administrator not found",
                });
            }

            kifleKetema = admin.assigned_kifle_ketema;
        }

        const businesses =
            await businessOwnerRepository.getAllBusinessOwners(kifleKetema);

        businesses.forEach((b) => delete b.password_hash);

        res.status(200).json({
            success: true,
            data: businesses,
        });

    } catch (error) {
        next(error);
    }
};
// =================================
// Get Business Owner By ID
// =================================
const getBusinessOwnerById = async (req, res, next) => {
    try {
        const business = await businessOwnerRepository.getBusinessOwnerById(
            req.params.id
        );

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business owner not found",
            });
        }

        delete business.password_hash;

        res.status(200).json({
            success: true,
            data: business,
        });
    } catch (error) {
        next(error);
    }
};


// ==========================================
// Register Business Owner
// ==========================================
const registerBusinessOwner = async (req, res, next) => {
    try {

        console.log("========== REGISTER BUSINESS OWNER ==========");

        // ==========================================
        // CREATE BUSINESS OWNER
        // ==========================================

        const business =
            await authService.registerBusinessOwner(
                req.body
            );

        console.log(
            "✅ BUSINESS OWNER CREATED:",
            business
        );

        // ==========================================
        // SOCKET NOTIFICATION
        // ==========================================

        try {

            const io = getSocket();

            if (!io) {

                console.log(
                    "⚠️ Socket instance not available"
                );

            } else {

                console.log(
                    "📡 Socket instance available"
                );

                // ======================================
                // GET ASSIGNED MUNICIPAL ADMINS
                // ======================================

                const admins =
                    await municipalAdminRepository
                        .getMunicipalAdminsByKifleKetema(
                            business.kifle_ketema
                        );

                console.log(
                    "MUNICIPAL ADMINS:",
                    admins
                );

                // ======================================
                // SEND NOTIFICATION
                // ======================================

                admins.forEach((admin) => {

                    const room =
                        `MUNICIPAL_ADMIN_${admin.id}`;

                    io.to(room).emit(
                        "newNotification",
                        {
                            title:
                                "New Business Owner Registered",

                            message:
                                `${business.full_name} has registered a new business in ${business.kifle_ketema}.`,

                            type:
                                "BUSINESS_OWNER_REGISTERED",

                            business_id:
                                business.id,

                            kifle_ketema:
                                business.kifle_ketema,

                            created_at:
                                new Date().toISOString(),
                        }
                    );

                    console.log(
                        "📨 BUSINESS NOTIFICATION SENT TO:",
                        room
                    );

                });

            }

        } catch (socketError) {

            // Socket failure should NOT
            // make registration fail

            console.error(
                "⚠️ BUSINESS SOCKET NOTIFICATION ERROR:",
                socketError
            );
        }

        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(201).json({

            success: true,

            message:
                "Business owner registered successfully",

            data: business,

        });

    } catch (error) {

        console.error(
            "REGISTER BUSINESS OWNER ERROR:",
            error
        );

        next(error);
    }

};

// =================================
// Update Business Owner
// =================================
const updateBusinessOwner = async (req, res, next) => {
    try {
        const payload = {
            ...req.body,
        };

        if (req.file) {
            payload.profile_image = req.file.filename;
        }

        const business = await businessOwnerRepository.updateBusinessOwner(
            req.params.id,
            payload
        );

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business owner not found",
            });
        }

        delete business.password_hash;

        res.status(200).json({
            success: true,
            message: "Business owner updated successfully",
            data: business,
        });
    } catch (error) {
        next(error);
    }
};

// =================================
// Delete Business Owner
// =================================
const deleteBusinessOwner = async (req, res, next) => {
    try {
        const business = await businessOwnerRepository.deleteBusinessOwner(
            req.params.id
        );

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business owner not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Business owner deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// =================================
// Get Logged-in Business Owner Profile
// =================================
const getMyProfile = async (req, res, next) => {
    try {
        if (req.user.role !== "BUSINESS_OWNER") {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const business = await businessOwnerRepository.getBusinessOwnerById(
            req.user.id
        );

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business profile not found",
            });
        }

        delete business.password_hash;

        res.status(200).json({
            success: true,
            data: business,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================

// ==========================================
const getDashboard = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Dashboard data loaded successfully",
            data: {} 
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 💡 አዲስ የተጨመረ፡ Update My Profile
// ==========================================
const updateMyProfile = async (req, res, next) => {
    try {
        const payload = {
            ...req.body,
        };

        if (req.file) {
            payload.profile_image = req.file.filename;
        }

        const business = await businessOwnerRepository.updateBusinessOwner(
            req.user.id,
            payload
        );

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        delete business.password_hash;

        res.status(200).json({
            success: true,
            message: "Your profile updated successfully",
            data: business,
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 💡 Get My Requests
// ==========================================
const getMyRequests = async (req, res, next) => {
    try {

        const businessId = req.user.id;

        console.log("MY REQUEST BUSINESS ID:", businessId);

        const requests =
            await requestRepository.getMyRequests(
                businessId
            );

        return res.status(200).json({
            success: true,
            data: requests
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllBusinessOwners,
    getBusinessOwnerById,
    registerBusinessOwner,
    updateBusinessOwner,
    deleteBusinessOwner,
    getMyProfile,
    getDashboard,      
    updateMyProfile,   
    getMyRequests,     
};