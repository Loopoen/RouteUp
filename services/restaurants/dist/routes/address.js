import express from "express";
import { isAuth } from "../middlewaves/isAuth.js";
import { addAddress, deletedAddress, getMyAddress } from "../controller/Address.js";
const router = express.Router();
router.post("/new", isAuth, addAddress);
router.delete('/:id', isAuth, deletedAddress);
router.get("/all", isAuth, getMyAddress);
export default router;
