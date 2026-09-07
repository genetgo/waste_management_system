const authService = require("../services/authService");


// ==========================================
// Login
// ==========================================
exports.login = async (req, res, next) => {
    try {

        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });

    } catch (error) {

        console.error("===== LOGIN ERROR =====");
        console.error(error);

        // ==========================================
        // INACTIVE ACCOUNT
        // ==========================================
        if (error.code === "ACCOUNT_INACTIVE") {

            return res.status(403).json({
                success: false,
                code: "ACCOUNT_INACTIVE",
                message:
                    "Your account is inactive. Please contact the administrator.",
                contact: error.contact || null,
            });
        }

        // ==========================================
        // INVALID LOGIN
        // ==========================================
        if (
            error.message === "Invalid email or password." ||
            error.message === "Invalid email or password"
        ) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // ==========================================
        // OTHER ERRORS
        // ==========================================
        next(error);
    }
};


// ==========================================
// Resident Registration
// ==========================================
exports.registerResident = async (req, res) => {

    console.log("=====================================");
    console.log("REGISTER ENDPOINT HIT");
    console.log("BODY:", req.body);
    console.log("=====================================");

    try {

        console.log(
            "STEP 1: Calling authService.registerResident()"
        );

        const resident =
            await authService.registerResident(req.body);

        console.log(
            "STEP 2: Resident created successfully"
        );

        console.log(resident);

        return res.status(201).json({
            success: true,
            message: "Resident registered successfully.",
            data: resident,
        });

    } catch (error) {

        console.log("========== REGISTER FAILED ==========");
        console.log("Error Name:", error.name);
        console.log("Error Message:", error.message);
        console.log("Error Code:", error.code);
        console.log("Error Detail:", error.detail);
        console.log("Error Constraint:", error.constraint);
        console.log("Full Error:", error);
        console.log(error.stack);
        console.log("=====================================");

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
        });
    }
};


// ==========================================
// Business Owner Registration
// ==========================================
exports.registerBusinessOwner = async (req, res) => {

    console.log(
        "===== BUSINESS REGISTER REQUEST ====="
    );

    console.log(req.body);

    try {

        const business =
            await authService.registerBusinessOwner(
                req.body
            );

        console.log(
            "===== BUSINESS REGISTER SUCCESS ====="
        );

        console.log(business);

        return res.status(201).json({
            success: true,
            message: "Business Owner registered successfully.",
            data: business,
        });

    } catch (error) {

        console.log(
            "===== BUSINESS REGISTER ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code || null,
        });
    }
};


// ==========================================
// Collector Registration
// ==========================================
exports.registerCollector = async (req, res) => {

    console.log(
        "===== COLLECTOR REGISTER REQUEST ====="
    );

    console.log(req.body);

    try {

        const collector =
            await authService.registerCollector(
                req.body
            );

        console.log(
            "===== COLLECTOR REGISTER SUCCESS ====="
        );

        console.log(collector);

        return res.status(201).json({
            success: true,
            message: "Collector registered successfully.",
            data: collector,
        });

    } catch (error) {

        console.log(
            "===== COLLECTOR REGISTER ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code || null,
        });
    }
};


// ==========================================
// Municipal Admin Registration
// ==========================================
exports.registerMunicipalAdmin = async (req, res) => {

    console.log(
        "===== MUNICIPAL ADMIN REGISTER REQUEST ====="
    );

    console.log(req.body);

    try {

        const admin =
            await authService.registerMunicipalAdmin(
                req.body
            );

        console.log(
            "===== MUNICIPAL ADMIN REGISTER SUCCESS ====="
        );

        console.log(admin);

        return res.status(201).json({
            success: true,
            message:
                "Municipal Admin registered successfully.",
            data: admin,
        });

    } catch (error) {

        console.log(
            "===== MUNICIPAL ADMIN REGISTER ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code || null,
        });
    }
};


// ==========================================
// Change Password
// ==========================================
exports.changePassword = async (req, res) => {

    try {

        await authService.changePassword(
            req.user,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {

        console.log(
            "===== CHANGE PASSWORD ERROR ====="
        );

        console.log(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Forgot Password
// ==========================================
exports.forgotPassword = async (req, res) => {

    try {

        const result =
            await authService.forgotPassword(
                req.body.identifier
            );

        return res.status(200).json({
            success: true,
            message: result.message,
            resetToken: result.resetToken
        });

    } catch (error) {

        console.log(
            "===== FORGOT PASSWORD ERROR ====="
        );

        console.log(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Reset Password
// ==========================================
exports.resetPassword = async (req, res) => {

    try {

        const result =
            await authService.resetPassword(
                req.body
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        console.log(
            "===== RESET PASSWORD ERROR ====="
        );

        console.log(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Logout
// ==========================================
exports.logout = async (req, res) => {

    return res.status(200).json({
        success: true,
        message: "Logout successful.",
    });
};


// ==========================================
// Get Current User Profile
// ==========================================
exports.getProfile = async (req, res) => {

    try {

        const user =
            await authService.getProfile(
                req.user
            );

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {

        console.log(
            "===== GET PROFILE ERROR ====="
        );

        console.log(error);

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Update Profile
// ==========================================
exports.updateProfile = async (req, res) => {

    try {

        const updatedUser =
            await authService.updateProfile(
                req.user,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
        });

    } catch (error) {

        console.log(
            "===== UPDATE PROFILE ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// Resident Registration
// ==========================================
exports.registerResident = async (req, res) => {

    console.log("=====================================");
    console.log("REGISTER ENDPOINT HIT");
    console.log("BODY:", req.body);
    console.log("=====================================");

    try {

        console.log(
            "STEP 1: Calling authService.registerResident()"
        );

        const resident =
            await authService.registerResident(req.body);

        console.log(
            "STEP 2: Resident created successfully"
        );

        console.log(resident);

        return res.status(201).json({
            success: true,
            message: "Resident registered successfully.",
            data: resident,
        });

    } catch (error) {

        console.log("========== REGISTER FAILED ==========");
        console.log("Error Name:", error.name);
        console.log("Error Message:", error.message);
        console.log("Error Code:", error.code);
        console.log("Error Detail:", error.detail);
        console.log("Error Constraint:", error.constraint);
        console.log("Full Error:", error);
        console.log(error.stack);
        console.log("=====================================");

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code,
            detail: error.detail,
            constraint: error.constraint,
        });
    }
};


// ==========================================
// Business Owner Registration
// ==========================================
exports.registerBusinessOwner = async (req, res) => {

    console.log(
        "===== BUSINESS REGISTER REQUEST ====="
    );

    console.log(req.body);

    try {

        const business =
            await authService.registerBusinessOwner(
                req.body
            );

        console.log(
            "===== BUSINESS REGISTER SUCCESS ====="
        );

        console.log(business);

        return res.status(201).json({
            success: true,
            message: "Business Owner registered successfully.",
            data: business,
        });

    } catch (error) {

        console.log(
            "===== BUSINESS REGISTER ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code || null,
        });
    }
};


// ==========================================
// Collector Registration
// ==========================================
exports.registerCollector = async (req, res) => {

    console.log(
        "===== COLLECTOR REGISTER REQUEST ====="
    );

    console.log(req.body);

    try {

        const collector =
            await authService.registerCollector(
                req.body
            );

        console.log(
            "===== COLLECTOR REGISTER SUCCESS ====="
        );

        console.log(collector);

        return res.status(201).json({
            success: true,
            message: "Collector registered successfully.",
            data: collector,
        });

    } catch (error) {

        console.log(
            "===== COLLECTOR REGISTER ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code || null,
        });
    }
};


// ==========================================
// Municipal Admin Registration
// ==========================================
exports.registerMunicipalAdmin = async (req, res) => {

    console.log(
        "===== MUNICIPAL ADMIN REGISTER REQUEST ====="
    );

    console.log(req.body);

    try {

        const admin =
            await authService.registerMunicipalAdmin(
                req.body
            );

        console.log(
            "===== MUNICIPAL ADMIN REGISTER SUCCESS ====="
        );

        console.log(admin);

        return res.status(201).json({
            success: true,
            message:
                "Municipal Admin registered successfully.",
            data: admin,
        });

    } catch (error) {

        console.log(
            "===== MUNICIPAL ADMIN REGISTER ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
            code: error.code || null,
        });
    }
};


// ==========================================
// Change Password
// ==========================================
exports.changePassword = async (req, res) => {

    try {

        await authService.changePassword(
            req.user,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {

        console.log(
            "===== CHANGE PASSWORD ERROR ====="
        );

        console.log(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Forgot Password
// ==========================================
exports.forgotPassword = async (req, res) => {

    try {

        const { identifier } = req.body;

        console.log(
            "===== FORGOT PASSWORD REQUEST ====="
        );

        console.log(
            "Identifier:",
            identifier
        );

        if (!identifier || !identifier.trim()) {

            return res.status(400).json({
                success: false,
                message:
                    "Email or phone number is required."
            });
        }

        const result =
            await authService.forgotPassword(
                identifier.trim()
            );

        return res.status(200).json({
            success: true,
            message: result.message,
            resetToken: result.resetToken
        });

    } catch (error) {

        console.log(
            "===== FORGOT PASSWORD ERROR ====="
        );

        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Reset Password
// ==========================================
exports.resetPassword = async (req, res) => {

    try {

        const result =
            await authService.resetPassword(
                req.body
            );

        return res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (error) {

        console.log(
            "===== RESET PASSWORD ERROR ====="
        );

        console.log(error);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Logout
// ==========================================
exports.logout = async (req, res) => {

    return res.status(200).json({
        success: true,
        message: "Logout successful.",
    });
};


// ==========================================
// Get Current User Profile
// ==========================================
exports.getProfile = async (req, res) => {

    try {

        const user =
            await authService.getProfile(
                req.user
            );

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {

        console.log(
            "===== GET PROFILE ERROR ====="
        );

        console.log(error);

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};


// ==========================================
// Update Profile
// ==========================================
exports.updateProfile = async (req, res) => {

    try {

        const updatedUser =
            await authService.updateProfile(
                req.user,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
        });

    } catch (error) {

        console.log(
            "===== UPDATE PROFILE ERROR ====="
        );

        console.log(error);
        console.log(error.stack);

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};