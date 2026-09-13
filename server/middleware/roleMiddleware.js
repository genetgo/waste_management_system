const normalizeRole = (role) => {
    return String(role || "")
        .trim()
        .toUpperCase()
        .replace(/[\s_-]/g, "");
};

const roleMiddleware = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }

        const rawUserRole = req.user.role;
        const userRole = normalizeRole(rawUserRole);

        const allowedRoles = roles.map(normalizeRole);

        console.log("========== ROLE CHECK ==========");
        console.log("Raw User Role:", rawUserRole);
        console.log("Normalized User Role:", userRole);
        console.log("Allowed Roles:", roles);
        console.log("Normalized Allowed:", allowedRoles);
        console.log("User ID:", req.user.id);
        console.log("================================");

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden",
                userRole: rawUserRole,
                normalizedUserRole: userRole,
                allowedRoles: roles
            });
        }

        next();
    };
};

module.exports = roleMiddleware;