let io = null;

const setSocket = (socket) => {
    io = socket;
};

const getSocket = () => {
    return io;
};

module.exports = {
    setSocket,
    getSocket,
};