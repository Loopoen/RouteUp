"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPaymentConsumer = void 0;
const axios_1 = __importDefault(require("axios"));
const Order_js_1 = __importDefault(require("../models/Order.js"));
const rabbitmq_js_1 = require("./rabbitmq.js");
const startPaymentConsumer = async () => {
    console.log("consumner");
    const channel = (0, rabbitmq_js_1.getChannel)();
    channel.consume(process.env.PAYMENT_QUEUE, async (msg) => {
        console.log("consumer2");
        console.log(msg);
        if (!msg) {
            console.log("msg khong co");
            return;
        }
        try {
            const event = JSON.parse(msg.content.toString());
            console.log("event", event);
            if (event.type !== "PAYMENT_SUCCESS") {
                channel.ack(msg);
                console.log("cho nay a");
                return;
            }
            const { orderId } = event.data;
            const order = await Order_js_1.default.findOneAndUpdate({
                _id: orderId,
                // paymentStatus: { $ne: "paid" },
            }, {
                $set: {
                    paymentStatus: "paid",
                    status: "placed"
                },
                $unset: {
                    expireAt: 1
                }
            }, { new: true });
            console.log("order", order);
            if (!order) {
                console.log("hay chua co order");
                channel.ack(msg);
                return;
            }
            console.log("order placed", order._id);
            console.log("Emit new order:", `restaurant:${order.restaurantId}`);
            const response = await axios_1.default.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
                event: "order:new",
                room: `restaurant:${order.restaurantId.toString()}`,
                payload: {
                    orderId: order._id.toString(),
                    status: order.status
                }
            }, {
                headers: {
                    "x-internal-key": process.env.INTERNAL_SERVICE
                }
            });
            console.log("Realtime response:", response.data);
            console.log("Emit success");
            channel.ack(msg);
        }
        catch (err) {
            console.log("loi thanh toan tai consumer", err);
        }
    });
};
exports.startPaymentConsumer = startPaymentConsumer;
