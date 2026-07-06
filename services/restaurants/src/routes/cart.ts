import express from "express"
import { isAuth } from "../middlewaves/isAuth.js"
import { addToCart, fetchMyCart } from "../controller/cart.js"


const router = express.Router()

router.post("/add", isAuth, addToCart)

router.get("/all", isAuth, fetchMyCart)

export default router
