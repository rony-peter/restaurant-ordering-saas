import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const initPortalSocket = (token?: string): Socket => {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token: token || (typeof window !== "undefined" ? localStorage.getItem("token") : ""),
    },
    autoConnect: true,
  });
};