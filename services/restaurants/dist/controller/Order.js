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
    const cartItem = await Cart.find({ userid: user._id }).populate("itemId").populate("restaurantId");
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
        ownerId: order._id.toString(),
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
    res.json({
        orderId: order._id,
        amount: order.totalAmount,
        currency: "VND"
    });
});
