import express from 'express'
import dotenv from "dotenv"
dotenv.config()

import { getIO } from '../socket'
const router = express.Router()

router.post("/emit", async(req, res)=>{

    console.log("HEADER:", req.headers["x-internal-key"])
    console.log("ENV:", process.env.INTERNAL_SERVICE)
    console.log("BODY:", req.body)
    if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE){
        return res.status(403).json({
            message:"khong giao tiep duoc bay oi"
        })
    }

    const {event, room , payload} = req.body

    if(!event || !room){
        return res.status(400).json({
            message:"chua co event va room"
        })
    }

    const io = getIO()

    console.log(`emmiting ${event} to room ${room}`)
    io.to(room).emit(event,payload ??{})

    return res.json({success:true})
})

export default router