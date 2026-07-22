import axios from "axios"
import Order from "../models/Order.js"
import { getChannel } from "./rabbitmq.js"

export const startPaymentConsumer = async () => {

    console.log("consumner")
    const channel = getChannel()

    channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {

        console.log("consumer2")
        console.log(msg)
        if (!msg) {
            console.log("msg khong co")
            return
        }

        try {
            const event = JSON.parse(msg.content.toString())

            console.log("event", event)

            if (event.type !== "PAYMENT_SUCCESS") {
                channel.ack(msg)
                console.log("cho nay a")
                return
            }

            const { orderId } = event.data
            const order = await Order.findOneAndUpdate(
                {
                    _id: orderId,
                    // paymentStatus: { $ne: "paid" },

                },
                {
                    $set: {
                        paymentStatus: "paid",
                        status: "placed"
                    },

                    $unset: {
                        expireAt: 1
                    }
                },

                { new: true }
            )

            console.log("order", order)
            if (!order) {

                console.log("hay chua co order")
                channel.ack(msg)

                return
            }

            console.log("order placed", order._id)


            console.log(
                "Emit new order:",
                `restaurant:${order.restaurantId}`
            )

            const response = await axios.post(
                `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
                {
                    event: "order:new",
                    room: `restaurant:${order.restaurantId.toString()}`,
                    payload: {
                        orderId: order._id.toString(),
                        status: order.status
                    }
                },
                {
                    headers: {
                        "x-internal-key": process.env.INTERNAL_SERVICE
                    }
                }
            )

            console.log("Realtime response:", response.data);

            console.log("Emit success")

            channel.ack(msg)


        }
        catch (err) {
            console.log("loi thanh toan tai consumer", err)
        }
    })
}