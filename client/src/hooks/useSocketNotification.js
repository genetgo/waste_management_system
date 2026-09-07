import { useEffect } from "react";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";

const useSocketNotification = () => {

    const { user } = useAuth();

    useEffect(() => {

        console.log("========== SOCKET AUTH ==========");

        console.log("AUTH USER:", user);
        console.log("USER ID:", user?.id);
        console.log("USER ROLE:", user?.role);

        if (!user?.id || !user?.role) {
            console.log("❌ Cannot join socket room");
            return;
        }

        const userId = user.id;
        const userRole = user.role;
        const room = `${userRole}_${userId}`;

        const joinRoom = () => {

            console.log("=================================");
            console.log("🟢 SOCKET CONNECTED");
            console.log("SOCKET ID:", socket.id);
            console.log("🚪 JOINING ROOM:", room);

            socket.emit("joinRoom", {
                user_id: userId,
                user_role: userRole,
            });

            console.log("📤 JOIN ROOM SENT");
            console.log("=================================");
        };

        const handleNotification = (notification) => {

            console.log(
                "🔥🔥🔥 NEW NOTIFICATION 🔥🔥🔥"
            );

            console.log("NOTIFICATION:", notification);

            alert(
                `${notification.title}\n\n${notification.message}`
            );
        };

        const handleDisconnect = (reason) => {

            console.log(
                "🔴 SOCKET DISCONNECTED"
            );

            console.log(
                "REASON:",
                reason
            );
        };

        socket.on(
            "connect",
            joinRoom
        );

        socket.on(
            "newNotification",
            handleNotification
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        // Already connected
        if (socket.connected) {
            joinRoom();
        }

        return () => {

            socket.off(
                "connect",
                joinRoom
            );

            socket.off(
                "newNotification",
                handleNotification
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

        };

    }, [
        user?.id,
        user?.role
    ]);

    return null;
};

export default useSocketNotification;