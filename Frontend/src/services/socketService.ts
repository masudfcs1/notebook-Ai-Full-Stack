import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:5015";

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected to backend notification server:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.warn("[Socket.io] Connection error:", error.message);
    });
  }

  return socket;
};

export const joinAdminRoom = () => {
  const s = getSocket();
  if (s.connected) {
    s.emit("join-admin");
  } else {
    s.once("connect", () => {
      s.emit("join-admin");
    });
  }
};

export const joinUserRoom = (userId: number | string) => {
  const s = getSocket();
  if (s.connected) {
    s.emit("join-user", userId);
  } else {
    s.once("connect", () => {
      s.emit("join-user", userId);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
