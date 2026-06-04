import { Request, Response } from "express"
import User from "../model/User"
import jwt from "jsonwebtoken"
import TryCatch from "../middlewaves/trycatch"
export const loginUser = TryCatch(async(req, res)=>{
     const {email, name, picture} = req.body

        let user = await User.findOne({email})

        if(!user){
            user = await User.create({
                name,
                email,
                image:picture
            })
        }

        const token = jwt.sign({user}, process.env.JWT_SECRET as string , {
            expiresIn:"15d"
        })

        res.status(200).json({
            message:"Login thanh cong",
            token,
            user,
        })

})


