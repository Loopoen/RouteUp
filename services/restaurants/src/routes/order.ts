import express from "express"
import { isAuth, isSeller } from "../middlewaves/isAuth.js"
import { createOrder, fetchOrderForPayment, fetchRestaurantOrder, fetchSingleOrder, getMyOrders, updatedOrderStatus } from "../controller/Order.js"


const router = express.Router()

router.post("/new",isAuth, createOrder)
router.get("/payment/:id", fetchOrderForPayment)
router.get("/:restaurantId", isAuth, isSeller,fetchRestaurantOrder)
router.put("/:orderId", isAuth, isSeller, updatedOrderStatus)
router.get("/my", isAuth, getMyOrders)
router.get("/:id",isAuth, fetchSingleOrder)

export default router