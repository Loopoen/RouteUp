import dotenv from "dotenv";
dotenv.config();
console.log("STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY);
import axios from "axios";
import Stripe from "stripe";
import { publishPaymentSuccess } from "../config/payment.producer.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const payWithStripe = async (req, res) => {
    try {
        const { orderId } = req.body;
        const { data } = await axios.get(`${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`, {
            headers: {
                "x-internal-key": process.env.INTERNAL_SERVICE
            }
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "vnd",
                        product_data: {
                            name: "RouteUP food"
                        },
                        unit_amount: data.amount
                    },
                    quantity: 1
                }
            ],
            metadata: {
                orderId
            },
            success_url: `${process.env.FRONTEND_URL}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout`
        });
        console.log("session_url", session.url);
        res.json({
            url: session.url,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            message: "thanh toan bang stripe khong thanh cong"
        });
    }
};
export const verifyStripe = async (req, res) => {
    const { sessionId } = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session) {
            return res.status(400).json({
                message: "xac thuc stripe loi"
            });
        }
        const orderId = session.metadata?.orderId;
        if (!orderId) {
            return res.status(400).json({
                message: "khong tim duoc orderId trong stripe"
            });
        }
        await publishPaymentSuccess({
            orderId,
            paymentId: sessionId,
            provider: "stripe"
        });
        res.json({
            message: "xac thuc voi stripe thanh cong"
        });
    }
    catch (err) {
        console.log("Stripe error:");
        console.log(err);
        if (err.response) {
            console.error(err.response.data);
        }
        res.status(500).json({
            message: err.message || "Thanh toán Stripe không thành công",
        });
    }
};
