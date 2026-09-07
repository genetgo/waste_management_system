const { pool } = require("../config/db");

class ResidentRepository {
    // =============================
    // Register Resident
    // =============================
    createResident = async (data) => {
    const query = `
        INSERT INTO residents (
            full_name,
            phone_number,
            email,
            password_hash,
            kebele,
            kifle_ketema,
            sefer,
            profile_image
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *;
    `;

    const values = [
        data.full_name?.trim(),
        data.phone_number?.trim() || null,
        data.email?.trim().toLowerCase() || null,
        data.password_hash,
        data.kebele?.trim() || null,
        data.kifle_ketema?.trim() || null,
        data.sefer?.trim() || null,
        data.profile_image || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};
    // ==========================
    // =============================
    getResidentById = async (id) => {
        if (!id) return null;

        const query = `
            SELECT *
            FROM residents
            WHERE resident_id = $1
        `;

        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    };

    // =============================
    // Get Resident By Email
    // =============================
    getResidentByEmail = async (email) => {
        if (!email) return null;

        const query = `
            SELECT *
            FROM residents
            WHERE LOWER(email) = LOWER($1)
        `;

        const { rows } = await pool.query(query, [email.trim()]);
        return rows[0] || null;
    };

    // =============================
    // Get Resident By Phone
    // =============================
    getResidentByPhone = async (phone) => {
        if (!phone) return null;

        const query = `
            SELECT *
            FROM residents
            WHERE phone_number = $1
        `;

        const { rows } = await pool.query(query, [phone.trim()]);
        return rows[0] || null;
    };

    // =============================
    // Update Resident
    // =============================
    updateResident = async (id, data) => {
    const query = `
        UPDATE residents
        SET
            full_name = COALESCE($1, full_name),
            phone_number = COALESCE($2, phone_number),
            email = COALESCE(LOWER($3), email),
            kifle_ketema = COALESCE($4, kifle_ketema),
            kebele = COALESCE($5, kebele),
            sefer = COALESCE($6, sefer),
            profile_image = COALESCE($7, profile_image),
            password_hash = COALESCE($8, password_hash)
        WHERE resident_id = $9
        RETURNING *;
    `;

    const values = [
        data.full_name
            ? data.full_name.trim()
            : null,

        data.phone_number
            ? data.phone_number.trim()
            : null,

        data.email
            ? data.email.trim()
            : null,

        data.kifle_ketema
            ? data.kifle_ketema.trim()
            : null,

        data.kebele
            ? data.kebele.trim()
            : null,

        data.sefer
            ? data.sefer.trim()
            : null,

        data.profile_image || null,

        data.password_hash || null,

        id,
    ];

    const { rows } =
        await pool.query(query, values);

    return rows[0] || null;
};
    // =============================
    // Delete Resident
    // =============================
    deleteResident = async (id) => {
        const query = `
            DELETE FROM residents
            WHERE resident_id = $1
            RETURNING *;
        `;

        const { rows } = await pool.query(query, [id]);
        return rows[0] || null;
    };

    // =============================
    // Search Residents
    // =============================
    searchResidents = async (keyword) => {
        if (!keyword) return [];

        const query = `
            SELECT *
            FROM residents
            WHERE
                
    
                full_name ILIKE $1
            
                OR phone_number ILIKE $1
                OR email ILIKE $1
            ORDER BY resident_id DESC
        `;

        const { rows } = await pool.query(query, [`%${keyword.trim()}%`]);
        return rows;
    };

    // =============================
    // Get All Residents
    // =============================
    getAllResidents = async (kifleKetema = null) => {

    let query = `
        SELECT *
        FROM residents
    `;

    let values = [];

    if (kifleKetema) {
        query += `
            WHERE LOWER(kifle_ketema)=LOWER($1)
        `;
        values.push(kifleKetema);
    }

    query += `
        ORDER BY resident_id DESC
    `;

    const { rows } = await pool.query(query, values);

    return rows;
};
    // =============================
    // Residents by Kifle Ketema
    // =============================
    getResidentsByKifleKetema = async (kifleKetema) => {
        if (!kifleKetema) return [];

        const query = `
            SELECT *
            FROM residents
            WHERE LOWER(kifle_ketema) = LOWER($1)
            ORDER BY resident_id DESC
        `;

        const { rows } = await pool.query(query, [kifleKetema.trim()]);
        return rows;
    };

    // =============================
    // Resident Dashboard
    // =============================
    getDashboard = async (residentId) => {
        const resident = await this.getResidentById(residentId);

        if (!resident) {
            throw new Error("Resident not found");
        }

        // 1. Next Waste Collection Schedule
        let nextCollectionText = "No upcoming schedule";
        try {
            const nextScheduleQuery = `
                SELECT schedule_date, start_time, end_time, status
               FROM collection_schedules
                WHERE (LOWER(kebele) = LOWER($1) OR LOWER(kifle_ketema) = LOWER($2))
                  AND schedule_date >= CURRENT_DATE
                ORDER BY schedule_date ASC
                LIMIT 1;
            `;
            const nextScheduleResult = await pool.query(nextScheduleQuery, [
                resident.kebele || "",
                resident.kifle_ketema || "",
            ]);

            if (nextScheduleResult.rows.length > 0) {
                const sched = nextScheduleResult.rows[0];
                const dateStr = new Date(sched.schedule_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                });
                nextCollectionText = `${dateStr} (${sched.start_time || ""} - ${sched.end_time || ""})`;
            }
        } catch (err) {
            nextCollectionText = "No upcoming schedule";
        }

        // 2. Collection History
        let history = [];
        try {
            const historyQuery = `
                SELECT 
                    r.request_id AS id,
                    r.created_at AS date,
                    c.full_name AS collector,
                    r.status
                FROM on_demand_requests r
                LEFT JOIN collectors c ON r.collector_id = c.collector_id
                WHERE r.resident_id = $1
                ORDER BY r.created_at DESC
                LIMIT 5;
            `;
            const historyResult = await pool.query(historyQuery, [residentId]);
            history = historyResult.rows.map((row) => ({
                id: row.id,
                date: row.date ? new Date(row.date).toISOString().split("T")[0] : null,
                collector: row.collector || "Assigned Collector",
                status: row.status,
            }));
        } catch (err) {
            history = [];
        }

        return {
            resident,
            stats: {
                nextCollection: nextCollectionText,
                status: "Active",
            },
            history,
        };
    };

    // =============================
    // Total Residents Count
    // =============================
    countResidents = async () => {
        const query = `
            SELECT COUNT(*) AS total
            FROM residents
        `;

        const { rows } = await pool.query(query);
        return Number(rows[0].total);
    };
}

module.exports = new ResidentRepository();