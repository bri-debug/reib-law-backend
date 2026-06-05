const { Server } = require("socket.io");

let io;

module.exports.initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:8080',
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("join", ({ userId, role }) => {
      socket.join(`user:${userId}`);

      if (role === "admin") {
        socket.join("admins");
      }

      console.log(`${userId} joined`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
    });
  });

  return io;
}

module.exports.getIO = () => {
  return io;
}