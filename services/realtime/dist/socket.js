"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*"
        }
    });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("chua co auth"));
            }
            const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decode || !decode.user) {
                return next(new Error("chua co auth khi giai ma"));
            }
            socket.data.user = decode.user;
            next();
        }
        catch (err) {
            console.log(err);
            next(new Error("loi tai lien ket socket"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
        if (!user) {
            socket.disconnect();
            return;
        }
        const userId = user._id;
        socket.join(`user:${userId}`);
        if (user.restaurantId) {
            socket.join(`restaurant:${user.restaurantId}`);
        }
        console.log(`User connected :${userId}`);
        console.log("SocketRoom: ", [...socket.rooms]);
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error("socket.io chua tao");
    }
    return io;
};
exports.getIO = getIO;
