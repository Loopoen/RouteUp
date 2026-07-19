import express from 'express'

import { getIO } from '../socket'
const router = express.Router()

router.post("/emit", (req, res)=>{
    if(req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY){
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

    return res.json({sucess:true})
})

export default router