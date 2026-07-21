"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const socket_1 = require("../socket");
const router = express_1.default.Router();
router.post("/emit", (req, res) => {
    console.log("HEADER:", req.headers["x-internal-key"]);
    console.log("ENV:", process.env.INTERNAL_SERVICE);
    console.log("BODY:", req.body);
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE) {
        return res.status(403).json({
            message: "khong giao tiep duoc bay oi"
        });
    }
    const { event, room, payload } = req.body;
    if (!event || !room) {
        return res.status(400).json({
            message: "chua co event va room"
        });
    }
    const io = (0, socket_1.getIO)();
    console.log(`emmiting ${event} to room ${room}`);
    io.to(room).emit(event, payload ?? {});
    return res.json({ success: true });
});
exports.default = router;
