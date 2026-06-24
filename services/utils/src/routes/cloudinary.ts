
import cloudinary from 'cloudinary';
import express from 'express';

const router = express.Router()

router.post("/upload", async(req, res)=>{
    try{
        const {buffer} = req.body

        const cloud = await cloudinary.v2.uploader.upload(buffer)

        res.json({
            url:cloud.secure_url,
        })



    }

    catch(err:any){
        res.status(500).json({
            message:err.message
        })
    }
})

export default router