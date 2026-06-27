import express from "express"
import { isAuth, isSeller } from "../middlewaves/isAuth.js"
import { addRestaurant } from "../controller/restaurants.js"
import { addItem, deleteItem, getAllItem, toggleItem } from "../controller/MenuItem.js"
import uploadFile from "../middlewaves/multer.js"

const router = express.Router()

router.post('/new', isAuth, isSeller,uploadFile, addItem)
router.get('/add/:id', isAuth, isSeller, getAllItem)
router.delete("/:id", isAuth, isSeller, deleteItem)
router.delete("/status/:id", isAuth, isSeller, toggleItem)
export default router