import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors'
import riderRoute from './route/rider.js'

import { connectRabbitMQ } from './config/rabbitmq.js';
import { startOrderReadyConsumer } from './config/order-ready-consumer.js';


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

await connectRabbitMQ()
await startOrderReadyConsumer()


app.use("/api/rider", riderRoute)



app.listen(process.env.PORT, ()=>{
    console.log(`rider run ${process.env.PORT}`)
    connectDB()
})