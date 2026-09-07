import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: true
});

socket.on("connect", () => {

    console.log(
        "FRONT SOCKET CONNECTED:",
        socket.id
    );

    socket.emit("pingTest");
});

export default socket;