const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
const residentRepository = require("../repositories/residentRepository");
const businessOwnerRepository = require("../repositories/businessOwnerRepository");
const collectorRepository = require("../repositories/collectorRepository");
const municipalAdminRepository = require("../repositories/municipalAdminRepository");
const systemAdminRepository = require("../repositories/systemAdminRepository");
const sendNotification = require("../utils/sendNotification");
class AuthService {

    // ==========================================
    // LOGIN
    // ==========================================
    async login(credentials = {}) {

        const identifier = String(
            credentials.email ||
            credentials.username ||
            credentials.phone ||
            ""
        ).toLowerCase().trim();

        const password = credentials.password;

        if (!identifier || !password) {
            throw new Error(
                "Email/Username/Phone and Password are required."
            );
        }

        let user = null;
        let role = null;

        // ==========================================
        // 1. RESIDENT
        // ==========================================
        user = await residentRepository.getResidentByEmail(identifier);

        if (user) {
            role = "RESIDENT";
        }

        // ==========================================
        // 2. BUSINESS OWNER
        // ==========================================
        if (!user) {
            user = await businessOwnerRepository.getBusinessOwnerByEmail(
                identifier
            );

            if (user) {
                role = "BUSINESS_OWNER";
            }
        }

        // ==========================================
        // 3. COLLECTOR
        // ==========================================
        if (!user) {
            user = await collectorRepository.getCollectorByEmail(
                identifier
            );

            if (user) {
                role = "COLLECTOR";
            }
        }

        // ==========================================
        // 4. MUNICIPAL ADMIN
        // ==========================================
        if (!user) {
            user = await municipalAdminRepository.getMunicipalAdminByEmail(
                identifier
            );

            if (user) {
                role = "MUNICIPAL_ADMIN";
            }
        }

        // ==========================================
        // 5. SYSTEM ADMIN
        // ==========================================
        if (!user) {
            user = await systemAdminRepository.getSystemAdminByEmailOrUsername(
                identifier
            );

            if (user) {
                role = "SYSTEM_ADMIN";
            }
        }

        // ==========================================
        // USER NOT FOUND
        // ==========================================
        if (!user) {
            throw new Error("Invalid email or password.");
        }

        // ==========================================
        // ACCOUNT STATUS CHECK
        // ==========================================
        if (user.is_active === false) {

            console.log("========== INACTIVE ACCOUNT ==========");
            console.log("Role:", role);

            const userId =
                user.resident_id ??
                user.business_id ??
                user.collector_id ??
                user.admin_id ??
                user.system_admin_id;

            console.log("User ID:", userId);
            console.log("Email:", user.email);
            console.log("======================================");

            let contact = null;

            try {
                contact =
                    await systemAdminRepository.getInactiveAccountContact(
                        role
                    );
            } catch (contactError) {
                console.error(
                    "Could not get inactive account contact:",
                    contactError.message
                );
            }

            const error = new Error(
                "Your account is inactive. Please contact the administrator."
            );

            error.statusCode = 403;
            error.code = "ACCOUNT_INACTIVE";
            error.contact = contact || null;

            throw error;
        }

        // ==========================================
        // PASSWORD EXISTS
        // ==========================================
        if (!user.password_hash) {
            throw new Error("Account password is unavailable.");
        }

        // ==========================================
        // PASSWORD CHECK
        // ==========================================
        const validPassword = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!validPassword) {
            throw new Error("Invalid email or password.");
        }

        // ==========================================
        // UPDATE LAST LOGIN
        // ==========================================
        if (
            role === "SYSTEM_ADMIN" &&
            typeof systemAdminRepository.updateLastLogin === "function"
        ) {
            await systemAdminRepository.updateLastLogin(
                user.system_admin_id
            );
        }

        // ==========================================
        // GET USER ID
        // ==========================================
        const userId =
            user.resident_id ??
            user.business_id ??
            user.collector_id ??
            user.admin_id ??
            user.system_admin_id;

        // ==========================================
        // CREATE JWT
        // ==========================================
        const token = jwt.sign(
            {
                id: userId,
                role,

                assigned_kifle_ketema:
                    user.assigned_kifle_ketema ||
                    user.kifle_ketema ||
                    null,

                kebele:
                    user.kebele || null
            },

            process.env.JWT_SECRET || "fallback_secret_key",

            {
                expiresIn:
                    process.env.JWT_EXPIRE || "1d"
            }
        );

        // ==========================================
        // REMOVE PASSWORD
        // ==========================================
        delete user.password_hash;

        // ==========================================
        // RETURN LOGIN DATA
        // ==========================================
        return {
            token,
            role,
            user
        };
    }


    // ==========================================
    // REGISTER RESIDENT
    // ==========================================
    async registerResident(data) {

        if (!data.email) {
            throw new Error("Email is required.");
        }

        const email = data.email.toLowerCase().trim();

        const existingEmail =
            await residentRepository.getResidentByEmail(email);

        if (existingEmail) {
            throw new Error("Email already exists.");
        }

        if (
            data.phone_number &&
            typeof residentRepository.getResidentByPhone === "function"
        ) {

            const existingPhone =
                await residentRepository.getResidentByPhone(
                    data.phone_number.trim()
                );

            if (existingPhone) {
                throw new Error("Phone number already exists.");
            }
        }

        const {
            password,
            confirmPassword,
            ...resident
        } = data;

        if (!password) {
            throw new Error("Password is required.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const password_hash =
            await bcrypt.hash(password, 10);

        const formattedResident = {
            ...resident,

            email,

            password_hash,

            full_name:
                resident.full_name?.trim(),

            phone_number:
                resident.phone_number?.trim(),

            kifle_ketema:
                resident.kifle_ketema?.trim(),

            kebele:
                resident.kebele?.trim(),

            sefer:
                resident.sefer?.trim()
        };

        const newResident =
            await residentRepository.createResident(
                formattedResident
            );

        
// ==========================================
// NOTIFY MUNICIPAL ADMIN OF SAME KIFLE KETEMA
// ==========================================

try {

    const admins =
        await municipalAdminRepository
            .getMunicipalAdminsByKifleKetema(
                newResident.kifle_ketema
            );

    console.log(
        "========== MUNICIPAL ADMINS FOR AREA =========="
    );

    console.log(
        "KIFLE KETEMA:",
        newResident.kifle_ketema
    );

    console.log(
        "ADMINS:",
        admins
    );

    for (const admin of admins) {

        await sendNotification({

            user_id:
                admin.admin_id,

            user_role:
                "MUNICIPAL_ADMIN",

            title:
                "New Resident Registration",

            message:
                `${newResident.full_name} has registered as a new resident in ${newResident.kifle_ketema}.`
        });
    }

} catch (err) {

    console.error(
        "Resident Notification Error:",
        err
    );
}
        if (newResident.password_hash) {
            delete newResident.password_hash;
        }

        return newResident;
    }


    // ==========================================
    // REGISTER BUSINESS OWNER
    // ==========================================
    async registerBusinessOwner(data) {

        if (!data.email) {
            throw new Error("Email is required.");
        }

        const email =
            data.email.toLowerCase().trim();

        const existing =
            await businessOwnerRepository.getBusinessOwnerByEmail(
                email
            );

        if (existing) {
            throw new Error("Email already exists.");
        }

        const {
            password,
            confirmPassword,
            ...business
        } = data;

        if (!password) {
            throw new Error("Password is required.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const password_hash =
            await bcrypt.hash(password, 10);

        const formattedBusiness = {
            ...business,

            email,

            password_hash,

            business_description:
                business.business_description || null,

            kifle_ketema:
                business.kifle_ketema
                    ? business.kifle_ketema.trim()
                    : null,

            kebele:
                business.kebele
                    ? business.kebele.trim()
                    : null,

            sefer:
                business.sefer
                    ? business.sefer.trim()
                    : null
        };

        const newBusinessOwner =
            await businessOwnerRepository.createBusinessOwner(
                formattedBusiness
            );

        // ==========================================
// NOTIFY MUNICIPAL ADMIN OF SAME KIFLE KETEMA
// ==========================================

try {

    const admins =
        await municipalAdminRepository
            .getMunicipalAdminsByKifleKetema(
                newBusinessOwner.kifle_ketema
            );

    console.log(
        "========== MUNICIPAL ADMINS FOR BUSINESS AREA =========="
    );

    console.log(
        "KIFLE KETEMA:",
        newBusinessOwner.kifle_ketema
    );

    console.log(
        "ADMINS:",
        admins
    );

    for (const admin of admins) {

        await sendNotification({

            user_id:
                admin.admin_id,

            user_role:
                "MUNICIPAL_ADMIN",

            title:
                "New Business Registration",

            message:
                `${newBusinessOwner.business_name} has registered as a new business owner in ${newBusinessOwner.kifle_ketema}.`
        });
    }

} catch (err) {

    console.error(
        "Business Notification Error:",
        err
    );
}
        if (newBusinessOwner.password_hash) {
            delete newBusinessOwner.password_hash;
        }

        return newBusinessOwner;
    }


    // ==========================================
    // REGISTER COLLECTOR
    // ==========================================
    async registerCollector(data) {

        if (!data.email) {
            throw new Error("Email is required.");
        }

        const email =
            data.email.toLowerCase().trim();

        const existing =
            await collectorRepository.getCollectorByEmail(email);

        if (existing) {
            throw new Error("Email already exists.");
        }

        const {
            password,
            confirmPassword,
            ...collector
        } = data;

        if (!password) {
            throw new Error("Password is required.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const password_hash =
            await bcrypt.hash(password, 10);

        const newCollector =
            await collectorRepository.createCollector({
                ...collector,
                email,
                password_hash
            });

        // ==========================================
// NOTIFY MUNICIPAL ADMIN OF SAME KIFLE KETEMA
// ==========================================

try {

    const admins =
        await municipalAdminRepository
            .getMunicipalAdminsByKifleKetema(
                newCollector.kifle_ketema
            );

    console.log(
        "========== MUNICIPAL ADMINS FOR COLLECTOR AREA =========="
    );

    console.log(
        "KIFLE KETEMA:",
        newCollector.kifle_ketema
    );

    console.log(
        "ADMINS:",
        admins
    );

    for (const admin of admins) {

        await sendNotification({

            user_id:
                admin.admin_id,

            user_role:
                "MUNICIPAL_ADMIN",

            title:
                "New Collector Registration",

            message:
                `${newCollector.full_name} has been registered as a new collector in ${newCollector.kifle_ketema}.`
        });
    }

} catch (err) {

    console.error(
        "Collector Notification Error:",
        err
    );
}

        if (newCollector.password_hash) {
            delete newCollector.password_hash;
        }

        return newCollector;
    }


    // ==========================================
    // REGISTER MUNICIPAL ADMIN
    // ==========================================
    async registerMunicipalAdmin(data) {

        if (!data.email) {
            throw new Error("Email is required.");
        }

        const email =
            data.email.toLowerCase().trim();

        const existing =
            await municipalAdminRepository.getMunicipalAdminByEmail(
                email
            );

        if (existing) {
            throw new Error("Email already exists.");
        }

        const {
            password,
            confirmPassword,
            ...admin
        } = data;

        if (!password) {
            throw new Error("Password is required.");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match.");
        }

        const password_hash =
            await bcrypt.hash(password, 10);

        const newAdmin =
            await municipalAdminRepository.createMunicipalAdmin({
                ...admin,
                email,
                password_hash
            });

        // ==========================================
        // NOTIFY SYSTEM ADMINS
        // ==========================================
        try {

            const systemAdmins =
                await systemAdminRepository.getAllSystemAdmins();

            for (const admin of systemAdmins) {

                await sendNotification({
    user_id: admin.system_admin_id,
    user_role: "SYSTEM_ADMIN",
    title: "New Municipal Administrator",
    message:
        `${newAdmin.full_name} has been registered as a Municipal Administrator.`
});
            }

        } catch (err) {

            console.error(
                "Municipal Admin Notification Error:",
                err.message
            );
        }

        if (newAdmin.password_hash) {
            delete newAdmin.password_hash;
        }

        return newAdmin;
    }


    // ==========================================
    // GET CURRENT USER PROFILE
    // ==========================================
    async getProfile(userPayload) {

        const {
            id,
            role
        } = userPayload;

        let user = null;

        switch (role) {

            case "RESIDENT":
                user =
                    await residentRepository.getResidentById(id);
                break;

            case "BUSINESS_OWNER":
                user =
                    await businessOwnerRepository.getBusinessOwnerById(id);
                break;

            case "COLLECTOR":
                user =
                    await collectorRepository.getCollectorById(id);
                break;

            case "MUNICIPAL_ADMIN":
                user =
                    await municipalAdminRepository.getMunicipalAdminById(id);
                break;

            case "SYSTEM_ADMIN":
                user =
                    await systemAdminRepository.getSystemAdminById(id);
                break;

            default:
                throw new Error("Invalid user role");
        }

        if (!user) {
            throw new Error("User not found");
        }

        delete user.password_hash;

        return user;
    }


    // ==========================================
    // UPDATE USER PROFILE
    // ==========================================
    async updateProfile(userPayload, updateData) {

        const {
            id,
            role
        } = userPayload;

        const data = {
            ...updateData
        };

        if (data.email) {
            data.email =
                data.email.toLowerCase().trim();
        }

        if (data.password) {

            data.password_hash =
                await bcrypt.hash(
                    data.password,
                    10
                );

            delete data.password;
        }

        let updatedUser = null;

        switch (role) {

            case "RESIDENT":

                updatedUser =
                    await residentRepository.updateResident(
                        id,
                        data
                    );

                break;

            case "BUSINESS_OWNER":

                updatedUser =
                    await businessOwnerRepository.updateBusinessOwner(
                        id,
                        data
                    );

                break;

            case "COLLECTOR":

                updatedUser =
                    await collectorRepository.updateCollector(
                        id,
                        data
                    );

                break;

            case "MUNICIPAL_ADMIN":

                updatedUser =
                    await municipalAdminRepository.updateMunicipalAdmin(
                        id,
                        data
                    );

                break;

            case "SYSTEM_ADMIN":

                updatedUser =
                    await systemAdminRepository.updateSystemAdmin(
                        id,
                        data
                    );

                break;

            default:
                throw new Error("Invalid user role");
        }

        if (!updatedUser) {
            throw new Error("User not found");
        }

        delete updatedUser.password_hash;

        return updatedUser;
    }


    // ==========================================
    // VERIFY TOKEN
    // ==========================================
    verifyToken(token) {

        return jwt.verify(
            token,
            process.env.JWT_SECRET ||
            "fallback_secret_key"
        );
    }


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================
    async changePassword(userPayload, data) {

        const {
            id,
            role
        } = userPayload;

        const {
            currentPassword,
            newPassword
        } = data;

        if (!currentPassword || !newPassword) {
            throw new Error(
                "Current password and new password are required."
            );
        }

        if (newPassword.length < 6) {
            throw new Error(
                "New password must be at least 6 characters."
            );
        }

        let user = null;

        switch (role) {

            case "RESIDENT":
                user =
                    await residentRepository.getResidentById(id);
                break;

            case "BUSINESS_OWNER":
                user =
                    await businessOwnerRepository.getBusinessOwnerById(id);
                break;

            case "COLLECTOR":
                user =
                    await collectorRepository.getCollectorById(id);
                break;

            case "MUNICIPAL_ADMIN":
                user =
                    await municipalAdminRepository.getMunicipalAdminById(id);
                break;

            case "SYSTEM_ADMIN":
                user =
                    await systemAdminRepository.getSystemAdminById(id);
                break;

            default:
                throw new Error("Invalid user role");
        }

        if (!user) {
            throw new Error("User not found");
        }

        if (!user.password_hash) {
            throw new Error(
                "Current password is unavailable."
            );
        }

        const match =
            await bcrypt.compare(
                currentPassword,
                user.password_hash
            );

        if (!match) {
            throw new Error(
                "Current password is incorrect"
            );
        }

        const password_hash =
            await bcrypt.hash(
                newPassword,
                10
            );

        switch (role) {

            case "RESIDENT":

                await residentRepository.updateResident(
                    id,
                    { password_hash }
                );

                break;

            case "BUSINESS_OWNER":

                if (
                    typeof businessOwnerRepository.updatePassword ===
                    "function"
                ) {
                    await businessOwnerRepository.updatePassword(
                        id,
                        password_hash
                    );
                } else {
                    await businessOwnerRepository.updateBusinessOwner(
                        id,
                        { password_hash }
                    );
                }

                break;

            case "COLLECTOR":

                await collectorRepository.updateCollector(
                    id,
                    { password_hash }
                );

                break;

            case "MUNICIPAL_ADMIN":

                await municipalAdminRepository.updateMunicipalAdmin(
                    id,
                    { password_hash }
                );

                break;

            case "SYSTEM_ADMIN":

                await systemAdminRepository.updateSystemAdmin(
                    id,
                    { password_hash }
                );

                break;
        }

        return true;
    }


   // ==========================================
// FORGOT PASSWORD
// ==========================================
async forgotPassword(identifier) {

    if (!identifier || !identifier.trim()) {
        throw new Error(
            "Email or phone number is required."
        );
    }

    const value = identifier.trim();

    console.log(
        "========== FORGOT PASSWORD =========="
    );
    console.log("Identifier:", value);

    let user = null;
    let userId = null;
    let userRole = null;

    // ==========================================
    // 1. RESIDENT
    // ==========================================
    user =
        await residentRepository.getResidentByEmail(value);

    if (!user) {

        if (
            typeof residentRepository.getResidentByPhone ===
            "function"
        ) {
            user =
                await residentRepository.getResidentByPhone(
                    value
                );
        }
    }

    if (user) {
        userId = user.resident_id;
        userRole = "RESIDENT";
    }

    // ==========================================
    // 2. BUSINESS OWNER
    // ==========================================
    if (!user) {

        user =
            await businessOwnerRepository
                .getBusinessOwnerByEmail(value);

        if (user) {
            userId = user.business_id;
            userRole = "BUSINESS_OWNER";
        }
    }

    // ==========================================
    // 3. COLLECTOR
    // ==========================================
    if (!user) {

        user =
            await collectorRepository
                .getCollectorByEmail(value);

        if (user) {
            userId = user.collector_id;
            userRole = "COLLECTOR";
        }
    }

    // ==========================================
    // 4. MUNICIPAL ADMIN
    // ==========================================
    if (!user) {

        user =
            await municipalAdminRepository
                .getMunicipalAdminByEmail(value);

        if (user) {
            userId = user.admin_id;
            userRole = "MUNICIPAL_ADMIN";
        }
    }

    // ==========================================
    // 5. SYSTEM ADMIN
    // ==========================================
    if (!user) {

        user =
            await systemAdminRepository
                .getSystemAdminByEmailOrUsername(value);

        if (user) {
            userId = user.system_admin_id;
            userRole = "SYSTEM_ADMIN";
        }
    }

    // ==========================================
    // USER NOT FOUND
    // ==========================================
    if (!user) {

        console.log(
            "Forgot password user not found:",
            value
        );

        throw new Error(
            "No account found with this email or phone number."
        );
    }

    console.log("User ID:", userId);
    console.log("User Role:", userRole);

    // ==========================================
    // GENERATE RESET TOKEN
    // ==========================================
    const resetToken =
        crypto.randomBytes(32).toString("hex");

    // ==========================================
    // HASH TOKEN
    // ==========================================
    const tokenHash =
        crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

    // ==========================================
    // TOKEN EXPIRATION
    // 15 MINUTES
    // ==========================================
    const expiresAt =
        new Date(Date.now() + 15 * 60 * 1000);

    // ==========================================
    // INVALIDATE OLD TOKENS
    // ==========================================
    await pool.query(
        `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
          AND user_role = $2
          AND used_at IS NULL
        `,
        [
            userId,
            userRole
        ]
    );

    // ==========================================
    // SAVE NEW TOKEN
    // ==========================================
    await pool.query(
        `
        INSERT INTO password_reset_tokens
        (
            user_id,
            user_role,
            token_hash,
            expires_at
        )
        VALUES ($1, $2, $3, $4)
        `,
        [
            userId,
            userRole,
            tokenHash,
            expiresAt
        ]
    );

    console.log(
        "RESET TOKEN CREATED SUCCESSFULLY"
    );

    console.log(
        "User ID:",
        userId
    );

    console.log(
        "Role:",
        userRole
    );

    console.log(
        "Expires:",
        expiresAt
    );

    // ==========================================
    // DEVELOPMENT RESPONSE
    // ==========================================
    return {
        message:
            "Password reset request received.",

        resetToken
    };
}


// ==========================================
// RESET PASSWORD
// ==========================================
async resetPassword(data) {

    if (!data) {
        throw new Error(
            "Reset data is required."
        );
    }

    const {
        token,
        newPassword,
        confirmPassword
    } = data;

    // ==========================================
    // VALIDATION
    // ==========================================
    if (!token) {
        throw new Error(
            "Reset token is required."
        );
    }

    if (!newPassword) {
        throw new Error(
            "New password is required."
        );
    }

    if (!confirmPassword) {
        throw new Error(
            "Confirm password is required."
        );
    }

    if (newPassword !== confirmPassword) {
        throw new Error(
            "Passwords do not match."
        );
    }

    if (newPassword.length < 6) {
        throw new Error(
            "Password must be at least 6 characters."
        );
    }

    // ==========================================
    // HASH RECEIVED TOKEN
    // ==========================================
    const tokenHash =
        crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

    console.log(
        "========== RESET PASSWORD =========="
    );

    console.log(
        "Token hash:",
        tokenHash
    );

    // ==========================================
    // FIND VALID TOKEN
    // ==========================================
    const result =
        await pool.query(
            `
            SELECT
                id,
                user_id,
                user_role,
                expires_at,
                used_at
            FROM password_reset_tokens
            WHERE token_hash = $1
              AND used_at IS NULL
            LIMIT 1
            `,
            [tokenHash]
        );

    if (result.rows.length === 0) {

        throw new Error(
            "Invalid or already used reset token."
        );
    }

    const resetRecord =
        result.rows[0];

    // ==========================================
    // CHECK EXPIRATION
    // ==========================================
    if (
        new Date(resetRecord.expires_at)
        <= new Date()
    ) {

        throw new Error(
            "Reset token has expired. Please request a new one."
        );
    }

    console.log(
        "Reset User ID:",
        resetRecord.user_id
    );

    console.log(
        "Reset User Role:",
        resetRecord.user_role
    );

    // ==========================================
    // HASH NEW PASSWORD
    // ==========================================
    const passwordHash =
        await bcrypt.hash(
            newPassword,
            10
        );

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================
    switch (resetRecord.user_role) {

        case "RESIDENT":

            await residentRepository.updateResident(
                resetRecord.user_id,
                {
                    password_hash: passwordHash
                }
            );

            break;


        case "BUSINESS_OWNER":

            if (
                typeof businessOwnerRepository
                    .updatePassword === "function"
            ) {

                await businessOwnerRepository.updatePassword(
                    resetRecord.user_id,
                    passwordHash
                );

            } else {

                await businessOwnerRepository
                    .updateBusinessOwner(
                        resetRecord.user_id,
                        {
                            password_hash: passwordHash
                        }
                    );
            }

            break;


        case "COLLECTOR":

            await collectorRepository.updateCollector(
                resetRecord.user_id,
                {
                    password_hash: passwordHash
                }
            );

            break;


        case "MUNICIPAL_ADMIN":

            await municipalAdminRepository
                .updateMunicipalAdmin(
                    resetRecord.user_id,
                    {
                        password_hash: passwordHash
                    }
                );

            break;


        case "SYSTEM_ADMIN":

            await systemAdminRepository
                .updateSystemAdmin(
                    resetRecord.user_id,
                    {
                        password_hash: passwordHash
                    }
                );

            break;


        default:

            throw new Error(
                "Invalid user role in reset token."
            );
    }

    // ==========================================
    // MARK TOKEN AS USED
    // ==========================================
    await pool.query(
        `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [resetRecord.id]
    );

    console.log(
        "PASSWORD RESET SUCCESSFUL"
    );

    // ==========================================
    // RESPONSE
    // ==========================================
    return {
        message:
            "Password reset completed successfully."
    };
}
}


// ==========================================
// EXPORT
// ==========================================
module.exports = new AuthService();