import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cloudinary from "cloudinary";
import cors from "cors";
import upLoadRouter from "./routes/cloudinary.js";
import { connectRabbitMQ } from './config/rabbitmp.js';
import paymentRouter from "./routes/payment.js";
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SERCERT_KEY } = process.env;
if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SERCERT_KEY) {
    throw new Error("Khong tim duoc cai bien cloudinary");
}
cloudinary.v2.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_SERCERT_KEY
});
await connectRabbitMQ();
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});
app.use("/api", upLoadRouter);
app.use("/api/payment", paymentRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Utils services is runing ${PORT}`);
});
