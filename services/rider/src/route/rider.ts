import  express from 'express'
import { addRiderProfile, fetchMyProfile, toggleRiderAvailability } from '../controller/rider'
import { isAuth } from '../middlewaves/isAuth'
import uploadFile from '../middlewaves/multer'

const router = express.Router()

router.get("/myProfile",isAuth ,fetchMyProfile)
router.patch("/toggle", isAuth, toggleRiderAvailability)
router.post("/add", isAuth,   uploadFile  ,addRiderProfile)


export default router