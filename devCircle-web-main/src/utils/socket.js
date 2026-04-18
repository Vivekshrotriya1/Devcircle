// import io from "socket.io-client";
// import { BASE_URL } from "./constants";

// export const createSocketConnection = () => {
//   if (location.hostname === "localhost") {
//     return io(BASE_URL);
//   } else {
//     return io("/", { path: "/api/socket.io" });
//   }
// };
import { io } from "socket.io-client";
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
  const socket = io(
    location.hostname === "localhost"
      ? BASE_URL
      : "https://devcircle.onrender.com",
    {
      withCredentials: true,
      transports: ["websocket", "polling"], // 🔥 important
    }
  );

  return socket;
};