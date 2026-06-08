import express from 'express'
import { addUserRole, loginUser, myProfile } from '../controller/auth';
import { isAuth } from '../middlewaves/isAuth'

const router = express.Router()

router.post("/login", loginUser)
router.put("/add/role", 
    isAuth, 
    addUserRole
);

router.get("/me", isAuth, myProfile)

export default router