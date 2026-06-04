
import dotenv from 'dotenv'
import express from 'express'

import { connect } from 'mongoose'
import connectDB from './config/db'
import authRoute from "./routes/auth.js"


dotenv.config()

const app = express()
app.use(express.json())

app.use("/api/auth", authRoute)

const PORT = process.env.PORT  || 5000



app.listen(PORT, ()=>{
    console.log(`Auth Server is runing ${PORT}`)
    connectDB()
})