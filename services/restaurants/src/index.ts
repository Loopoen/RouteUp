import express from 'express'

import dotenv from "dotenv"
import connectDB from './config/db.js'
import cors from "cors"
import restaurantRoute from "./routes/restaurants.js"
import itemRoute from "./routes/menuitem.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

app.use("/api/restaurant", restaurantRoute)
app.use("/api/item", itemRoute)

app.listen(PORT, ()=>{
    console.log(`Restaurants services is running ${PORT} `)
    connectDB()
})