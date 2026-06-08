"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myProfile = exports.addUserRole = exports.loginUser = void 0;
const User_1 = __importDefault(require("../model/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const trycatch_1 = __importDefault(require("../middlewaves/trycatch"));
exports.loginUser = (0, trycatch_1.default)(async (req, res) => {
    const { email, name, picture } = req.body;
    let user = await User_1.default.findOne({ email });
    if (!user) {
        user = await User_1.default.create({
            name,
            email,
            image: picture
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    });
    res.status(200).json({
        message: "Login thanh cong",
        token,
        user,
    });
});
const allowedRoles = ["customer", "rider", "seller"];
exports.addUserRole = (0, trycatch_1.default)(async (req, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: 'khong co user'
        });
    }
    const { role } = req.body;
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "loi role"
        });
    }
    const user = await User_1.default.findByIdAndUpdate(req.user._id, { role }, { new: true });
    if (!user) {
        return res.status(404).json({
            message: "User khong ton tai"
        });
    }
    const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    });
    res.json({ user, token });
});
exports.myProfile = (0, trycatch_1.default)(async (req, res) => {
    const user = req.user;
    res.json(user);
});
