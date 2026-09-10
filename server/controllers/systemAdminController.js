const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const systemAdminRepository = require("../repositories/systemAdminRepository");


// =================================
// System Admin Login
// =================================
const login = async (req, res, next) => {

    try {

        const { email, password } = req.body;

        // =====================================
        // VALIDATION
        // =====================================

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required.",
            });
        }

        const identifier =
            String(email)
                .trim()
                .toLowerCase();

        // =====================================
        // FIND SYSTEM ADMIN
        // =====================================

        const admin =
            await systemAdminRepository
                .getSystemAdminByEmailOrUsername(
                    identifier
                );

        if (!admin) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        // =====================================
        // PASSWORD CHECK
        // =====================================

        if (!admin.password_hash) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                admin.password_hash
            );

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password.",
            });
        }

        // =====================================
        // SYSTEM ADMIN MUST ALWAYS BE ACTIVE
        // =====================================

        if (admin.is_active === false) {

            return res.status(403).json({
                success: false,
                code: "SYSTEM_ADMIN_INACTIVE",
                message:
                    "System Admin account cannot be inactive.",
            });
        }

        // =====================================
        // CREATE JWT
        // =====================================

        const token = jwt.sign(
            {
                id: admin.system_admin_id,
                role: "SYSTEM_ADMIN",
            },

            process.env.JWT_SECRET ||
            "fallback_secret_key",

            {
                expiresIn: "1d",
            }
        );

        // =====================================
        // UPDATE LAST LOGIN
        // =====================================

        await systemAdminRepository
            .updateLastLogin(
                admin.system_admin_id
            );

        // =====================================
        // REMOVE PASSWORD
        // =====================================

        delete admin.password_hash;

        // =====================================
        // RESPONSE
        // =====================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful.",

            token,

            role: "SYSTEM_ADMIN",

            data: admin,
        });

    } catch (error) {

        console.error(
            "SYSTEM ADMIN LOGIN ERROR:",
            error
        );

        next(error);
    }
};





// =================================
// Dashboard
// =================================
const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await systemAdminRepository.getDashboard(req.user.id);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Profile
// =================================
const getMyProfile = async (req, res, next) => {
    try {
        const systemAdminId = req.user.id;

        const profile =
            await systemAdminRepository.getMyProfile(
                systemAdminId
            );

        res.status(200).json({
            success: true,
            profile,
        });
    } catch (error) {
        next(error);
    }
};

const updateMyProfile = async (req, res, next) => {
try {
const systemAdminId = req.user.id;


    const {
        full_name,
        username,
        email,
        phone_number,
    } = req.body;

    console.log("================================");
    console.log("UPDATE SYSTEM ADMIN PROFILE");
    console.log("Admin ID:", systemAdminId);
    console.log("Request Body:", req.body);
    console.log("================================");

    if (!full_name || !username || !email) {
        return res.status(400).json({
            success: false,
            message: "Full name, username and email are required.",
        });
    }

    const profile =
        await systemAdminRepository.updateMyProfile(
            systemAdminId,
            full_name.trim(),
            username.trim(),
            email.trim().toLowerCase(),
            phone_number ? phone_number.trim() : null
        );

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "System administrator profile not found.",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        profile,
    });

} catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "Username or email already exists.",
        });
    }

    next(error);
}
};

// =================================
// System Admins Management
// =================================
const getAllSystemAdmins = async (req, res, next) => {
  try {
    const admins = await systemAdminRepository.getAllSystemAdmins();

    res.status(200).json({
      success: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

const getSystemAdminById = async (req, res, next) => {
  try {
    const admin = await systemAdminRepository.getSystemAdminById(
      req.params.id
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "System admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const createSystemAdmin = async (req, res, next) => {
  try {
    const { full_name, email, username, password } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    const admin = await systemAdminRepository.createSystemAdmin({
      full_name,
      email,
      username,
      password_hash,
      profile_image: req.file ? req.file.filename : null,
    });

    res.status(201).json({
      success: true,
      message: "System admin created successfully.",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const updateSystemAdmin = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
    };

    if (req.file) {
      data.profile_image = req.file.filename;
    }

    const admin = await systemAdminRepository.updateSystemAdmin(
      req.params.id,
      data
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "System admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "System admin updated successfully.",
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSystemAdmin = async (req, res, next) => {
  try {
    const admin = await systemAdminRepository.deleteSystemAdmin(
      req.params.id
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "System admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "System admin deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// User Management
// =================================
const getAllUsers = async (req, res, next) => {
  try {
    const users = await systemAdminRepository.getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await systemAdminRepository.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Update Any User
// =================================


const updateUser = async (req, res, next) => {
    try {

        const {
            role,
            ...userData
        } = req.body;

        console.log("================================");
        console.log("UPDATE USER CONTROLLER");
        console.log("User ID:", req.params.id);
        console.log("Role:", role);
        console.log("User Data:", userData);
        console.log("================================");

        if (
            !role ||
            typeof role !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid user role is required.",
            });
        }

        const user =
            await systemAdminRepository.updateUser(
                role,
                req.params.id,
                userData
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            data: user,
        });

    } catch (error) {

        console.error(
            "UPDATE USER ERROR:",
            error
        );

        next(error);
    }
};


const deleteUser = async (req, res, next) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required.",
      });
    }

    const deleted = await systemAdminRepository.deleteUser(
      role,
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Dashboard Statistics
// =================================



// =================================
// Backups Management
// =================================

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const createBackup = async (req, res, next) => {
  try {

    
    const backupDir = path.join(process.cwd(), "uploads", "backups");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const fileName = `backup_${Date.now()}.sql`;
    const filePath = path.join(backupDir, fileName);

    // pg_dump.exe path
    const pgDump = `"${process.env.PG_DUMP_PATH}"`;

    const command =
  `set PGPASSWORD=${process.env.DB_PASSWORD}&& ` +
  `${pgDump} ` +
  `--clean ` +
  `--if-exists ` +
  `--no-owner ` +
  `--no-privileges ` +
  `-h ${process.env.DB_HOST} ` +
  `-p ${process.env.DB_PORT} ` +
  `-U ${process.env.DB_USER} ` +
  `-d ${process.env.DB_NAME} ` +
  `-f "${filePath}"`;

    exec(command, async (error) => {

      if (error) {
        return next(error);
      }

      const stats = fs.statSync(filePath);

      const size =
        (stats.size / (1024 * 1024)).toFixed(2) + " MB";

      const backup =
        await systemAdminRepository.createBackup(
          req.body.type,
          fileName,
          `uploads/backups/${fileName}`,
          size,
          req.user.id
        );

      res.status(201).json({
        success: true,
        message: "Backup created successfully.",
        data: backup,
      });

    });

  } catch (error) {
    next(error);
  }
};

const getBackups = async (req, res, next) => {
  try {
   const backups = await systemAdminRepository.getBackups();
    res.status(200).json({
      success: true,
      data: backups,
    });
  } catch (error) {
    next(error);
  }
}


const restoreBackup = async (req, res, next) => {
  try {
    // ==========================
    // Get Backup Record
    // ==========================
    const backup = await systemAdminRepository.getBackupById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "Backup not found.",
      });
    }

    // ==========================
    // Backup File Path
    // ==========================
    const filePath = path.join(process.cwd(), backup.file_path);

    console.log("======================================");
    console.log("RESTORE DATABASE");
    console.log("======================================");
    console.log("Backup ID:", req.params.id);
    console.log("Backup Record:", backup);
    console.log("Backup File:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("Backup file does not exist.");

      return res.status(404).json({
        success: false,
        message: "Backup file does not exist.",
      });
    }

    // ==========================
    // Validate Environment
    // ==========================
    if (!process.env.PSQL_PATH) {
      return res.status(500).json({
        success: false,
        message: "PSQL_PATH is missing in .env",
      });
    }

    const psql = `"${process.env.PSQL_PATH}"`;

    console.log("PSQL PATH:", process.env.PSQL_PATH);
    console.log("Database:", process.env.DB_NAME);
    console.log("Host:", process.env.DB_HOST);
    console.log("Port:", process.env.DB_PORT);
    console.log("User:", process.env.DB_USER);

    // ==========================
    // Restore Command
    // ==========================
    const command =
      `set PGPASSWORD=${process.env.DB_PASSWORD}&& ` +
      `${psql} ` +
      `-h ${process.env.DB_HOST} ` +
      `-p ${process.env.DB_PORT} ` +
      `-U ${process.env.DB_USER} ` +
      `-d ${process.env.DB_NAME} ` +
      `-f "${filePath}"`;

    console.log("Restore Command:");
    console.log(command);

    // ==========================
    // Execute Restore
    // ==========================
    exec(command, (error, stdout, stderr) => {

    console.log("========== STDOUT ==========");
    console.log(stdout);

    console.log("========== STDERR ==========");
    console.log(stderr);

    if (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

    res.json({
        success: true
    });

});
  } catch (error) {
    console.error("RESTORE EXCEPTION:");
    console.error(error);
    next(error);
  }
};

const deleteBackup = async (req, res, next) => {
  try {
    const backup = await systemAdminRepository.deleteBackup(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "Backup not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Backup deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// =================================
// Staff Management
// =================================
const createStaff = async (req, res, next) => {
  try {
    
    const {
      fullName,
      email,
      phone,
      role,
      password,
      assigned_kifle_ketema,
      kebele,
      
    } = req.body;

    // ==============================
    // Validate required fields
    // ==============================
    if (!fullName || !email || !phone || !role || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // Collector-specific validation
    if (role === "Collector" || role === "Collector / Driver") {
      if (!assigned_kifle_ketema || !kebele) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned Kifle Ketema and Kebele are required for collectors.",
        });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const username = email.split("@")[0];

    let createdUser;

    switch (role) {

      // ==============================
      // SYSTEM ADMIN
      // ==============================
      case "System Admin":

        createdUser =
          await systemAdminRepository.createSystemAdmin({
            full_name: fullName,
            email,
            username,
            password_hash,
          });

        break;


      // ==============================
      // MUNICIPAL ADMIN
      // ==============================
      case "Municipal Admin":

        createdUser =
          await systemAdminRepository.createMunicipalAdmin({
            full_name: fullName,
            phone_number: phone,
            email,
            password_hash,
            assigned_kifle_ketema,
          });

        break;


      // ==============================
      // COLLECTOR
      // ==============================
      case "Collector":
      case "Collector / Driver":

        createdUser =
          await systemAdminRepository.createCollector({
            full_name: fullName,
            phone_number: phone,
            email,
            password_hash,
            assigned_kifle_ketema,
            kebele,
            
          });

        break;


      // ==============================
      // INVALID ROLE
      // ==============================
      default:

        return res.status(400).json({
          success: false,
          message: "Invalid role selected.",
        });
    }

    return res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      data: createdUser,
    });

  } catch (error) {
    next(error);
  }
};


const getStaffAccounts = async (req, res, next) => {
  try {

    const staff =
      await systemAdminRepository.getStaffAccounts();

    res.status(200).json({
      success: true,
      data: staff,
    });

  } catch (error) {
    next(error);
  }
};
const updateStaff = async (req, res, next) => {
  try {
    const staff = await systemAdminRepository.updateStaff(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

const deleteStaff = async (req, res, next) => {
  try {
    await systemAdminRepository.deleteStaff(req.params.id);

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};


// =================================
// Roles Management
// =================================

// =============================================
// ROLES & PERMISSIONS
// =============================================

const getRoles = async (req, res, next) => {
    try {
        const roles =
            await systemAdminRepository.getRolesWithStatistics();

        const permissions =
            await systemAdminRepository.getRolePermissions();

        const availablePermissions =
            await systemAdminRepository.getAvailablePermissions();

        return res.status(200).json({
            success: true,
            data: {
                roles: Array.isArray(roles) ? roles : [],
                permissions: Array.isArray(permissions)
                    ? permissions
                    : [],
                availablePermissions: Array.isArray(
                    availablePermissions
                )
                    ? availablePermissions
                    : [],
            },
        });
    } catch (error) {
        console.error(
            "GET ROLES ERROR:",
            error
        );

        next(error);
    }
};


// =============================================
// CREATE ROLE
// =============================================

// =============================================
// CREATE ROLE
// =============================================
const createRole = async (req, res, next) => {
  try {
    const {
      role_name,
      description,
      permissions = [],
    } = req.body;

    console.log("====================================");
    console.log("CREATE ROLE REQUEST");
    console.log("BODY:", req.body);
    console.log("ROLE NAME:", role_name);
    console.log("PERMISSIONS:", permissions);
    console.log("====================================");

    if (!role_name || !role_name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required.",
      });
    }

    const role =
      await systemAdminRepository.createRole({
        role_name: role_name.trim(),
        description:
          description?.trim() || null,
        permissions: Array.isArray(permissions)
          ? permissions
          : [],
      });

    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: role,
    });

  } catch (error) {
    console.error(
      "CREATE ROLE ERROR:",
      error
    );

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Role already exists.",
      });
    }

    next(error);
  }
};


// =============================================
// CREATE CUSTOM PERMISSION
// =============================================
const createPermission = async (req, res) => {
    try {
        const permission =
            await systemAdminRepository.createPermission(
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Permission created successfully.",
            data: permission,
        });

    } catch (error) {
        console.error(
            "CREATE PERMISSION ERROR:",
            error
        );

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message:
                    "Permission already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to create permission.",
        });
    }
};
// =============================================
// DELETE CUSTOM PERMISSION
// =============================================
const deletePermission = async (req, res) => {

    try {

        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid permission ID."
            });
        }

        const permission =
            await systemAdminRepository.deletePermission(
                Number(id)
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message: "Permission not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Permission deleted successfully.",
            data: permission
        });

    } catch (error) {

        console.error(
            "DELETE PERMISSION ERROR:",
            error
        );

        if (error.code === "PROTECTED_PERMISSION") {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to delete permission."
        });
    }
};


// =============================================
// UPDATE ROLE
// =============================================
const updateRole = async (req, res, next) => {
    try {

        const { id } = req.params;

        const {
            role_name,
            name,
            description,
            permissionIds = [],
            permissions = [],
        } = req.body || {};

        // Support both role_name and name
        const finalRoleName =
            role_name || name;

        if (
            !finalRoleName ||
            !finalRoleName.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Role name is required.",
            });
        }

        // Support both permissionIds and permissions
        const finalPermissions =
            Array.isArray(permissionIds) &&
            permissionIds.length > 0
                ? permissionIds
                : permissions;

        console.log("================================");
        console.log("UPDATE ROLE");
        console.log("Role ID:", id);
        console.log("Role Name:", finalRoleName);
        console.log(
            "Permissions:",
            finalPermissions
        );
        console.log("================================");

        const role =
            await systemAdminRepository.updateRole(
                id,
                {
                    name: finalRoleName.trim(),
                    description:
                        description?.trim() || null,
                    permissionIds:
                        finalPermissions || [],
                }
            );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: "Role not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Role updated successfully.",
            data: role,
        });

    } catch (error) {

        console.error(
            "UPDATE ROLE ERROR:",
            error
        );

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message:
                    "This role name already exists.",
            });
        }

        next(error);
    }
};


// =============================================
// DELETE ROLE
// =============================================

const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Role ID is required.",
            });
        }

        const protectedRoles = [
            "System Admin",
            "Municipal Admin",
            "Collector",
            "Business Owner",
            "Resident",
        ];

        const existingRole =
            await systemAdminRepository.getRoleById(
                id
            );

        if (!existingRole) {
            return res.status(404).json({
                success: false,
                message: "Role not found.",
            });
        }

        const roleName =
            existingRole.role_name;

        const isProtected =
            protectedRoles.some(
                (protectedRole) =>
                    protectedRole.toLowerCase() ===
                    String(roleName)
                        .toLowerCase()
                        .trim()
            );

        if (isProtected) {
            return res.status(403).json({
                success: false,
                message:
                    "Default system roles cannot be deleted.",
            });
        }

        const userCount =
            Number(
                existingRole.users || 0
            );

        if (userCount > 0) {
            return res.status(409).json({
                success: false,
                message:
                    `Cannot delete ${roleName}. ` +
                    `This role is assigned to ${userCount} user(s).`,
            });
        }

        const deletedRole =
            await systemAdminRepository.deleteRole(
                id
            );

        if (!deletedRole) {
            return res.status(404).json({
                success: false,
                message: "Role not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Role deleted successfully.",
            data: deletedRole,
        });
    } catch (error) {
        console.error(
            "DELETE ROLE ERROR:",
            error
        );

        next(error);
    }
};
const exportUsersPDF = async (req, res, next) => {
  try {
    const buffer = await systemAdminRepository.exportUsersPDF();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users.pdf"
    );

    res.send(buffer);

  } catch (err) {
    next(err);
  }
};
 const changePassword = async (req, res, next) => {
    try {
        const systemAdminId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters."
            });
        }

        const admin =
            await systemAdminRepository.getSystemAdminById(
                systemAdminId
            );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "System administrator not found."
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            admin.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const password_hash =
            await bcrypt.hash(newPassword, 10);

        await systemAdminRepository.updatePassword(
            systemAdminId,
            password_hash
        );

        res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        next(error);
    }
};



const exportUsersExcel = async (req, res, next) => {
  try {
    const buffer = await systemAdminRepository.exportUsersExcel();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users.xlsx"
    );

    res.send(buffer);

  } catch (err) {
    next(err);
  }
  
};




module.exports = {
  login,
 changePassword,
  getDashboard,
  

  getMyProfile,
  updateMyProfile,
exportUsersPDF,
    exportUsersExcel,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,

  getAllSystemAdmins,
  getSystemAdminById,
  createSystemAdmin,
  updateSystemAdmin,
  deleteSystemAdmin,

  createStaff,
  getStaffAccounts,
  updateStaff,
  deleteStaff,

  getRoles,
  createRole,
  updateRole,
  deleteRole,
createPermission,
deletePermission,
  createBackup,
  getBackups,
  restoreBackup,
  deleteBackup,
};