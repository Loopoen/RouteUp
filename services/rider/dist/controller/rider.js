import getBuffer from "../config/datauri.js";
import TryCatch from "../middlewaves/TryCatch.js";
import axios from "axios";
import { Rider } from "../model/Rider.js";
export const addRiderProfile = TryCatch(async (req, res) => {
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
    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content) {
        return res.status(500).json({
            message: "loi khong tao duoc anh"
        });
    }
    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    });
    const { phoneNumber, cccdNumber, drivingLicenseNumber, latitude, longitude } = req.body;
    if (!phoneNumber || !cccdNumber || !drivingLicenseNumber || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "cac thuoc tinh chu dien day du"
        });
    }
    const existingProfile = await Rider.findOne({
        userId: user._id,
    });
    if (existingProfile) {
        return res.status(400).json({
            message: "rider nay da ton tai"
        });
    }
    const riderProfile = await Rider.create({
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
export const fetchMyProfile = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(403).json({
            message: "dang nhap dum"
        });
    }
    const account = await Rider.findOne({ userId: user._id });
    res.json(account);
});
export const toggleRiderAvailability = TryCatch(async (req, res) => {
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
    const rider = await Rider.findOne({
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
    await rider.save();
    res.json({
        message: isAvailable ? "rider con song" : "rider offline roi",
        rider
    });
});
export const acceptRider = TryCatch(async (req, res) => {
    const riderUserId = req.user?._id;
    const { orderId } = req.params;
    if (!riderUserId) {
        return res.status(400).json({
            message: "dang nhap dum"
        });
    }
    const rider = await Rider.findOne({ userId: riderUserId, isAvailable: true });
    if (!rider) {
        return res.status(409).json({
            "message": "rider khong tim duoc"
        });
    }
    try {
        const { data } = await axios.put(`${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`, {
            orderId,
            riderId: rider._id.toString(),
            riderUserId: rider.userId,
            riderPhone: rider.phoneNumber
        }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        if (data.success) {
            const riderDetail = await Rider.findOneAndUpdate({ userId: riderUserId,
                isAvailable: true
            }, { isAvailable: false }, { new: true });
            res.json({ message: "Order duoc chap nhan tu rider" });
        }
    }
    catch (err) {
        if (axios.isAxiosError(err)) {
            console.log("========== ACCEPT RIDER ERROR ==========");
            console.log("URL:", err.config?.url);
            console.log("METHOD:", err.config?.method);
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
        }
        else {
            console.log(err);
        }
        return res.status(500).json({
            message: "Loi khi nhan order"
        });
    }
});
export const fetchMyOrder = TryCatch(async (req, res) => {
    const riderUserId = req.user?._id;
    if (!riderUserId) {
        return res.status(401).json({ message: "dang nhap dum" });
    }
    const rider = await Rider.findOne({ userId: riderUserId });
    if (!rider) {
        return res.status(409).json({
            "message": "rider khong tim duoc"
        });
    }
    try {
        const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/current/rider?riderId=${rider._id.toString()}`, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        res.json({
            order: data
        });
    }
    catch (err) {
        if (axios.isAxiosError(err)) {
            console.log("========== AXIOS ERROR ==========");
            console.log("URL:", err.config?.url);
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
            console.log("MESSAGE:", err.message);
        }
        else {
            console.log("========== UNKNOWN ERROR ==========");
            console.log(err);
        }
        return res.status(500).json({
            message: "server khong phan hoi"
        });
    }
});
export const updateOrderStatus = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    const rider = await Rider.findOne({ userId: userId });
    if (!rider) {
        return res.status(404).json({
            message: "khong tim thay rider"
        });
    }
    const { orderId } = req.params;
    try {
        const { data } = await axios.put(`${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`, { orderId }, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        res.json({
            message: data.message
        });
    }
    catch (err) {
        if (axios.isAxiosError(err)) {
            console.log("========== ACCEPT RIDER ERROR ==========");
            console.log("URL:", err.config?.url);
            console.log("METHOD:", err.config?.method);
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
        }
    }
});
