import axios from "axios";
import getBuffer from "../config/datauri.js";
import TryCatch from "../middlewaves/TryCatch.js";
import Retaurants from "../models/Retaurants.js";
import jwt from 'jsonwebtoken';
export const addRestaurant = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "khong phai la do de mon trong thien ha nay"
        });
    }
    const exitingRestaurant = await Retaurants.findOne({
        ownerId: user._id,
    });
    if (exitingRestaurant) {
        return res.status(400).json({
            messaage: "ban thu su co 1 tong mon o day"
        });
    }
    const { name, description, latitude, longtitude, formattedAddress, phone } = req.body;
    if (!name || !latitude || !longtitude) {
        return res.status(400).json({
            message: "gui toi thong tin day du"
        });
    }
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            message: "gui toi hinh anh tong mon"
        });
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer.content) {
        return res.status(500).json({
            message: "loi khong tao duoc anh"
        });
    }
    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    });
    const restaurant = await Retaurants.create({
        name,
        description,
        phone,
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longtitude), Number(latitude)],
            formattedAddress
        },
        isVerified: false
    });
    return res.status(201).json({
        message: "tao thanh cong mon phai",
        restaurant
    });
});
export const fetchRestaurant = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "dang nhap dum cai"
        });
    }
    const restaurant = await Retaurants.findOne({ ownerId: req.user._id });
    if (!restaurant) {
        return res.status(400).json({
            message: "khong co user"
        });
    }
    if (!req.user.restaurantId) {
        const token = jwt.sign({
            users: {
                ...req.user,
                restaurantId: restaurant._id,
            }
        }, process.env.JWT_SECRETS, {
            expiresIn: "15d"
        });
        return res.json({
            restaurant, token
        });
    }
    res.json({ restaurant });
});
