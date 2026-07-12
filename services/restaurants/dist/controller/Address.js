import TryCatch from "../middlewaves/TryCatch.js";
import Address from "../models/Address.js";
export const addAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "dang nhap di"
        });
    }
    const { mobile, formattedAddress, latitude, longitude } = req.body;
    if (!mobile || !formattedAddress || latitude === undefined || longitude === undefined) {
        return res.status(400).json({
            message: "dien day du thong tin"
        });
    }
    const newAddress = await Address.create({
        userId: user._id.toString(),
        mobile,
        formattedAddress,
        location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)]
        }
    });
    res.json({
        message: "them dia chi thanh cong",
        address: newAddress
    });
});
export const deletedAddress = TryCatch(async (req, res) => {
    const user = req.user;
    console.log("user", user);
    if (!user) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({
            message: "chua co id"
        });
    }
    const address = await Address.findOne({
        _id: id,
        userId: user._id.toString()
    });
    if (!address) {
        return res.status(404).json({
            message: "khong tim thay address"
        });
    }
    await address.deleteOne();
    res.json({
        message: "xoa thanh cong address"
    });
});
export const getMyAddress = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            messsage: "dang nhap dum"
        });
    }
    const address = await Address.find({
        userId: user._id.toString()
    }).sort({ createdAt: -1 });
    res.json(address);
});
