import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import cors from 'cors'
import riderRoute from './route/rider'


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/rider", riderRoute)

app.listen(process.env.PORT, ()=>{
    console.log(`rider run ${process.env.PORT}`)
    connectDB()
})