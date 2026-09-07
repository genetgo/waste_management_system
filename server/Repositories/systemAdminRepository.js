const { pool } = require("../config/db");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// =====================================================
// GET ALL SYSTEM ADMINISTRATORS
// =====================================================
const getAllSystemAdmins = async () => {
    const query = `
        SELECT *
        FROM system_administrators
        ORDER BY system_admin_id ASC
    `;

    const { rows } = await pool.query(query);
    return rows;
};

// =====================================================
// GET SYSTEM ADMIN BY ID
// =====================================================
const getSystemAdminById = async (id) => {
    const query = `
        SELECT *
        FROM system_administrators
        WHERE system_admin_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// =====================================================
// GET SYSTEM ADMIN BY USERNAME
// =====================================================
const getSystemAdminByUsername = async (username) => {
    const query = `
        SELECT *
        FROM system_administrators
        WHERE username = $1
    `;

    const { rows } = await pool.query(query, [username]);

    return rows[0] || null;
};

// =====================================================
// GET SYSTEM ADMIN BY EMAIL
// =====================================================
const getSystemAdminByEmail = async (email) => {
    if (!email) return null;

    const query = `
        SELECT *
        FROM system_administrators
        WHERE LOWER(email) = LOWER($1)
    `;

    const { rows } = await pool.query(query, [email.trim()]);

    return rows[0] || null;
};

// =====================================================
// GET SYSTEM ADMIN BY EMAIL OR USERNAME
// =====================================================
const getSystemAdminByEmailOrUsername = async (identifier) => {
    if (!identifier) return null;

    const query = `
        SELECT *
        FROM system_administrators
        WHERE LOWER(email) = LOWER($1)
           OR LOWER(username) = LOWER($1)
        LIMIT 1
    `;

    const { rows } = await pool.query(query, [identifier.trim()]);

    return rows[0] || null;
};

// =====================================================
// CREATE SYSTEM ADMINISTRATOR
// =====================================================
const createSystemAdmin = async (admin) => {
    const {
        full_name,
        phone_number,
        email,
        username,
        password_hash,
        profile_image,
         assigned_kifle_ketema,
    } = admin;

    const query = `
        INSERT INTO system_administrators
        (
            full_name,
            phone_number,
            email,
            username,
            password_hash,
            profile_image,
            assigned_kifle_ketema
        )
        VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        full_name,
        phone_number || null,
        email,
        username,
        password_hash,
        profile_image || null,
        assigned_kifle_ketema || null,
    ]);

    return rows[0];
};


// =====================================================
// UPDATE SYSTEM ADMINISTRATOR
// =====================================================
const updateSystemAdmin = async (id, admin) => {

    const {
        full_name,
        phone_number,
        email,
        username,
        profile_image,
        password_hash,
        assigned_kifle_ketema,
    } = admin;

    const query = `
        UPDATE system_administrators
        SET
            full_name =
                COALESCE($1, full_name),

            phone_number =
                COALESCE($2, phone_number),

            email =
                COALESCE($3, email),

            username =
                COALESCE($4, username),

            profile_image =
                COALESCE($5, profile_image),

            password_hash =
                COALESCE($6, password_hash),

            assigned_kifle_ketema =
                COALESCE($7, assigned_kifle_ketema),

            -- SYSTEM ADMIN MUST ALWAYS BE ACTIVE
            is_active = TRUE,

            updated_at =
                CURRENT_TIMESTAMP

        WHERE system_admin_id = $8

        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        full_name || null,
        phone_number || null,
        email || null,
        username || null,
        profile_image || null,
        password_hash || null,
        assigned_kifle_ketema || null,
        id,
    ]);

    return rows[0] || null;
};


// =====================================================
// UPDATE LAST LOGIN
// =====================================================
const updateLastLogin = async (id) => {

    const query = `
        UPDATE system_administrators
        SET
            last_login = CURRENT_TIMESTAMP
        WHERE system_admin_id = $1
        RETURNING *;
    `;

    const { rows } =
        await pool.query(query, [id]);

    return rows[0] || null;
};


// =====================================================
// DELETE SYSTEM ADMINISTRATOR
// =====================================================
const deleteSystemAdmin = async (id) => {

    const query = `
        DELETE FROM system_administrators
        WHERE system_admin_id = $1
        RETURNING *;
    `;

    const { rows } =
        await pool.query(query, [id]);

    return rows[0] || null;
};


// =====================================================
// DASHBOARD
// =====================================================
const getDashboard = async (adminId) => {

    const admin =
        await getSystemAdminById(adminId);

    const usersResult = await pool.query(`
        SELECT
        (
            (SELECT COUNT(*) FROM residents) +
            (SELECT COUNT(*) FROM business_owners) +
            (SELECT COUNT(*) FROM collectors) +
            (SELECT COUNT(*) FROM municipal_administrators) +
            (SELECT COUNT(*) FROM system_administrators)
        ) AS total;
    `);

    const staffResult = await pool.query(`
        SELECT
        (
            (SELECT COUNT(*) FROM collectors) +
            (SELECT COUNT(*) FROM municipal_administrators) +
            (SELECT COUNT(*) FROM system_administrators)
        ) AS total;
    `);

    return {
        admin,

        totalUsers:
            Number(usersResult.rows[0].total),

        staffAccounts:
            Number(staffResult.rows[0].total),

        activeRoles: 5,

        lastBackup:
            "No Backup Yet",
    };
};

// =====================================================
// GET ALL USERS
// =====================================================
// ===============================================
// Get All Users
// ===============================================
// ===============================================
// Get All Users
// ===============================================
const getAllUsers = async () => {
    const query = `
        SELECT
            system_admin_id AS id,
            full_name AS name,
            email,
            phone_number AS phone,
            NULL::text AS kifle_ketema,
            'System Admin' AS role,
            CASE
                WHEN is_active THEN 'Active'
                ELSE 'Inactive'
            END AS status,
            created_at,
            updated_at
        FROM system_administrators

        UNION ALL

        SELECT
            admin_id AS id,
            full_name AS name,
            email,
            phone_number AS phone,
            assigned_kifle_ketema AS kifle_ketema,
            'Municipal Admin' AS role,
            CASE
                WHEN is_active THEN 'Active'
                ELSE 'Inactive'
            END AS status,
            created_at,
            updated_at
        FROM municipal_administrators

        UNION ALL

        SELECT
            collector_id AS id,
            full_name AS name,
            email,
            phone_number AS phone,
            assigned_kifle_ketema AS kifle_ketema,
            'Collector' AS role,
            CASE
                WHEN is_active THEN 'Active'
                ELSE 'Inactive'
            END AS status,
            created_at,
            updated_at
        FROM collectors

        UNION ALL

        SELECT
            resident_id AS id,
            full_name AS name,
            email,
            phone_number AS phone,
            kifle_ketema AS kifle_ketema,
            'Resident' AS role,
            CASE
                WHEN is_active THEN 'Active'
                ELSE 'Inactive'
            END AS status,
            created_at,
            updated_at
        FROM residents

        UNION ALL

        SELECT
            business_id AS id,
            owner_name AS name,
            email,
            phone_number AS phone,
            kifle_ketema AS kifle_ketema,
            'Business Owner' AS role,
            CASE
                WHEN is_active THEN 'Active'
                ELSE 'Inactive'
            END AS status,
            created_at,
            updated_at
        FROM business_owners

        ORDER BY created_at DESC;
    `;

    const { rows } = await pool.query(query);

    return rows;
};

// =====================================================
// GET ADMIN CONTACT FOR INACTIVE ACCOUNT
// =====================================================
// ==========================================
// GET CONTACT FOR INACTIVE ACCOUNT
// ==========================================
const getInactiveAccountContact = async (role) => {

    const normalizedRole =
        String(role || "")
            .trim()
            .toUpperCase();

    console.log(
        "Getting inactive account contact for:",
        normalizedRole
    );

    const query = `
        SELECT
            system_admin_id,
            full_name,
            email,
            phone_number
        FROM system_administrators
        WHERE is_active = TRUE
        ORDER BY system_admin_id ASC
        LIMIT 1;
    `;

    const { rows } = await pool.query(query);

    if (!rows.length) {
        return null;
    }

    const admin = rows[0];

    return {
        name: admin.full_name,
        email: admin.email,
        phone: admin.phone_number,
    };
};


// =====================================================
// GET USER BY ID
// =====================================================
const getUserById = async (id) => {
    const users = await getAllUsers();

    return users.find(
        (user) => String(user.id) === String(id)
    ) || null;
};



// =====================================================
// UPDATE ANY USER
// =====================================================
const updateUser = async (role, id, data) => {

    const normalizedRole = String(role || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ");

    console.log("================================");
    console.log("UPDATE USER REPOSITORY");
    console.log("Original Role:", role);
    console.log("Normalized Role:", normalizedRole);
    console.log("User ID:", id);
    console.log("Data:", data);
    console.log("================================");


    // =====================================================
    // RESIDENT
    // =====================================================
    if (normalizedRole === "resident") {

        const fullName =
            data.name ||
            data.full_name;

        const phone =
            data.phone ||
            data.phone_number ||
            null;

        const query = `
            UPDATE residents
            SET
                full_name = $1,
                email = $2,
                phone_number = $3,
                kifle_ketema = $4,
                is_active = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE resident_id = $6
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            fullName,
            data.email,
            phone,
            data.kifle_ketema || null,
            data.status === "Active",
            id
        ]);

        return rows[0] || null;
    }


    // =====================================================
    // BUSINESS OWNER
    // =====================================================
    if (
        normalizedRole === "business owner" ||
        normalizedRole === "businessowner"
    ) {

        const ownerName =
            data.name ||
            data.owner_name;

        const phone =
            data.phone ||
            data.phone_number ||
            null;

        const query = `
            UPDATE business_owners
            SET
                owner_name = $1,
                email = $2,
                phone_number = $3,
                kifle_ketema = $4,
                is_active = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE business_id = $6
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            ownerName,
            data.email,
            phone,
            data.kifle_ketema || null,
            data.status === "Active",
            id
        ]);

        return rows[0] || null;
    }


    // =====================================================
    // COLLECTOR
    // =====================================================
    if (
        normalizedRole === "collector" ||
        normalizedRole === "collector / driver"
    ) {

        const fullName =
            data.name ||
            data.full_name;

        const phone =
            data.phone ||
            data.phone_number ||
            null;

        const query = `
            UPDATE collectors
            SET
                full_name = $1,
                email = $2,
                phone_number = $3,
                assigned_kifle_ketema = $4,
                is_active = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE collector_id = $6
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            fullName,
            data.email,
            phone,
            data.kifle_ketema || null,
            data.status === "Active",
            id
        ]);

        return rows[0] || null;
    }


    // =====================================================
    // MUNICIPAL ADMIN
    // =====================================================
    if (
        normalizedRole === "municipal admin" ||
        normalizedRole === "municipaladmin"
    ) {

        const fullName =
            data.name ||
            data.full_name;

        const phone =
            data.phone ||
            data.phone_number ||
            null;

        const query = `
            UPDATE municipal_administrators
            SET
                full_name = $1,
                email = $2,
                phone_number = $3,
                assigned_kifle_ketema = $4,
                is_active = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE admin_id = $6
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            fullName,
            data.email,
            phone,
            data.kifle_ketema || null,
            data.status === "Active",
            id
        ]);

        return rows[0] || null;
    }


    // =====================================================
    // SYSTEM ADMIN
    // =====================================================
    if (
        normalizedRole === "system admin" ||
        normalizedRole === "systemadmin" ||
        normalizedRole === "system administrator" ||
        normalizedRole === "systemadministrator"
    ) {

        const fullName =
            data.name ||
            data.full_name;

        const phone =
            data.phone ||
            data.phone_number ||
            null;

        const query = `
            UPDATE system_administrators
            SET
                full_name = $1,
                email = $2,
                phone_number = $3,
                is_active = $4,
                updated_at = CURRENT_TIMESTAMP
            WHERE system_admin_id = $5
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [
            fullName,
            data.email,
            phone,
            data.status === "Active",
            id
        ]);

        return rows[0] || null;
    }


    // =====================================================
    // INVALID ROLE
    // =====================================================
    throw new Error(`Invalid role: ${role}`);
};










// =====================================================
// DELETE ANY USER
// =====================================================
const deleteUser = async (role, id) => {
    let table = "";
    let idColumn = "";

    switch (role) {
        case "Resident":
            table = "residents";
            idColumn = "resident_id";
            break;

        case "Business Owner":
            table = "business_owners";
            idColumn = "business_id";
            break;

        case "Collector":
            table = "collectors";
            idColumn = "collector_id";
            break;

        case "Municipal Admin":
            table = "municipal_administrators";
            idColumn = "admin_id";
            break;

        case "System Admin":
            table = "system_administrators";
            idColumn = "system_admin_id";
            break;

        default:
            throw new Error("Invalid role");
    }

    const query = `
        DELETE FROM ${table}
        WHERE ${idColumn} = $1
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// =====================================================
// GET MY PROFILE
// =====================================================
const getMyProfile = async (id) => {
    const query = `
        SELECT
            system_admin_id,
            full_name,
            username,
            email,
            phone_number,
            profile_image,
            is_active,
            last_login,
            created_at,
            updated_at
        FROM system_administrators
        WHERE system_admin_id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// =====================================================
// UPDATE MY PROFILE
// =====================================================
const updateMyProfile = async (
    id,
    full_name,
    username,
    email,
    phone_number
) => {
    const query = `
        UPDATE system_administrators
        SET
            full_name = $1,
            username = $2,
            email = $3,
            phone_number = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE system_admin_id = $5
        RETURNING
            system_admin_id,
            full_name,
            username,
            email,
            phone_number,
            profile_image,
            is_active,
            last_login,
            created_at,
            updated_at;
    `;

    const { rows } = await pool.query(query, [
        full_name,
        username,
        email,
        phone_number || null,
        id,
    ]);

    return rows[0] || null;
};

// =====================================================
// UPDATE PASSWORD
// =====================================================
const updatePassword = async (id, password_hash) => {
    const query = `
        UPDATE system_administrators
        SET
            password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE system_admin_id = $2
        RETURNING
            system_admin_id,
            full_name,
            username,
            email,
            phone_number,
            updated_at;
    `;

    const { rows } = await pool.query(query, [
        password_hash,
        id,
    ]);

    return rows[0] || null;
};

// =====================================================
// CREATE MUNICIPAL ADMIN
// =====================================================
const createMunicipalAdmin = async (data) => {
    const {
        full_name,
        phone_number,
        email,
        password_hash,
        assigned_kifle_ketema,
    } = data;

    const query = `
        INSERT INTO municipal_administrators
        (
            full_name,
            phone_number,
            email,
            password_hash,
            assigned_kifle_ketema
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        full_name,
        phone_number || null,
        email,
        password_hash,
        assigned_kifle_ketema || null,
    ]);

    return rows[0];
};

// =====================================================
// CREATE COLLECTOR
// =====================================================
const createCollector = async (data) => {
    const {
        full_name,
        phone_number,
        email,
        password_hash,
        assigned_kifle_ketema,
        kebele,
        
    } = data;

    const query = `
        INSERT INTO collectors
        (
            full_name,
            phone_number,
            email,
            password_hash,
            assigned_kifle_ketema,
            kebele

        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        full_name,
        phone_number || null,
        email,
        password_hash,
        assigned_kifle_ketema || null,
        kebele || null,
        
    ]);

    return rows[0];
};

// =====================================================
// CREATE BACKUP
// =====================================================
const createBackup = async (
    backup_type,
    file_name,
    file_path,
    file_size,
    created_by
) => {
    const query = `
        INSERT INTO backups
        (
            backup_type,
            file_name,
            file_path,
            file_size,
            status,
            created_by
        )
        VALUES ($1, $2, $3, $4, 'Success', $5)
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [
        backup_type,
        file_name,
        file_path,
        file_size,
        created_by,
    ]);

    return rows[0];
};

// =====================================================
// GET BACKUPS
// =====================================================
const getBackups = async () => {
    const query = `
        SELECT *
        FROM backups
        ORDER BY created_at DESC;
    `;

    const { rows } = await pool.query(query);

    return rows;
};

// =====================================================
// GET BACKUP BY ID
// =====================================================
const getBackupById = async (id) => {
    const query = `
        SELECT *
        FROM backups
        WHERE backup_id = $1;
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// =====================================================
// DELETE BACKUP
// =====================================================
const deleteBackup = async (id) => {
    const query = `
        DELETE FROM backups
        WHERE backup_id = $1
        RETURNING *;
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};

// =====================================================
// EXPORT USERS TO EXCEL
// =====================================================
const exportUsersExcel = async () => {
    const users = await getAllUsers();

    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Users");

    sheet.columns = [
        {
            header: "ID",
            key: "id",
            width: 10,
        },
        {
            header: "Name",
            key: "name",
            width: 30,
        },
        {
            header: "Email",
            key: "email",
            width: 35,
        },
        {
            header: "Phone",
            key: "phone",
            width: 20,
        },
        {
            header: "Kifle Ketema",
            key: "kifle_ketema",
            width: 25,
        },
        {
            header: "Role",
            key: "role",
            width: 20,
        },
        {
            header: "Status",
            key: "status",
            width: 15,
        },
    ];

    users.forEach((user) => {
        sheet.addRow({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone || "-",
            kifle_ketema: user.kifle_ketema || "-",
            role: user.role,
            status: user.status,
        });
    });

    return await workbook.xlsx.writeBuffer();
};

// =====================================================
// EXPORT USERS TO PDF
// =====================================================
const exportUsersPDF = async () => {
    const users = await getAllUsers();

    const doc = new PDFDocument({
        margin: 40,
    });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.fontSize(20).text("Users Report");

    doc.moveDown();

    users.forEach((user) => {
        doc
            .fontSize(10)
            .text(
                `${user.id} | ${user.name} | ${user.email} | ${
                    user.phone || "-"
                } | ${
                    user.kifle_ketema || "-"
                } | ${user.role} | ${user.status}`
            );

        doc.moveDown(0.5);
    });

    doc.end();

    return await new Promise((resolve, reject) => {
        doc.on("end", () => {
            resolve(Buffer.concat(buffers));
        });

        doc.on("error", reject);
    });
   
    
};
// =============================================
// ROLES & PERMISSIONS
// =============================================


// =============================================
// ROLES & PERMISSIONS REPOSITORY
// =============================================


// =============================================
// GET ROLE BY ID
// =============================================
const getRoleById = async (id) => {
    const query = `
        SELECT
            role_id,
            role_name,
            description
        FROM roles
        WHERE role_id = $1
        LIMIT 1;
    `;

    const { rows } = await pool.query(query, [id]);

    return rows[0] || null;
};


// =============================================
// GET ROLES WITH STATISTICS
// =============================================
const getRolesWithStatistics = async () => {
    const query = `
        SELECT
            r.role_id AS id,
            r.role_name AS name,
            COALESCE(
                r.description,
                'Custom system role.'
            ) AS description,

            COUNT(DISTINCT rp.permission_id)::INT
                AS permissions,

            CASE
                WHEN r.role_name = 'System Admin'
                    THEN (
                        SELECT COUNT(*)
                        FROM system_administrators
                    )

                WHEN r.role_name = 'Municipal Admin'
                    THEN (
                        SELECT COUNT(*)
                        FROM municipal_administrators
                    )

                WHEN r.role_name = 'Collector'
                    THEN (
                        SELECT COUNT(*)
                        FROM collectors
                    )

                WHEN r.role_name = 'Business Owner'
                    THEN (
                        SELECT COUNT(*)
                        FROM business_owners
                    )

                WHEN r.role_name = 'Resident'
                    THEN (
                        SELECT COUNT(*)
                        FROM residents
                    )

                ELSE 0
            END::INT AS users,

            'Active' AS status

        FROM roles r

        LEFT JOIN role_permissions rp
            ON rp.role_name = r.role_name

        GROUP BY
            r.role_id,
            r.role_name,
            r.description

        ORDER BY
            CASE r.role_name
                WHEN 'System Admin' THEN 1
                WHEN 'Municipal Admin' THEN 2
                WHEN 'Collector' THEN 3
                WHEN 'Business Owner' THEN 4
                WHEN 'Resident' THEN 5
                ELSE 6
            END,
            r.role_id ASC;
    `;

    const { rows } = await pool.query(query);

    return rows.map((role) => ({
        id: Number(role.id),
        name: role.name,
        description: role.description,
        users: Number(role.users),
        permissions: Number(role.permissions),
        status: role.status,
    }));
};


// =============================================
// GET ROLE PERMISSIONS
// =============================================
const getRolePermissions = async () => {

    const query = `
        SELECT
            rp.role_name,
            p.permission_name

        FROM role_permissions rp

        INNER JOIN permissions p
            ON rp.permission_id = p.permission_id

        ORDER BY

            CASE rp.role_name

                WHEN 'System Admin'
                    THEN 1

                WHEN 'Municipal Admin'
                    THEN 2

                WHEN 'Collector'
                    THEN 3

                WHEN 'Business Owner'
                    THEN 4

                WHEN 'Resident'
                    THEN 5

                ELSE 6

            END,

            p.permission_id;
    `;

    const { rows } = await pool.query(query);

    const roles = {};

    rows.forEach((row) => {

        if (!roles[row.role_name]) {

            roles[row.role_name] = {
                name: row.role_name,
                view: false,
                create: false,
                update: false,
                delete: false,
                reports: false,
            };
        }

        switch (row.permission_name) {

            case "VIEW":
                roles[row.role_name].view = true;
                break;

            case "CREATE":
                roles[row.role_name].create = true;
                break;

            case "UPDATE":
                roles[row.role_name].update = true;
                break;

            case "DELETE":
                roles[row.role_name].delete = true;
                break;

            case "REPORTS":
                roles[row.role_name].reports = true;
                break;
        }
    });

    return Object.values(roles);
};


// =============================================
// GET AVAILABLE PERMISSIONS
// =============================================
const getAvailablePermissions = async () => {

    const query = `
        SELECT
            permission_id,
            permission_name
        FROM permissions
        ORDER BY permission_id ASC;
    `;

    const { rows } = await pool.query(query);

    return rows;
};


// =============================================
// CREATE ROLE
// =============================================
// =============================================
// CREATE ROLE
// =============================================
const createRole = async (data) => {
  const {
    role_name,
    description,
    permissions = [],
  } = data || {};

  console.log("====================================");
  console.log("REPOSITORY CREATE ROLE");
  console.log("role_name:", role_name);
  console.log("description:", description);
  console.log("permissions:", permissions);
  console.log("====================================");

  if (!role_name || !role_name.trim()) {
    throw new Error("Role name is required.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check duplicate
    const existing = await client.query(
      `
      SELECT role_id
      FROM roles
      WHERE LOWER(role_name) = LOWER($1)
      LIMIT 1
      `,
      [role_name.trim()]
    );

    if (existing.rows.length > 0) {
      const error = new Error(
        "Role already exists."
      );

      error.code = "23505";

      throw error;
    }

    // Create role
    const roleResult = await client.query(
      `
      INSERT INTO roles
      (
        role_name,
        description
      )
      VALUES ($1, $2)
      RETURNING
        role_id,
        role_name,
        description;
      `,
      [
        role_name.trim(),
        description || null,
      ]
    );

    const role = roleResult.rows[0];

    // Assign permissions
    if (Array.isArray(permissions)) {
      for (const permission of permissions) {

        let permissionId;

        // Numeric ID
        if (
          typeof permission === "number" ||
          (
            typeof permission === "string" &&
            permission.trim() !== "" &&
            !isNaN(Number(permission))
          )
        ) {
          permissionId = Number(permission);
        }

        // Permission name
        else {
          const permissionResult =
            await client.query(
              `
              SELECT permission_id
              FROM permissions
              WHERE UPPER(permission_name) =
                    UPPER($1)
              LIMIT 1
              `,
              [String(permission).trim()]
            );

          if (
            permissionResult.rows.length === 0
          ) {
            throw new Error(
              `Permission not found: ${permission}`
            );
          }

          permissionId =
            permissionResult.rows[0]
              .permission_id;
        }

        await client.query(
          `
          INSERT INTO role_permissions
          (
            role_name,
            permission_id
          )
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
          `,
          [
            role.role_name,
            permissionId,
          ]
        );
      }
    }

    await client.query("COMMIT");

    return role;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
};




// =============================================
// UPDATE ROLE
// =============================================
const updateRole = async (id, data) => {
    const {
        name,
        description,
        permissionIds = [],
    } = data || {};

    if (!name || typeof name !== "string" || !name.trim()) {
        throw new Error("Role name is required.");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // =============================================
        // CHECK ROLE EXISTS
        // =============================================
        const existingRoleResult = await client.query(
            `
            SELECT
                role_id,
                role_name
            FROM roles
            WHERE role_id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (existingRoleResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return null;
        }

        const oldRoleName =
            existingRoleResult.rows[0].role_name;

        const newRoleName = name.trim();

        // =============================================
        // CHECK DUPLICATE ROLE NAME
        // =============================================
        const duplicate = await client.query(
            `
            SELECT role_id
            FROM roles
            WHERE LOWER(role_name) = LOWER($1)
              AND role_id <> $2
            LIMIT 1
            `,
            [newRoleName, id]
        );

        if (duplicate.rows.length > 0) {
            const error = new Error(
                "Role already exists."
            );

            error.code = "23505";

            throw error;
        }

        // =============================================
        // NORMALIZE PERMISSIONS
        //
        // Supports:
        // [1, 2, 3]
        //
        // OR:
        // ["VIEW", "CREATE", "UPDATE"]
        // =============================================
        const permissionsArray =
            Array.isArray(permissionIds)
                ? permissionIds
                : [];

        const uniquePermissions = [
            ...new Set(
                permissionsArray
                    .filter(
                        (permission) =>
                            permission !== null &&
                            permission !== undefined &&
                            String(permission).trim() !== ""
                    )
                    .map((permission) =>
                        String(permission).trim()
                    )
            ),
        ];

        // =============================================
        // CONVERT PERMISSION NAMES TO IDs
        // =============================================
        const finalPermissionIds = [];

        for (const permission of uniquePermissions) {

            // Numeric ID
            if (
                /^\d+$/.test(permission)
            ) {
                const permissionId =
                    Number(permission);

                const permissionExists =
                    await client.query(
                        `
                        SELECT permission_id
                        FROM permissions
                        WHERE permission_id = $1
                        LIMIT 1
                        `,
                        [permissionId]
                    );

                if (
                    permissionExists.rows.length === 0
                ) {
                    throw new Error(
                        `Permission not found: ${permission}`
                    );
                }

                finalPermissionIds.push(
                    permissionId
                );

                continue;
            }

            // Permission name
            const permissionResult =
                await client.query(
                    `
                    SELECT permission_id
                    FROM permissions
                    WHERE UPPER(permission_name) =
                          UPPER($1)
                    LIMIT 1
                    `,
                    [permission]
                );

            if (
                permissionResult.rows.length === 0
            ) {
                throw new Error(
                    `Permission not found: ${permission}`
                );
            }

            finalPermissionIds.push(
                Number(
                    permissionResult.rows[0]
                        .permission_id
                )
            );
        }

        // Remove duplicate IDs again
        const uniquePermissionIds = [
            ...new Set(finalPermissionIds),
        ];

        // =============================================
        // UPDATE ROLE
        // =============================================
        const roleResult = await client.query(
            `
            UPDATE roles
            SET
                role_name = $1,
                description = $2
            WHERE role_id = $3
            RETURNING
                role_id,
                role_name,
                description;
            `,
            [
                newRoleName,
                description || null,
                id,
            ]
        );

        const role = roleResult.rows[0];

        // =============================================
        // REMOVE OLD PERMISSIONS
        //
        // IMPORTANT:
        // Remove by OLD role name.
        // =============================================
        await client.query(
            `
            DELETE FROM role_permissions
            WHERE role_name = $1
            `,
            [oldRoleName]
        );

        // =============================================
        // INSERT NEW PERMISSIONS
        // =============================================
        for (const permissionId of uniquePermissionIds) {

            await client.query(
                `
                INSERT INTO role_permissions
                (
                    role_name,
                    permission_id
                )
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING;
                `,
                [
                    role.role_name,
                    permissionId,
                ]
            );
        }

        // =============================================
        // COMMIT
        // =============================================
        await client.query("COMMIT");

        return role;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {
        client.release();
    }
};

// =============================================
// DELETE ROLE
// =============================================
const deleteRole = async (id) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");


        // -----------------------------------------
        // GET ROLE
        // -----------------------------------------
        const existing = await client.query(
            `
            SELECT
                role_id,
                role_name
            FROM roles
            WHERE role_id = $1
            `,
            [id]
        );


        if (existing.rows.length === 0) {

            await client.query("ROLLBACK");

            return null;
        }


        const roleName =
            existing.rows[0].role_name;


        // -----------------------------------------
        // PROTECT DEFAULT ROLES
        // -----------------------------------------
        const protectedRoles = [
            "System Admin",
            "Municipal Admin",
            "Collector",
            "Business Owner",
            "Resident",
        ];


        if (protectedRoles.includes(roleName)) {

            const error =
                new Error(
                    "Default system roles cannot be deleted."
                );

            error.code = "PROTECTED_ROLE";

            throw error;
        }


        // -----------------------------------------
        // DELETE PERMISSIONS FIRST
        // -----------------------------------------
        await client.query(
            `
            DELETE FROM role_permissions
            WHERE role_name = $1
            `,
            [roleName]
        );


        // -----------------------------------------
        // DELETE ROLE
        // -----------------------------------------
        const result = await client.query(
            `
            DELETE FROM roles
            WHERE role_id = $1

            RETURNING
                role_id,
                role_name,
                description;
            `,
            [id]
        );


        await client.query("COMMIT");

        return result.rows[0] || null;

    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();
    }
};

module.exports = {
    // System Admin CRUD
    getAllSystemAdmins,
    getSystemAdminById,
    getSystemAdminByUsername,
    getSystemAdminByEmail,
    getSystemAdminByEmailOrUsername,
    createSystemAdmin,
    updateSystemAdmin,
    updateLastLogin,
    deleteSystemAdmin,

    // Dashboard
    getDashboard,

    // Users
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,

    // Municipal Admin / Collector
    createMunicipalAdmin,
    createCollector,

    // Profile
    getMyProfile,
    updateMyProfile,
    updatePassword,

    // Backup
    createBackup,
    getBackups,
    getBackupById,
    deleteBackup,
getInactiveAccountContact,
    // Export
    getRolesWithStatistics,
     getRolePermissions,
    exportUsersPDF,
    exportUsersExcel,
     getRoleById,
     createRole,
      updateRole,
    deleteRole,
    getAvailablePermissions
};