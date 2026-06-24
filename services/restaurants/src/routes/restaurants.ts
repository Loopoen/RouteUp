import express from "express"
import { isAuth, isSeller } from "../middlewaves/isAuth.js"
import { addRestaurant, fetchRestaurant } from "../controller/restaurants.js"
import uploadFile from "../middlewaves/multer.js"

const router =  express.Router()

router.post("/new", isAuth, isSeller, uploadFile ,addRestaurant)
router.post("/my", isAuth,isSeller,fetchRestaurant)

export default router 