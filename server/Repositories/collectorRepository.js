const { pool } = require("../config/db");


class CollectorRepository {


    // =================================
    // Get Collector By Email
    // =================================
    async getCollectorByEmail(email){

        if(!email) return null;


        const { rows } = await pool.query(
            `
            SELECT *
            FROM collectors
            WHERE LOWER(email)=LOWER($1)
            `,
            [email.trim()]
        );


        return rows[0] || null;

    }



    // =================================
    // Create Collector
    // =================================
    async createCollector(data){


        const {
            full_name,
            phone_number,
            email,
            password_hash,
            assigned_kifle_ketema,
            kebele,
            
              is_active,
            profile_image

        } = data;



        const { rows } = await pool.query(
            `
            INSERT INTO collectors
            (
                full_name,
                phone_number,
                email,
                password_hash,
                assigned_kifle_ketema,
                kebele,
                
                is_active,
                profile_image
            )

            VALUES
            ($1,$2,LOWER($3),$4,$5,$6,$7,$8)

            RETURNING *
            `,
            [
                full_name,
                phone_number,
                email,
                password_hash,
                assigned_kifle_ketema,
                kebele,
                
                is_active,
                profile_image
            ]
        );


        return rows[0];

    }




// =================================
// Collector Dashboard
// =================================
// =================================
// Collector Dashboard
// =================================
async getCollectorDashboard(collectorId) {

    const { rows } = await pool.query(
        `
        SELECT
            c.collector_id,
            c.full_name,
            c.phone_number,
            c.email,
            c.assigned_kifle_ketema,
            c.kebele,
            c.sefer,
            r.house_number,

            c.is_active,


           (
    SELECT COUNT(*)
    FROM on_demand_requests r
    WHERE r.collector_id = c.collector_id
    AND r.status IN (
        'Assigned',
        'In Progress',
        'Collected'
    )
) AS today_tasks,


(
    SELECT COUNT(*)
    FROM on_demand_requests r
    WHERE r.collector_id = c.collector_id
    AND r.status = 'Completed'
) AS completed_today,


(
    SELECT COUNT(*)
    FROM on_demand_requests r
    WHERE r.collector_id = c.collector_id
    AND r.status IN (
        'Assigned',
        'In Progress'
    )
) AS pending_tasks

        FROM collectors c

        WHERE c.collector_id = $1
        `,
        [
            collectorId
        ]
    );


    if(!rows.length){
        return null;
    }


    const row = rows[0];


    return {

        collector:{
            collector_id: row.collector_id,
            full_name: row.full_name,
            phone_number: row.phone_number,
            email: row.email,
            assigned_kifle_ketema:
                row.assigned_kifle_ketema,
            kebele: row.kebele,
            sefer: row.sefer,
            is_active: row.is_active
        },


        stats:{
            todayTasks:
                Number(row.today_tasks || 0),

            completedToday:
                Number(row.completed_today || 0),

            pendingTasks:
                Number(row.pending_tasks || 0)
        }

    };

}
    // =================================
    // Get All Collectors
    // =================================
    // =================================
// Get All Active Collectors
// =================================
async getAllCollectors(kifleKetema = null) {

    let query = `
        SELECT
            collector_id,
            full_name,
            phone_number,
            email,
            assigned_kifle_ketema,
            kebele,
            is_active
        FROM collectors
        WHERE is_active = true
    `;

    const values = [];

    if (kifleKetema) {
        query += `
            AND LOWER(assigned_kifle_ketema) = LOWER($1)
        `;

        values.push(kifleKetema);
    }

    query += `
        ORDER BY full_name ASC
    `;

    const { rows } = await pool.query(query, values);

    console.log("ACTIVE COLLECTORS:", rows);

    return rows;
}
// =================================
// Get Assigned Requests
// =================================
// =================================
// Get Assigned Requests
// =================================
async getAssignedRequests(collectorId) {
    const { rows } = await pool.query(
        `
        SELECT
            r.request_id,
            r.business_id,
            r.collector_id,
            r.team_id,

            r.kifle_ketema,
            r.kebele,
            r.sefer,

            b.business_name,
            b.owner_name,
            b.phone_number,
            b.house_number,

            r.description,
            r.latitude,
            r.longitude,
            r.preferred_collection_date,
            r.status,

            ct.team_name,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,
            leader.email AS team_leader_email,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'collector_id', member.collector_id,
                        'full_name', member.full_name,
                        'phone_number', member.phone_number,
                        'email', member.email,
                        'assigned_kifle_ketema',
                            member.assigned_kifle_ketema,
                        'kebele', member.kebele,
                        'is_active', member.is_active
                    )
                ) FILTER (
                    WHERE member.collector_id IS NOT NULL
                ),
                '[]'::json
            ) AS team_members

        FROM on_demand_requests r

        INNER JOIN business_owners b
            ON b.business_id = r.business_id

        LEFT JOIN collection_teams ct
            ON ct.team_id = r.team_id

        LEFT JOIN collectors leader
            ON leader.collector_id = ct.team_leader_id

        LEFT JOIN collection_team_members ctm
            ON ctm.team_id = r.team_id

        LEFT JOIN collectors member
            ON member.collector_id = ctm.collector_id

        WHERE
            (
                r.collector_id = $1
                OR ctm.collector_id = $1
            )

        AND r.status IN (
            'Assigned',
            'In Progress',
            'Collected',
            'Completed'
        )

        GROUP BY
            r.request_id,
            r.business_id,
            r.collector_id,
            r.team_id,
            r.kifle_ketema,
            r.kebele,
            r.sefer,
            b.business_name,
            b.owner_name,
            b.phone_number,
            b.house_number,
            r.description,
            r.latitude,
            r.longitude,
            r.preferred_collection_date,
            r.status,
            ct.team_name,
            ct.team_leader_id,
            leader.collector_id,
            leader.full_name,
            leader.phone_number,
            leader.email

        ORDER BY r.request_id DESC;
        `,
        [collectorId]
    );

    console.log(
        "ASSIGNED REQUESTS FOR COLLECTOR:",
        collectorId,
        rows
    );

    return rows;
}



async getAssignedRequestDetails(requestId, collectorId) {
    const { rows } = await pool.query(
        `
        SELECT
            r.request_id,
            r.business_id,
            r.team_id,
            r.collector_id,

            r.kifle_ketema,
            r.kebele,
            r.sefer,
            r.latitude,
            r.longitude,
            r.preferred_collection_date,
            r.description,
            r.status,

            b.business_name,
            b.owner_name,
            b.phone_number AS business_phone,
            b.email AS business_email,
            b.house_number,

            ct.team_name,
            ct.status AS team_status,
            ct.team_leader_id,

            leader.full_name AS team_leader_name,
            leader.phone_number AS team_leader_phone,
            leader.email AS team_leader_email,

            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object(
                        'collector_id', member.collector_id,
                        'full_name', member.full_name,
                        'phone_number', member.phone_number,
                        'email', member.email,
                        'assigned_kifle_ketema',
                            member.assigned_kifle_ketema,
                        'kebele', member.kebele,
                        'is_active', member.is_active
                    )
                ) FILTER (
                    WHERE member.collector_id IS NOT NULL
                ),
                '[]'
            ) AS team_members

        FROM on_demand_requests r

        INNER JOIN business_owners b
            ON b.business_id = r.business_id

        LEFT JOIN collection_teams ct
            ON ct.team_id = r.team_id

        LEFT JOIN collectors leader
            ON leader.collector_id = ct.team_leader_id

        LEFT JOIN collection_team_members ctm
            ON ctm.team_id = ct.team_id

        LEFT JOIN collectors member
            ON member.collector_id = ctm.collector_id

        WHERE r.request_id = $1

        AND (
            r.collector_id = $2
            OR ctm.collector_id = $2
        )

        GROUP BY
            r.request_id,
            b.business_id,
            ct.team_id,
            leader.collector_id;
        `,
        [requestId, collectorId]
    );

    return rows[0] || null;
}


// =================================
// Get Collector Tasks
// On-Demand Requests + Schedules
// =================================
async getCollectorTasks(collectorId) {

    // =================================
    // 1. ON-DEMAND REQUESTS
    // =================================

    const requestsResult = await pool.query(
        `
        SELECT
            r.request_id AS task_id,
            'REQUEST' AS task_type,

            r.collector_id,

            r.kifle_ketema,
            r.kebele,
            r.sefer,

            r.description,

            r.preferred_collection_date,
            r.status,

            b.business_name,
            b.owner_name,
            b.phone_number,

            NULL AS day_of_week,
            NULL AS frequency,
            NULL AS start_time,
            NULL AS end_time

        FROM on_demand_requests r

        JOIN business_owners b
            ON r.business_id = b.business_id

        WHERE r.collector_id = $1

        AND r.status IN (
            'Assigned',
            'In Progress',
            'Collected',
            'Completed'
        )
        `,
        [collectorId]
    );


    // =================================
    // 2. COLLECTION SCHEDULES
    // =================================

    const schedulesResult = await pool.query(
        `
        SELECT
            cs.schedule_id AS task_id,
            'SCHEDULE' AS task_type,

            cs.collector_id,

            cs.kifle_ketema,
            cs.kebele,
            cs.sefer,

            NULL AS description,

            NULL AS preferred_collection_date,
            cs.status,

            NULL AS business_name,
            NULL AS owner_name,
            c.phone_number,

            cs.day_of_week,
            cs.frequency,
            cs.start_time,
            cs.end_time

        FROM collection_schedules cs

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE cs.collector_id = $1

        AND UPPER(TRIM(cs.status)) = 'ACTIVE'

        ORDER BY
            cs.day_of_week,
            cs.start_time
        `,
        [collectorId]
    );


    // =================================
    // 3. COMBINE
    // =================================

    return [
        ...requestsResult.rows,
        ...schedulesResult.rows
    ];
}
//================
    // Get Collector By ID
    // =================================
    async getCollectorById(id){


        const { rows } = await pool.query(
            `
            SELECT *
            FROM collectors
            WHERE collector_id=$1
            `,
            [id]
        );


        return rows[0];

    }


    // =================================
    // Find Collector By Location
    // =================================
    async getCollectorByLocation(
        kifle_ketema,
        kebele,
        sefer
    ){


        const { rows } = await pool.query(
            `
            SELECT *
            FROM collectors

            WHERE
            assigned_kifle_ketema=$1
            AND kebele=$2
            AND sefer=$3

            LIMIT 1
            `,
            [
                kifle_ketema,
                kebele,
                sefer
            ]
        );


        return rows[0] || null;

    }





    // =================================
    // Update Collector
    // =================================
    async updateCollector(id,data){


        const {
            full_name,
            phone_number,
            email,
            assigned_kifle_ketema,
            kebele,
            sefer,
            is_active,
            profile_image

        }=data;



        const { rows } = await pool.query(
            `
            UPDATE collectors

            SET

            full_name=$1,
            phone_number=$2,
            email=LOWER($3),
            assigned_kifle_ketema=$4,
            kebele=$5,
            sefer=$6,
            profile_image=$7,
            is_active=$8,
            updated_at=CURRENT_TIMESTAMP


            WHERE collector_id=$9

            RETURNING *
            `,
            [
                full_name,
                phone_number,
                email,
                assigned_kifle_ketema,
                kebele,
                sefer,
                profile_image,
                is_active,
                id
            ]
        );


        return rows[0];

    }



// =================================
// Activate / Deactivate Collector
// =================================
async updateCollectorStatus(id, is_active) {

    const { rows } = await pool.query(
        `
        UPDATE collectors
        SET
            is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE collector_id = $2
        RETURNING *;
        `,
        [
            is_active,
            id
        ]
    );

    return rows[0] || null;
}

    // =================================
    // Delete Collector
    // =================================
    async deleteCollector(id){


        const { rows } = await pool.query(
            `
            DELETE FROM collectors

            WHERE collector_id=$1

            RETURNING *
            `,
            [id]
        );


        return rows[0];

    }



// =================================
// Update Request Status
// =================================
async updateRequestStatus(
    requestId,
    collectorId,
    status
){

    const { rows } = await pool.query(
        `
        UPDATE on_demand_requests

        SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP

        WHERE 
            request_id = $2
            AND collector_id = $3

        RETURNING *
        `,
        [
            status,
            requestId,
            collectorId
        ]
    );


    return rows[0] || null;

}
// =================================
// Collector Start Collection
// Assigned -> In Progress
// =================================
async startCollection(requestId, collectorId){

    const { rows } = await pool.query(
        `
        UPDATE on_demand_requests

        SET
            status = 'In Progress',
            updated_at = CURRENT_TIMESTAMP

        WHERE request_id = $1
        AND collector_id = $2
        AND status = 'Assigned'

        RETURNING *;
        `,
        [
            requestId,
            collectorId
        ]
    );

    return rows[0] || null;
}



// =================================
// Collector Complete Collection
// In Progress -> Collected
// =================================
async completeCollection(requestId, collectorId){

    const { rows } = await pool.query(
        `
        UPDATE on_demand_requests

        SET
            status = 'Collected',
            collected_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP

        WHERE request_id = $1
        AND collector_id = $2
        AND status = 'In Progress'

        RETURNING *;
        `,
        [
            requestId,
            collectorId
        ]
    );

    return rows[0] || null;

}
    // =================================
    // Collector Schedules
    // =================================
    // =================================
// Collector Schedules
// =================================
async getCollectorSchedules(id) {

    const { rows } = await pool.query(
        `
        SELECT
            cs.schedule_id,
            cs.collector_id,
            cs.kifle_ketema,
            cs.kebele,
            cs.sefer,
            cs.day_of_week,
            cs.frequency,
            cs.start_time,
            cs.end_time,
            cs.status,

            c.full_name AS collector_name,
            c.phone_number AS collector_phone

        FROM collection_schedules cs

        LEFT JOIN collectors c
            ON cs.collector_id = c.collector_id

        WHERE cs.collector_id = $1

        AND UPPER(TRIM(cs.status)) = 'ACTIVE'

        ORDER BY
            cs.day_of_week,
            cs.start_time;
        `,
        [id]
    );

    return rows;
}




    // =================================
    // Count Collectors
    // =================================
    async countCollectors(){


        const { rows } = await pool.query(
            `
            SELECT COUNT(*) total
            FROM collectors
            `
        );


        return Number(rows[0].total);

    }

async searchCollectors(keyword) {

    const { rows } = await pool.query(
        `
        SELECT *
        FROM collectors
        WHERE
            full_name ILIKE $1
            OR phone_number ILIKE $1
            OR email ILIKE $1
            OR assigned_kifle_ketema ILIKE $1
        ORDER BY collector_id DESC;
        `,
        [`%${keyword}%`]
    );

    return rows;
}
// =================================
// Update My Profile
// =================================
async updateMyProfile(id, data) {

    const {
        full_name,
        phone_number,
        email
    } = data;

    const { rows } = await pool.query(
        `
        UPDATE collectors
        SET
            full_name = $1,
            phone_number = $2,
            email = LOWER($3),
            updated_at = CURRENT_TIMESTAMP
        WHERE collector_id = $4
        RETURNING
            collector_id,
            full_name,
            phone_number,
            email,
            assigned_kifle_ketema,
            kebele,
            sefer,
            is_active,
            profile_image;
        `,
        [
            full_name,
            phone_number,
            email,
            id
        ]
    );

    return rows[0];
}
// =================================
// Update Password
// =================================
async updatePassword(id, password_hash) {

    const { rows } = await pool.query(
        `
        UPDATE collectors
        SET
            password_hash = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE collector_id = $2
        RETURNING collector_id;
        `,
        [
            password_hash,
            id
        ]
    );

    return rows[0];
}
}


module.exports = new CollectorRepository();