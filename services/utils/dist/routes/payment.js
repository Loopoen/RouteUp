import express from "express";
import { verifyStripe, payWithStripe } from "../controller/payment.js";
const router = express.Router();
router.post("/stripe/create", payWithStripe);
router.post("/stripe/verify", verifyStripe);
export default router;
