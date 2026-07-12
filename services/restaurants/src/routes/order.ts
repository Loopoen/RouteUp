import express from "express"
import { isAuth } from "../middlewaves/isAuth.js"
import { createOrder, fetchOrderForPayment } from "../controller/Order.js"

const router = express.Router()

router.post("/new",isAuth, createOrder)
router.get("/payment", fetchOrderForPayment)

export default router