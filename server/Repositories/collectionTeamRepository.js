const { pool } = require("../config/db");

class CollectionTeamRepository {

    // ==========================================
    // Create Team
    // ==========================================
    async createTeam(data) {

        const {
            team_name,
            admin_id,
            kifle_ketema,
            kebele
        } = data;

        const { rows } = await pool.query(
            `
            INSERT INTO collection_teams
            (
                team_name,
                admin_id,
                kifle_ketema,
                kebele
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                team_name,
                admin_id,
                kifle_ketema,
                kebele
            ]
        );

        return rows[0];
    }


    async getAllTeams(kifleKetema = null) {

    let query = `
        SELECT
            ct.team_id,
            ct.team_name,
            ct.admin_id,
            ct.kifle_ketema,
            ct.kebele,
            ct.team_leader_id,
            ct.status,
            ct.created_at,
            ct.updated_at,

            tl.full_name AS team_leader_name,
            tl.phone_number AS team_leader_phone,

            (
                COUNT(DISTINCT ctm.collector_id)
                +
                CASE
                    WHEN ct.team_leader_id IS NOT NULL
                    AND COUNT(ctm.collector_id) FILTER (
                        WHERE ctm.collector_id = ct.team_leader_id
                    ) = 0
                    THEN 1
                    ELSE 0
                END
            )::INT AS collector_count

        FROM collection_teams ct

        LEFT JOIN collectors tl
            ON ct.team_leader_id = tl.collector_id

        LEFT JOIN collection_team_members ctm
            ON ct.team_id = ctm.team_id
    `;

    const values = [];

    if (kifleKetema) {
        query += `
            WHERE LOWER(ct.kifle_ketema) = LOWER($1)
        `;

        values.push(kifleKetema);
    }

    query += `
        GROUP BY
            ct.team_id,
            tl.collector_id

        ORDER BY
            ct.kebele ASC,
            ct.team_name ASC
    `;

    const { rows } = await pool.query(query, values);

    return rows;
}

    // ==========================================
    // Get Team By ID
    // ==========================================
    async getTeamById(teamId) {

        const teamResult = await pool.query(
            `
            SELECT
                ct.team_id,
                ct.team_name,
                ct.admin_id,
                ct.kifle_ketema,
                ct.kebele,
                ct.team_leader_id,
                ct.status,
                ct.created_at,
                ct.updated_at,

                tl.full_name AS team_leader_name,
                tl.phone_number AS team_leader_phone

            FROM collection_teams ct

            LEFT JOIN collectors tl
                ON ct.team_leader_id = tl.collector_id

            WHERE ct.team_id = $1
            `,
            [teamId]
        );

        if (!teamResult.rows.length) {
            return null;
        }

        const team = teamResult.rows[0];


        // Get team collectors
        const membersResult = await pool.query(
    `
    SELECT DISTINCT
        c.collector_id,
        c.full_name,
        c.phone_number,
        c.email,
        c.assigned_kifle_ketema,
        c.kebele,
        c.is_active

    FROM collectors c

    WHERE c.collector_id IN (

        SELECT ctm.collector_id
        FROM collection_team_members ctm
        WHERE ctm.team_id = $1

        UNION

        SELECT ct.team_leader_id
        FROM collection_teams ct
        WHERE ct.team_id = $1
          AND ct.team_leader_id IS NOT NULL
    )

    ORDER BY c.full_name ASC
    `,
    [teamId]
);


        return {
            ...team,
            collectors: membersResult.rows
        };
    }


    // ==========================================
    // Add Collector To Team
    // ==========================================
    async addCollector(teamId, collectorId) {

        // --------------------------------------
        // Get Team
        // --------------------------------------
        const teamResult = await pool.query(
            `
            SELECT
                team_id,
                kifle_ketema,
                kebele
            FROM collection_teams
            WHERE team_id = $1
            `,
            [teamId]
        );

        if (!teamResult.rows.length) {
            return {
                success: false,
                reason: "TEAM_NOT_FOUND"
            };
        }

        const team = teamResult.rows[0];


        // --------------------------------------
        // Get Collector
        // --------------------------------------
        const collectorResult = await pool.query(
            `
            SELECT
                collector_id,
                assigned_kifle_ketema,
                kebele,
                is_active
            FROM collectors
            WHERE collector_id = $1
            `,
            [collectorId]
        );

        if (!collectorResult.rows.length) {
            return {
                success: false,
                reason: "COLLECTOR_NOT_FOUND"
            };
        }

        const collector = collectorResult.rows[0];


        // --------------------------------------
        // Collector must be active
        // --------------------------------------
        if (!collector.is_active) {
            return {
                success: false,
                reason: "COLLECTOR_INACTIVE"
            };
        }


        // --------------------------------------
        // Same Kifle Ketema
        // --------------------------------------
        if (
            collector.assigned_kifle_ketema?.toLowerCase() !==
            team.kifle_ketema?.toLowerCase()
        ) {
            return {
                success: false,
                reason: "KIFLE_MISMATCH"
            };
        }


        // --------------------------------------
        // Same Kebele
        // --------------------------------------
        if (
            collector.kebele?.toLowerCase() !==
            team.kebele?.toLowerCase()
        ) {
            return {
                success: false,
                reason: "KEBELE_MISMATCH"
            };
        }


        // --------------------------------------
        // Check duplicate membership
        // --------------------------------------
        const existing = await pool.query(
            `
            SELECT team_member_id
            FROM collection_team_members
            WHERE team_id = $1
              AND collector_id = $2
            `,
            [
                teamId,
                collectorId
            ]
        );

        if (existing.rows.length) {
            return {
                success: false,
                reason: "ALREADY_MEMBER"
            };
        }


        // --------------------------------------
        // Add Collector
        // --------------------------------------
        const { rows } = await pool.query(
            `
            INSERT INTO collection_team_members
            (
                team_id,
                collector_id
            )
            VALUES ($1, $2)

            RETURNING *
            `,
            [
                teamId,
                collectorId
            ]
        );


        return {
            success: true,
            data: rows[0]
        };
    }


    // ==========================================
    // Remove Collector From Team
    // ==========================================
    async removeCollector(teamId, collectorId) {

        const { rows } = await pool.query(
            `
            DELETE FROM collection_team_members

            WHERE team_id = $1
              AND collector_id = $2

            RETURNING *
            `,
            [
                teamId,
                collectorId
            ]
        );


        if (!rows.length) {
            return null;
        }


        // --------------------------------------
        // If removed collector was Team Leader
        // remove leader assignment
        // --------------------------------------
        await pool.query(
            `
            UPDATE collection_teams

            SET
                team_leader_id = NULL,
                updated_at = CURRENT_TIMESTAMP

            WHERE team_id = $1
              AND team_leader_id = $2
            `,
            [
                teamId,
                collectorId
            ]
        );


        return rows[0];
    }


    // ==========================================
    // Set Team Leader / Driver
    // ==========================================
    async setTeamLeader(teamId, collectorId) {

        // --------------------------------------
        // Check collector is member of team
        // --------------------------------------
        const memberResult = await pool.query(
            `
            SELECT
                c.collector_id,
                c.full_name

            FROM collection_team_members ctm

            JOIN collectors c
                ON ctm.collector_id = c.collector_id

            WHERE ctm.team_id = $1
              AND ctm.collector_id = $2
            `,
            [
                teamId,
                collectorId
            ]
        );


        if (!memberResult.rows.length) {
            return {
                success: false,
                reason: "COLLECTOR_NOT_MEMBER"
            };
        }


        // --------------------------------------
        // Set Leader
        // --------------------------------------
        const { rows } = await pool.query(
            `
            UPDATE collection_teams

            SET
                team_leader_id = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE team_id = $2

            RETURNING *
            `,
            [
                collectorId,
                teamId
            ]
        );


        if (!rows.length) {
            return {
                success: false,
                reason: "TEAM_NOT_FOUND"
            };
        }


        return {
            success: true,
            data: rows[0]
        };
    }


    // ==========================================
    // Remove Team Leader
    // ==========================================
    async removeTeamLeader(teamId) {

        const { rows } = await pool.query(
            `
            UPDATE collection_teams

            SET
                team_leader_id = NULL,
                updated_at = CURRENT_TIMESTAMP

            WHERE team_id = $1

            RETURNING *
            `,
            [teamId]
        );


        return rows[0] || null;
    }


    // ==========================================
    // Update Team
    // ==========================================
    async updateTeam(teamId, data) {

        const {
            team_name,
            status
        } = data;


        const { rows } = await pool.query(
            `
            UPDATE collection_teams

            SET
                team_name = $1,
                status = $2,
                updated_at = CURRENT_TIMESTAMP

            WHERE team_id = $3

            RETURNING *
            `,
            [
                team_name,
                status,
                teamId
            ]
        );


        return rows[0] || null;
    }


    // ==========================================
    // Delete Team
    // ==========================================
    async deleteTeam(teamId) {

        const { rows } = await pool.query(
            `
            DELETE FROM collection_teams

            WHERE team_id = $1

            RETURNING *
            `,
            [teamId]
        );


        return rows[0] || null;
    }


    // ==========================================
    // Get Available Collectors
    // ==========================================
    async getAvailableCollectors(kifleKetema, kebele) {

        const { rows } = await pool.query(
            `
            SELECT
                c.collector_id,
                c.full_name,
                c.phone_number,
                c.email,
                c.assigned_kifle_ketema,
                c.kebele,
                c.is_active

            FROM collectors c

            WHERE c.is_active = true

              AND LOWER(c.assigned_kifle_ketema)
                  = LOWER($1)

              AND LOWER(c.kebele)
                  = LOWER($2)

            ORDER BY c.full_name ASC
            `,
            [
                kifleKetema,
                kebele
            ]
        );


        return rows;
    }
}


module.exports = new CollectionTeamRepository();