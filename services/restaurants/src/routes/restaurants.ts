import express from "express"
import { isAuth, isSeller } from "../middlewaves/isAuth.js"
import { addRestaurant, fetchRestaurant, fetchSingleRestaurant, getNearByRestaurant, updateRestaurant, updateStatusRestaurant } from "../controller/restaurants.js"
import uploadFile from "../middlewaves/multer.js"

const router =  express.Router()

router.post("/new", isAuth, isSeller, uploadFile ,addRestaurant)
router.post("/my", isAuth,isSeller,fetchRestaurant)
router.put("/status", isAuth, isSeller, updateStatusRestaurant)
router.put("/edit", isAuth, isSeller, updateRestaurant)
router.get("/all", isAuth, getNearByRestaurant  )
router.get("/:id", isAuth, fetchSingleRestaurant)

export default router 