import axios from "axios";
import TryCatch from "../middlewaves/TryCatch.js";
import Address from "../models/Address.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Retaurants from "../models/Retaurants.js";
export const createOrder = TryCatch(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    const { paymentMethod, addressId, distance } = req.body;
    if (!addressId) {
        return res.status(400).json({
            message: "chua co dia chi"
        });
    }
    const address = await Address.findOne({
        _id: addressId,
        userId: user._id
    });
    if (!address) {
        return res.status(404).json({
            message: "khong tim thay dia chi"
        });
    }
    const cartItem = await Cart.find({ userId: user._id }).populate("itemId").populate("restaurantId");
    if (cartItem.length === 0) {
        return res.status(400).json({
            message: "chua co san pham de order"
        });
    }
    const fristCartItem = cartItem[0];
    if (!fristCartItem || !fristCartItem.restaurantId) {
        return res.status(400).json({
            message: "san pham rong"
        });
    }
    const restaurantId = fristCartItem.restaurantId._id;
    const restaurant = await Retaurants.findById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({
            message: "khong co cua hang"
        });
    }
    if (!restaurant.isOpen) {
        return res.status(404).json({
            message: "cua hang chua mo"
        });
    }
    let subTotal = 0;
    const orderItem = cartItem.map((cart) => {
        const item = cart.itemId;
        if (!item) {
            throw new Error("khong co san pham");
        }
        const itemTotal = item.price * cart.quantity;
        subTotal += itemTotal;
        return {
            itemId: item._id.toString(),
            name: item.name,
            price: item.price,
            quantity: cart.quantity
        };
    });
    const deliveryFee = subTotal < 250 ? 49 : 0;
    const platFromFee = 7;
    const totalAmount = subTotal + deliveryFee + platFromFee;
    const expriresAt = new Date(Date.now() + 15 * 60 * 1000);
    const riderAmount = Math.ceil(distance) * 17;
    const [longitude, latitude] = address.location.coordinates;
    const order = await Order.create({
        userId: user._id.toString(),
        restaurantId: restaurantId.toString(),
        restaurantName: restaurant.name,
        riderId: null,
        distance,
        riderAmount,
        items: orderItem,
        subTotal,
        deliveryFee, platFromFee, totalAmount,
        addressId: address._id.toString(),
        deliveryAddress: {
            formattedAddress: address.formattedAddress,
            mobile: address.mobile,
            latitude,
            longitude,
        },
        paymentMethod,
        paymentStatus: "pending",
        status: "placed",
        expriresAt
    });
    await Cart.deleteMany({ userId: user._id });
    res.json({
        message: "order thanh cong",
        orderId: order._id.toString(),
        amount: totalAmount
    });
});
export const fetchOrderForPayment = TryCatch(async (req, res) => {
    if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE) {
        return res.status(403).json({
            message: "duong truyen bi ngat"
        });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "order khong tim duoc"
        });
    }
    if (order.paymentStatus !== "pending") {
        return res.status(400).json({
            message: "order san sang de giao dich"
        });
    }
    order.paymentStatus = "paid";
    order.save();
    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "VND"
    });
});
export const fetchRestaurantOrder = TryCatch(async (req, res) => {
    const user = req.user;
    const { restaurantId } = req.params;
    if (!user) {
        return res.status(401).json({
            message: "dang nhap dum"
        });
    }
    if (!restaurantId) {
        return res.status(400).json({
            message: "chua co id restaurant"
        });
    }
    const limit = req.query.limit ? Number(req.query.limit) : 0;
    const orders = await Order.find({
        restaurantId,
        paymentStatus: "paid",
    }).sort({ createdAt: -1 })
        .limit(limit);
    return res.json({
        success: true,
        count: orders.length,
        orders
    });
});
const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"];
export const updatedOrderStatus = TryCatch(async (req, res) => {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;
    console.log("Restaurant INTERNAL_SERVICE:", process.env.INTERNAL_SERVICE);
    console.log("Calling realtime:", process.env.REALTIME_SERVICE);
    if (!user) {
        return res.status(401).json({
            message: "dang nhap di"
        });
    }
    if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
            message: "chua co status"
        });
    }
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({
            message: "khong tim thay order"
        });
    }
    if (order.paymentStatus !== "paid") {
        return res.status(404).json({
            message: "order chua hoan thanh"
        });
    }
    const restaurant = await Retaurants.findById(order.restaurantId);
    if (!restaurant) {
        return res.status(404).json({
            message: "restaurant khong tim thay"
        });
    }
    if (restaurant.ownerId !== user._id.toString()) {
        return res.status(401).json({
            message: "ban chua cho phep quyen sua order nay"
        });
    }
    order.status = status;
    await order.save();
    await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
        event: "order:update",
        room: `user:${order.userId}`,
        payload: {
            orderId: order._id,
            status: order.status,
        }
    }, {
        headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE
        }
    });
    // rideer
    res.json({
        message: "order update status thanh cong ",
        order
    });
});
export const getMyOrders = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "dang nhap di"
        });
    }
    console.log("user._id", req.user._id);
    const order = await Order.find({
        userId: req.user._id.toString(),
        // paymentStatus:"paid",
    }).sort({ createdAt: -1 });
    res.json({ order });
});
export const fetchSingleOrder = TryCatch(async (req, res) => {
    if (!req.user) {
        return res.status(401).json({
            message: "dang nhap di"
        });
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
        return res.status(404).json({
            message: "khong tim thay order"
        });
    }
    if (order.userId !== req.user._id.toString()) {
        return res.status(401).json({
            message: "ban khong co quyen xem order nay"
        });
    }
    res.json(order);
});
