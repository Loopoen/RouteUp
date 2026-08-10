import  express from 'express'
import { acceptRider, addRiderProfile, fetchMyOrder, fetchMyProfile, toggleRiderAvailability, updateOrderStatus } from '../controller/rider.js'
import { isAuth } from '../middlewaves/isAuth.js'
import uploadFile from '../middlewaves/multer.js'


const router = express.Router()

router.get("/myProfile",isAuth ,fetchMyProfile)
router.patch("/toggle", isAuth, toggleRiderAvailability)
router.post("/add", isAuth,   uploadFile  ,addRiderProfile)
router.get("/order/current", isAuth, fetchMyOrder)
router.put("/order/update/:orderId", isAuth, updateOrderStatus )
router.post("/accept/:orderId", isAuth, acceptRider )






export default router