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

        const userRole = normalizeRole(req.user.role);
        const allowedRoles = roles.map(normalizeRole);

        console.log("========== ROLE CHECK ==========");
        console.log("Raw User Role:", req.user.role);
        console.log("Normalized User Role:", userRole);
        console.log("Allowed Roles:", roles);
        console.log("Normalized Allowed:", allowedRoles);
        console.log("User ID:", req.user.id);
        console.log("================================");

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden",
                userRole: req.user.role,
                allowedRoles: roles
            });
        }

        next();
    };
};

module.exports = roleMiddleware;