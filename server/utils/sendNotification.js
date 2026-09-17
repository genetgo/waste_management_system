
const notificationRepository = require("../repositories/notificationRepository");
const { getSocket } = require("./socket");

const sendNotification = async ({
    user_id,
    user_role,
    title,
    message,
    notification_type = null,
    reference_id = null
}) => {

    console.log("=================================");
    console.log("📩 SEND NOTIFICATION");
    console.log("USER ID:", user_id);
    console.log("USER ROLE:", user_role);
    console.log("TITLE:", title);
    console.log("MESSAGE:", message);
    console.log("NOTIFICATION TYPE:", notification_type);
    console.log("REFERENCE ID:", reference_id);

    // ==========================================
    // 1. SAVE TO DATABASE
    // ==========================================

    const notification =
        await notificationRepository.createNotification({
            user_id,
            user_role,
            title,
            message,
            notification_type,
            reference_id
        });

    console.log(
        "✅ NOTIFICATION SAVED:",
        notification
    );

    // ==========================================
    // 2. GET SOCKET.IO INSTANCE
    // ==========================================

    const io = getSocket();

    if (!io) {

        console.log(
            "❌ SOCKET.IO INSTANCE NOT AVAILABLE"
        );

        return notification;
    }

    console.log(
        "✅ SOCKET.IO INSTANCE AVAILABLE"
    );

    // ==========================================
    // 3. CREATE ROOM
    // ==========================================

    const room =
        `${user_role}_${user_id}`;

    console.log(
        "📡 SEND SOCKET ROOM:",
        room
    );

    // ==========================================
    // 4. CHECK ROOM
    // ==========================================

    const roomMembers =
        io.sockets.adapter.rooms.get(room);

    console.log(
        "📡 ROOM DATA:",
        roomMembers
    );

    if (!roomMembers) {

        console.log(
            "⚠️ NO SOCKET CLIENT IN ROOM:",
            room
        );

        return notification;
    }

    console.log(
        "👥 ROOM MEMBERS:",
        [...roomMembers]
    );

    // ==========================================
    // 5. SEND REAL-TIME NOTIFICATION
    // ==========================================

    io.to(room).emit(
        "newNotification",
        notification
    );

    console.log(
        "🔥 SOCKET NOTIFICATION SENT:",
        room
    );

    console.log("=================================");

    return notification;
};

module.exports = sendNotification;
