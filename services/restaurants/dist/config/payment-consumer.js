import axios from "axios";
import Order from "../models/Order.js";
import { getChannel } from "./rabbitmq.js";
export const startPaymentConsumer = async () => {
    const channel = getChannel();
    channel.consume(process.env.PAYMENT_QUEUE, async (msg) => {
        if (!msg)
            return;
        try {
            const event = JSON.parse(msg.content.toString());
            if (event.type !== "PAYMENT_SUCCESS") {
                channel.ack(msg);
                return;
            }
            const { orderId } = event.data;
            const order = await Order.findOneAndUpdate({
                _id: orderId,
                paymentStatus: { $ne: "paid" },
            }, {
                $set: {
                    paymentStatus: "paid",
                    status: "placed"
                },
                $unset: {
                    expriresAt: 1
                }
            }, { new: true });
            if (!order) {
                channel.ack(msg);
                return;
            }
            console.log("order placed", order._id);
            console.log("Emit new order:", `restaurant:${order.restaurantId}`);
            await axios.post(`${process.env.REALTIME_SERVICE}/api/v1/internal/emit`, {
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
            console.log("Emit success");
            channel.ack(msg);
        }
        catch (err) {
            console.log("loi thanh toan tai consumer", err);
        }
    });
};
