"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "dang nhap nhap loi khong co header"
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({
                message: "dang nhap loi chua co token"
            });
            return;
        }
        const decodeValue = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decodeValue || !decodeValue.user) {
            res.status(401).json({
                message: "loi stoken"
            });
            return;
        }
        req.user = decodeValue.user;
        next();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "loi dang nhap voi jwt"
        });
    }
};
exports.isAuth = isAuth;
