"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.fetchMyOrder = exports.acceptRider = exports.toggleRiderAvailability = exports.fetchMyProfile = exports.addRiderProfile = void 0;
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
    console.log("file", file);
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
    const { phoneNumber, cccdNumber, drivingLicenseNumber, latitude, longitude } = req.body;
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
exports.acceptRider = (0, TryCatch_1.default)(async (req, res) => {
    const riderUserId = req.user?._id;
    const { orderId } = req.params;
    if (!riderUserId) {
        return res.status(400).json({
            message: "dang nhap dum"
        });
    }
    const rider = await Rider_1.Rider.findOne({ userId: riderUserId, isAvailable: true });
    if (!rider) {
        return res.status(409).json({
            "message": "rider khong tim duoc"
        });
    }
    try {
        const { data } = await axios_1.default.post(`${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`, {
            orderId,
            riderId: rider._id.toString(),
            riderUserId: rider.userId,
            riderName: rider.picture,
            riderPhone: rider.phoneNumber
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        if (data.success) {
            const riderDetail = await Rider_1.Rider.findOneAndUpdate({ userId: riderUserId,
                isAvailable: true
            }, { isAvailable: false }, { new: true });
            res.json({ message: "Order duoc chap nhan tu rider" });
        }
    }
    catch (err) {
        res.status(400).json({
            message: "Order da duoc chap nhan lau roi"
        });
    }
});
exports.fetchMyOrder = (0, TryCatch_1.default)(async (req, res) => {
    const riderUserId = req.user?._id;
    if (!riderUserId) {
        return res.status(401).json({ message: "dang nhap dum" });
    }
    const rider = await Rider_1.Rider.findOne({ userId: riderUserId });
    if (!rider) {
        return res.status(409).json({
            "message": "rider khong tim duoc"
        });
    }
    try {
        const { data } = await axios_1.default.get(`${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId={rider._id}`, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        res.json({
            order: data
        });
    }
    catch (err) {
        res.status(500).json({
            message: "sever khong phan hoi"
        });
    }
});
exports.updateOrderStatus = (0, TryCatch_1.default)(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    const rider = await Rider_1.Rider.findOne({ userId: userId });
    if (!rider) {
        return res.status(404).json({
            message: "khong tim thay rider"
        });
    }
    const { orderId } = req.params;
    try {
        const { data } = await axios_1.default.put(`${process.env.REALTIME_SERVICE}/api/order/update/rider`, { orderId }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        res.json({
            message: data.message
        });
    }
    catch (err) {
        res.status(500).json({
            message: "loi server"
        });
    }
});
