require("dotenv").config();

const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");

const { Server } = require("socket.io");
const { setSocket } = require("./utils/socket");

const PORT = process.env.PORT || 5000;

// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});

// Make socket available to backend services
setSocket(io);

// ==========================================
// SOCKET CONNECTION
// ==========================================

io.on("connection", (socket) => {

    console.log("=================================");
    console.log("🔌 CLIENT CONNECTED");
    console.log("SOCKET ID:", socket.id);
    console.log("=================================");

    // ======================================
    // LOG ALL EVENTS
    // ======================================

    socket.onAny((event, ...args) => {
        console.log("📩 SOCKET EVENT:", event);
        console.log("DATA:", args);
    });

    // ======================================
    // JOIN ROOM
    // ======================================

    socket.on("joinRoom", ({ user_id, user_role }) => {

        if (!user_id || !user_role) {

            console.log(
                "❌ JOIN ROOM FAILED: Missing user data"
            );

            return;
        }

        const room =
            `${user_role}_${user_id}`;

        socket.join(room);

        console.log("=================================");
        console.log("🏠 ROOM JOINED");
        console.log("USER ID:", user_id);
        console.log("USER ROLE:", user_role);
        console.log("ROOM:", room);
        console.log("SOCKET ID:", socket.id);

        const members =
            io.sockets.adapter.rooms.get(room);

        console.log(
            "ROOM MEMBERS:",
            members
                ? [...members]
                : []
        );

        console.log(
            "ALL ROOMS:",
            [...io.sockets.adapter.rooms.keys()]
        );

        console.log("=================================");
    });

    // ======================================
    // LEAVE ROOM
    // ======================================

    socket.on("leaveRoom", ({ user_id, user_role }) => {

        const room =
            `${user_role}_${user_id}`;

        socket.leave(room);

        console.log(
            "🚪 LEFT ROOM:",
            room
        );
    });

    // ======================================
    // PING TEST
    // ======================================

    socket.on("pingTest", () => {

        console.log(
            "🏓 PING RECEIVED:",
            socket.id
        );

        
    });

    // ======================================
    // DISCONNECT
    // ======================================

    socket.on("disconnect", (reason) => {

        console.log(
            "❌ CLIENT DISCONNECTED:",
            socket.id
        );

        console.log(
            "Reason:",
            reason
        );
    });
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {

    try {

        await connectDB();

        server.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `🚀 Server running on http://localhost:${PORT}`
                );

            }
        );

    } catch (error) {

        console.error(
            "❌ SERVER START ERROR:",
            error
        );

        process.exit(1);
    }
};

startServer();