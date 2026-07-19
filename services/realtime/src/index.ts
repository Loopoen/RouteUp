import express from "express"

import dotenv from 'dotenv'
import cors from "cors"
import http from "http"
import { initSocket } from "./socket"
import internailRoute from "./routes/internal"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/v1/internal", internailRoute)

const server = http.createServer(app)


initSocket(server)
app.listen(process.env.PORT, ()=>{
    console.log(`realtim run ${process.env.PORT}`)
})