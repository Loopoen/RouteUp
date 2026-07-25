"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleRiderAvailability = exports.fetchMyProfile = exports.addRiderProfile = void 0;
const datauri_1 = __importDefault(require("../config/datauri"));
const TryCatch_1 = __importDefault(require("../middlewaves/TryCatch"));
const axios_1 = __importDefault(require("axios"));
const Rider_1 = require("../model/Rider");
exports.addRiderProfile = (0, TryCatch_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    if (user.role !== "rider") {
        return res.status(403).json({
            message: "phai la rider moi them duoc profile"
        });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "chua co hinh"
        });
    }
    const fileBuffer = (0, datauri_1.default)(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "loi khong tao duoc anh"
        });
    }
    const { data: uploadResult } = await axios_1.default.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    });
    const [phoneNumber, cccdNumber, drivingLicenseNumber, latitude, longitude] = req.body;
    if (!phoneNumber || !cccdNumber || !drivingLicenseNumber || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "cac thuoc tinh chu dien day du"
        });
    }
    const existingProfile = await Rider_1.Rider.findOne({
        userId: user._id,
    });
    if (existingProfile) {
        return res.status(400).json({
            message: "rider nay da ton tai"
        });
    }
    const riderProfile = await Rider_1.Rider.create({
        userId: user._id,
        picture: uploadResult.url,
        phoneNumber,
        cccdNumber,
        drivingLicenseNumber,
        location: {
            type: "Point",
            coordinates: [longitude, latitude]
        },
        isAvailable: false,
        isVerified: false
    });
    return res.status(201).json({
        message: "rider tao thanh cong",
        riderProfile
    });
});
exports.fetchMyProfile = (0, TryCatch_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(403).json({
            message: "dang nhap dum"
        });
    }
    const account = await Rider_1.Rider.findOne({ userId: user._id });
    res.json(account);
});
exports.toggleRiderAvailability = (0, TryCatch_1.default)(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    if (user.role !== "rider") {
        return res.status(403).json({
            message: "phai la rider moi them duoc profile"
        });
    }
    const { isAvailable, latitude, longitude } = req.body;
    if (typeof isAvailable !== "boolean") {
        return res.status(400).json({
            message: "isAvailable co lon gi khong"
        });
    }
    if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "location chua co"
        });
    }
    const rider = await Rider_1.Rider.findOne({
        userId: user._id
    });
    if (!rider) {
        return res.status(404).json({
            message: "rider co dau ma cap nhat"
        });
    }
    if (isAvailable && !rider.isVerified) {
        return res.status(403).json({
            message: "rider bi ban roi"
        });
    }
    rider.isAvailable = isAvailable;
    rider.location = {
        type: "Point",
        coordinates: [longitude, latitude],
    };
    rider.lastActive = new Date();
    res.json({
        message: isAvailable ? "rider con song" : "rider offline roi",
        rider
    });
});
