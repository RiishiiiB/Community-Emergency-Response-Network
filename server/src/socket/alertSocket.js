import { User } from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export function registerAlertSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("name role");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role
      };

      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
    socket.join("alerts:all");

    socket.emit("socket:ready", {
      user: socket.user,
      connectedAt: new Date().toISOString()
    });

    socket.on("alert:subscribe", (alertId) => {
      if (alertId) {
        socket.join(`alert:${alertId}`);
      }
    });
  });
}
