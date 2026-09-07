
const { pool } = require("../config/db");

class RequestRepository {

    // ===========================================
    // Create On-Demand Request
    // Business Owner → Pending
    // ===========================================
    async createRequest(data) {
    const query = `
        INSERT INTO on_demand_requests
        (
            business_id,
            kifle_ketema,
            kebele,
            sefer,
            latitude,
            longitude,
            preferred_collection_date,
            description,
            status,
            created_at,
            updated_at
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            'Pending',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        )
        RETURNING *;
    `;

    const values = [
        data.business_id,
        data.kifle_ketema,
        data.kebele,
        data.sefer,
        data.latitude,
        data.longitude,
        data.preferred_collection_date,
        data.description || null
    ];

    try {
        const { rows } = await pool.query(query, values);

        return rows[0];

    } catch (error) {

        // ==========================================
        // Duplicate Business + Date
        // ==========================================
        if (
            error.code === "23505" &&
            error.constraint === "unique_business_request_per_date"
        ) {
            throw new Error(
                "You have already submitted a request for this date. You cannot submit another request on the same day."
            );
        }

        throw error;
    }
}
// ===========================================
// Get Requests By Business
// Used for duplicate request checking
// Business Owner
// ===========================================
async getRequestsByBusiness(businessId) {

    const query = `
        SELECT
            r.request_id,
            r.business_id,

            r.kifle_ketema,
            r.kebele,
            r.sefer,

            r.latitude,
            r.longitude,

            r.preferred_collection_date,
            r.description,
            r.status,

            r.collector_id,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone,
            c.email AS collector_email,

            r.created_at,
            r.updated_at,
            r.collected_at,
            r.completed_at

        FROM on_demand_requests r

        LEFT JOIN collectors c
            ON r.collector_id = c.collector_id

        WHERE r.business_id = $1

        ORDER BY r.request_id DESC;
    `;

    const { rows } = await pool.query(
        query,
        [businessId]
    );

    return rows;
}


    // ===========================================
    // Get Requests By Collector
    // ===========================================
   async getRequestsByCollector(collectorId) {

    const query = `
        SELECT
            r.*,

            b.business_name,
            b.owner_name,

            c.full_name AS collector_name,

            a.full_name AS approved_by_name

        FROM on_demand_requests r

        INNER JOIN business_owners b
            ON r.business_id = b.business_id

        LEFT JOIN collectors c
            ON r.collector_id = c.collector_id

        LEFT JOIN municipal_administrators a
            ON r.approved_by = a.admin_id

        WHERE r.collector_id = $1

        ORDER BY r.created_at DESC;
    `;


    const { rows } = await pool.query(
        query,
        [collectorId]
    );


   

console.log("COLLECTOR ID:", collectorId);
console.log("ROWS LENGTH:", rows.length);
console.log("ROWS DATA:", JSON.stringify(rows, null, 2));
    return rows;
}


    // ===========================================
    // Get Pending Requests
    // ===========================================
    // ===========================================
// Get Pending Requests
// ===========================================
async getPendingRequests() {

    const query = `
        SELECT
            r.*,

            b.business_name,
            b.owner_name,
            b.phone_number AS phone_number,

            r.created_at AS request_date,

            c.full_name AS collector_name,

            a.full_name AS approved_by_name

        FROM on_demand_requests r

        INNER JOIN business_owners b
            ON r.business_id = b.business_id

        LEFT JOIN collectors c
            ON r.collector_id = c.collector_id

        LEFT JOIN municipal_administrators a
            ON r.approved_by = a.admin_id

        WHERE r.status = 'Pending'

        ORDER BY r.created_at DESC;
    `;

    const { rows } = await pool.query(query);

    return rows;
}


    // ===========================================
    // Get All Requests
    // ===========================================
    // ===========================================
// Get All Requests
// ===========================================
async getAllRequests() {

    const query = `
        SELECT
            r.*,

            b.business_name,
            b.owner_name,
            b.phone_number AS phone_number,

            r.created_at AS request_date,

            c.full_name AS collector_name,

            a.full_name AS approved_by_name

        FROM on_demand_requests r

        INNER JOIN business_owners b
            ON r.business_id = b.business_id

        LEFT JOIN collectors c
            ON r.collector_id = c.collector_id

        LEFT JOIN municipal_administrators a
            ON r.approved_by = a.admin_id

        ORDER BY r.created_at DESC;
    `;

    const { rows } = await pool.query(query);

    return rows;
}

    // ===========================================
    // Get Request By ID
    // ===========================================
    // ===========================================
// Get Request By ID
// ===========================================
async getRequestById(requestId) {

    const query = `
        SELECT
            r.*,

            b.business_name,
            b.owner_name,
            b.phone_number AS phone_number,

            r.created_at AS request_date,

            c.full_name AS collector_name,

            a.full_name AS approved_by_name

        FROM on_demand_requests r

        INNER JOIN business_owners b
            ON r.business_id = b.business_id

        LEFT JOIN collectors c
            ON r.collector_id = c.collector_id

        LEFT JOIN municipal_administrators a
            ON r.approved_by = a.admin_id

        WHERE r.request_id = $1;
    `;

    const { rows } = await pool.query(
        query,
        [requestId]
    );

    return rows[0] || null;
}
    // ===========================================
    // Approve Request
    // Pending → Approved
    // ===========================================
    async approveRequest(requestId, adminId) {

        const query = `
            UPDATE on_demand_requests

            SET
                status = 'Approved',
                approved_by = $2,
                approved_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP

            WHERE request_id = $1
            AND status = 'Pending'

            RETURNING *;
        `;

        const { rows } = await pool.query(
            query,
            [
                requestId,
                adminId
            ]
        );

        return rows[0] || null;
    }


    // ===========================================
    // Reject Request
    // Pending → Rejected
    // ===========================================
    async rejectRequest(requestId) {

        const query = `
            UPDATE on_demand_requests

            SET
                status = 'Rejected',
                updated_at = CURRENT_TIMESTAMP

            WHERE request_id = $1
            AND status = 'Pending'

            RETURNING *;
        `;

        const { rows } = await pool.query(
            query,
            [requestId]
        );

        return rows[0] || null;
    }


    
// ===========================================
// Assign Collector
// Municipal Admin → Assign Collector
// ===========================================
async assignCollector(requestId, collectorId) {

    // Check collector
    const collector = await pool.query(
        `
        SELECT
            collector_id,
            full_name,
            is_active
        FROM collectors
        WHERE collector_id = $1
        `,
        [collectorId]
    );

    // Collector does not exist
    if (!collector.rows.length) {
        throw new Error("Collector not found.");
    }

    // Collector is inactive
    if (!collector.rows[0].is_active) {
        throw new Error(
            "Cannot assign an inactive collector."
        );
    }

    // Assign collector to request
    const { rows } = await pool.query(
        `
        UPDATE on_demand_requests
        SET
            collector_id = $1,
            status = 'Assigned',
            updated_at = CURRENT_TIMESTAMP
        WHERE request_id = $2
        RETURNING *;
        `,
        [
            collectorId,
            requestId
        ]
    );

    return rows[0] || null;
}
// ===========================================
// Collector Starts Collection
// Assigned → In Progress
// ===========================================
async startCollection(
    requestId,
    collectorId
) {

    const query = `
        UPDATE on_demand_requests

        SET
            status = 'In Progress',
            updated_at = CURRENT_TIMESTAMP

        WHERE request_id = $1
        AND collector_id = $2
        AND status = 'Assigned'

        RETURNING *;
    `;


    const { rows } = await pool.query(
        query,
        [
            requestId,
            collectorId
        ]
    );


    return rows[0] || null;
}



// ===========================================
// Collector Completes Collection
// In Progress → Collected
// ===========================================
async completeCollection(
    requestId,
    collectorId
) {

    const query = `
        UPDATE on_demand_requests

        SET
            status = 'Collected',
            collected_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP

        WHERE request_id = $1
        AND collector_id = $2
        AND status = 'In Progress'

        RETURNING *;
    `;


    const { rows } = await pool.query(
        query,
        [
            requestId,
            collectorId
        ]
    );


    return rows[0] || null;
}

    // ===========================================
    async confirmCompletion(
        requestId,
        businessId
    ) {

        const query = `
            UPDATE on_demand_requests

            SET
                status = 'Completed',
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP

            WHERE request_id = $1
            AND business_id = $2
            AND status = 'Collected'

            RETURNING *;
        `;

        const { rows } = await pool.query(
            query,
            [
                requestId,
                businessId
            ]
        );

        return rows[0] || null;
    }


    // ===========================================
    // Cancel Request
    // Pending / Approved → Cancelled
    // ===========================================
    async cancelRequest(
        requestId,
        businessId
    ) {

        const query = `
            UPDATE on_demand_requests

            SET
                status = 'Cancelled',
                updated_at = CURRENT_TIMESTAMP

            WHERE request_id = $1
            AND business_id = $2
            AND status IN ('Pending', 'Approved')

            RETURNING *;
        `;

        const { rows } = await pool.query(
            query,
            [
                requestId,
                businessId
            ]
        );

        return rows[0] || null;
    }


    // ===========================================
    // Update Request Status
    // ===========================================
    async updateStatus(
        requestId,
        status
    ) {

        const allowedStatuses = [
            "Pending",
            "Approved",
            "Assigned",
            "In Progress",
            "Collected",
            "Completed",
            "Rejected",
            "Cancelled"
        ];


        if (!allowedStatuses.includes(status)) {
            throw new Error(
                "Invalid request status."
            );
        }


        const query = `
            UPDATE on_demand_requests

            SET
                status = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE request_id = $2

            RETURNING *;
        `;

        const { rows } = await pool.query(
            query,
            [
                status,
                requestId
            ]
        );

        return rows[0] || null;
    }


    // ===========================================
    // Delete Request
    // ===========================================
    async deleteRequest(requestId) {

        const query = `
            DELETE FROM on_demand_requests

            WHERE request_id = $1

            RETURNING *;
        `;

        const { rows } = await pool.query(
            query,
            [requestId]
        );

        return rows[0] || null;
    }


    // ===========================================
    // Count Requests
    // ===========================================
    async countRequests() {

        const query = `
            SELECT
                COUNT(*)::INTEGER AS total_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Pending'
                )::INTEGER AS pending_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Approved'
                )::INTEGER AS approved_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Assigned'
                )::INTEGER AS assigned_requests,

                COUNT(*) FILTER (
                    WHERE status = 'In Progress'
                )::INTEGER AS in_progress_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Collected'
                )::INTEGER AS collected_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Completed'
                )::INTEGER AS completed_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Rejected'
                )::INTEGER AS rejected_requests,

                COUNT(*) FILTER (
                    WHERE status = 'Cancelled'
                )::INTEGER AS cancelled_requests

            FROM on_demand_requests;
        `;

        const { rows } = await pool.query(query);

        return rows[0];
    }
}


module.exports = new RequestRepository();
