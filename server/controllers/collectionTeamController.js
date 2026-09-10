
const collectionTeamRepository = require("../repositories/collectionTeamRepository");
const municipalAdminRepository = require("../repositories/municipalAdminRepository");

// ==========================================
// ROLE NORMALIZER
// ==========================================
const normalizeRole = (role) => {
    return String(role || "")
        .trim()
        .toUpperCase()
        .replace(/[\s_-]/g, "");
};


// ==========================================
// CHECK MUNICIPAL ADMIN
// ==========================================
const isMunicipalAdmin = (req) => {
    return normalizeRole(req.user?.role) === "MUNICIPALADMIN";
};


// ==========================================
// GET LOGGED-IN MUNICIPAL ADMIN
// ==========================================
const getLoggedInAdmin = async (req) => {
    if (!req.user?.id) {
        return null;
    }

    return await municipalAdminRepository.getMunicipalAdminById(
        req.user.id
    );
};


// ==========================================
// CHECK TEAM BELONGS TO ADMIN KIFLE
// ==========================================
const checkTeamAccess = (team, admin) => {

    if (!team || !admin) {
        return false;
    }

    return (
        String(team.kifle_ketema || "").trim().toLowerCase() ===
        String(admin.assigned_kifle_ketema || "").trim().toLowerCase()
    );
};


// ==========================================
// CREATE TEAM
// ==========================================
exports.createTeam = async (req, res) => {

    try {

        const { team_name, kebele } = req.body;

        // ------------------------------------------
        // ROLE CHECK
        // ------------------------------------------
        if (!isMunicipalAdmin(req)) {

            return res.status(403).json({
                success: false,
                message: "Only Municipal Admin can create teams."
            });

        }


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------
        if (!team_name || !team_name.trim()) {

            return res.status(400).json({
                success: false,
                message: "Team name is required."
            });

        }


        if (!kebele || !kebele.trim()) {

            return res.status(400).json({
                success: false,
                message: "Kebele is required."
            });

        }


        // ------------------------------------------
        // GET ADMIN
        // ------------------------------------------
        const admin = await getLoggedInAdmin(req);

        if (!admin) {

            return res.status(404).json({
                success: false,
                message: "Municipal Admin not found."
            });

        }


        // ------------------------------------------
        // CREATE TEAM
        // IMPORTANT:
        // Repository expects an object
        // ------------------------------------------
        const team =
            await collectionTeamRepository.createTeam({

                team_name: team_name.trim(),

                admin_id: admin.admin_id,

                kifle_ketema:
                    admin.assigned_kifle_ketema,

                kebele: kebele.trim()

            });


        return res.status(201).json({

            success: true,

            message:
                "Collection Team created successfully.",

            data: team

        });


    } catch (error) {

        console.error(
            "CREATE TEAM ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create Collection Team.",

            error: error.message

        });

    }
};


// ==========================================
// GET ALL TEAMS
// ==========================================
exports.getAllTeams = async (req, res) => {

    try {

        if (!isMunicipalAdmin(req)) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Municipal Admin can access teams."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        const teams =
            await collectionTeamRepository.getAllTeams(
                admin.assigned_kifle_ketema
            );


        return res.status(200).json({

            success: true,

            data: teams

        });


    } catch (error) {

        console.error(
            "GET TEAMS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get Collection Teams.",

            error: error.message

        });

    }
};


// ==========================================
// GET TEAM BY ID
// ==========================================
exports.getTeamById = async (req, res) => {

    try {

        const { id } = req.params;


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        // ------------------------------------------
        // GET ADMIN
        // ------------------------------------------
        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        // ------------------------------------------
        // SECURITY CHECK
        // ------------------------------------------
        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot access this team."

            });

        }


        return res.status(200).json({

            success: true,

            data: team

        });


    } catch (error) {

        console.error(
            "GET TEAM ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get team.",

            error: error.message

        });

    }
};


// ==========================================
// UPDATE TEAM
// ==========================================
exports.updateTeam = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            team_name,
            status
        } = req.body;


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot update this team."

            });

        }


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------
        if (!team_name || !team_name.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Team name is required."

            });

        }


        const validStatuses = [
            "ACTIVE",
            "INACTIVE"
        ];


        if (
            status &&
            !validStatuses.includes(
                String(status).toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid team status."

            });

        }


        // ------------------------------------------
        // IMPORTANT:
        // Repository expects:
        // updateTeam(teamId, data)
        // ------------------------------------------
        const updatedTeam =
            await collectionTeamRepository.updateTeam(
                id,
                {
                    team_name:
                        team_name.trim(),

                    status:
                        status
                            ? String(status).toUpperCase()
                            : team.status
                }
            );


        return res.status(200).json({

            success: true,

            message:
                "Team updated successfully.",

            data: updatedTeam

        });


    } catch (error) {

        console.error(
            "UPDATE TEAM ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update team.",

            error: error.message

        });

    }
};


// ==========================================
// DELETE TEAM
// ==========================================
exports.deleteTeam = async (req, res) => {

    try {

        const { id } = req.params;


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot delete this team."

            });

        }


        await collectionTeamRepository.deleteTeam(id);


        return res.status(200).json({

            success: true,

            message:
                "Collection Team deleted successfully."

        });


    } catch (error) {

        console.error(
            "DELETE TEAM ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete team.",

            error: error.message

        });

    }
};


// ==========================================
// ADD COLLECTOR TO TEAM
// ==========================================
exports.addCollector = async (req, res) => {

    try {

        const { id } = req.params;

        const { collector_id } = req.body;


        if (!collector_id) {

            return res.status(400).json({

                success: false,

                message:
                    "Collector ID is required."

            });

        }


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot modify this team."

            });

        }


        const result =
            await collectionTeamRepository.addCollector(
                id,
                collector_id
            );


        if (!result.success) {

            const messages = {

                TEAM_NOT_FOUND:
                    "Collection Team not found.",

                COLLECTOR_NOT_FOUND:
                    "Collector not found.",

                COLLECTOR_INACTIVE:
                    "This collector is inactive.",

                KIFLE_MISMATCH:
                    "Collector and Team Kifle Ketema do not match.",

                KEBELE_MISMATCH:
                    "Collector and Team Kebele do not match.",

                ALREADY_MEMBER:
                    "Collector is already a member of this team."
            };


            return res.status(400).json({

                success: false,

                message:
                    messages[result.reason] ||
                    "Failed to add collector."

            });

        }


        return res.status(201).json({

            success: true,

            message:
                "Collector added to team successfully.",

            data: result.data

        });


    } catch (error) {

        console.error(
            "ADD COLLECTOR ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to add collector.",

            error: error.message

        });

    }
};


// ==========================================
// REMOVE COLLECTOR
// ==========================================
exports.removeCollector = async (req, res) => {

    try {

        const {
            id,
            collectorId
        } = req.params;


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot modify this team."

            });

        }


        const removed =
            await collectionTeamRepository.removeCollector(
                id,
                collectorId
            );


        if (!removed) {

            return res.status(404).json({

                success: false,

                message:
                    "Collector is not a member of this team."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Collector removed from team successfully."

        });


    } catch (error) {

        console.error(
            "REMOVE COLLECTOR ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to remove collector.",

            error: error.message

        });

    }
};


// ==========================================
// SET TEAM LEADER / DRIVER
// ==========================================
exports.setTeamLeader = async (req, res) => {

    try {

        const { id } = req.params;

        const { collector_id } = req.body;


        if (!collector_id) {

            return res.status(400).json({

                success: false,

                message:
                    "Collector ID is required."

            });

        }


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot modify this team."

            });

        }


        const result =
            await collectionTeamRepository.setTeamLeader(
                id,
                collector_id
            );


        if (!result.success) {

            const messages = {

                TEAM_NOT_FOUND:
                    "Collection Team not found.",

                COLLECTOR_NOT_MEMBER:
                    "The collector must be a member of the team before becoming Team Leader."
            };


            return res.status(400).json({

                success: false,

                message:
                    messages[result.reason] ||
                    "Failed to assign Team Leader."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Team Leader / Driver assigned successfully.",

            data: result.data

        });


    } catch (error) {

        console.error(
            "SET TEAM LEADER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to assign Team Leader."

        });

    }
};


// ==========================================
// REMOVE TEAM LEADER
// ==========================================
exports.removeTeamLeader = async (req, res) => {

    try {

        const { id } = req.params;


        const team =
            await collectionTeamRepository.getTeamById(id);


        if (!team) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        if (!checkTeamAccess(team, admin)) {

            return res.status(403).json({

                success: false,

                message:
                    "You cannot modify this team."

            });

        }


        const removed =
            await collectionTeamRepository.removeTeamLeader(id);


        if (!removed) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection Team not found."

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Team Leader / Driver removed successfully."

        });


    } catch (error) {

        console.error(
            "REMOVE TEAM LEADER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to remove Team Leader."

        });

    }
};


// ==========================================
// GET AVAILABLE COLLECTORS
// ==========================================
exports.getAvailableCollectors = async (req, res) => {

    try {

        const { kebele } = req.params;


        if (!isMunicipalAdmin(req)) {

            return res.status(403).json({

                success: false,

                message:
                    "Only Municipal Admin can access collectors."

            });

        }


        if (!kebele || !kebele.trim()) {

            return res.status(400).json({

                success: false,

                message:
                    "Kebele is required."

            });

        }


        const admin =
            await getLoggedInAdmin(req);


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Municipal Admin not found."

            });

        }


        const collectors =
            await collectionTeamRepository.getAvailableCollectors(
                admin.assigned_kifle_ketema,
                kebele.trim()
            );


        return res.status(200).json({

            success: true,

            data: collectors

        });


    } catch (error) {

        console.error(
            "GET AVAILABLE COLLECTORS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get available collectors.",

            error: error.message

        });

    }
};