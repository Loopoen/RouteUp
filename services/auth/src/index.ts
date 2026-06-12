

import dotenv from 'dotenv'
dotenv.config()
import express from 'express'

import { connect } from 'mongoose'
import connectDB from './config/db'
import authRoute from "./routes/auth"
import cors from "cors"



const app = express()
app.use(express.json())
app.use(cors());

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use("/api/auth", authRoute)

const PORT = process.env.PORT  || 5000



app.listen(PORT, ()=>{
    console.log(`Auth Server is runing ${PORT}`)
    connectDB()
})