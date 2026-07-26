import getBuffer from "../config/datauri";
import { AuthenticatedRequest } from "../middlewaves/isAuth";
import TryCatch from "../middlewaves/TryCatch";

import axios from "axios";
import { Rider } from "../model/Rider";

export const addRiderProfile = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        const user = req.user
        
        if(!user){
            return res.status(401).json({
                message:"dang nhap dum"
            })

        }

        if(user.role !== "rider"){
            return res.status(403).json({
                message:"phai la rider moi them duoc profile"
            })
        }

        const file = req.file

        console.log("file", file)

        if(!file){
            return res.status(400).json({
                message:"chua co hinh"
            })
        }

        const fileBuffer = getBuffer(file)

        if(!fileBuffer?.content){
            return res.status(500).json({
                message:"loi khong tao duoc anh"
            })
        }


        const {data:uploadResult} = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`,{
            buffer:fileBuffer.content
        })

        const {phoneNumber, cccdNumber, drivingLicenseNumber, latitude, longitude} = req.body

        if(!phoneNumber  || !cccdNumber || !drivingLicenseNumber || latitude ===undefined || longitude === undefined){
            return res.status(400).json({
                message:"cac thuoc tinh chu dien day du"
            })
        }

        const existingProfile = await Rider.findOne({
            userId:user._id,

        })

        if(existingProfile){
            return res.status(400).json({
                message:"rider nay da ton tai"
            })
        }

        const riderProfile = await Rider.create({
            userId:user._id,
            picture:uploadResult.url,
            phoneNumber,
            cccdNumber,
            drivingLicenseNumber,
            location:{
                type:"Point",
                coordinates:[longitude, latitude]
            },
            isAvailable:false,
            isVerified:false


        })

        return res.status(201).json({
            message:"rider tao thanh cong",

            riderProfile
        })
    }
)

export const fetchMyProfile = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        const user = req.user

        if(!user){
            return res.status(403).json({
                message:"dang nhap dum"
            })
        }

        const account = await Rider.findOne({userId:user._id})

        res.json(account)
    }
)

export const toggleRiderAvailability = TryCatch(


    async(req:AuthenticatedRequest, res)=>{
          const user = req.user
        
        if(!user){
            return res.status(401).json({
                message:"dang nhap dum"
            })

        }

        if(user.role !== "rider"){
            return res.status(403).json({
                message:"phai la rider moi them duoc profile"
            })
        }

        const {isAvailable, latitude, longitude} = req.body

        if(typeof isAvailable !== "boolean"){
            return res.status(400).json({
                message:"isAvailable co lon gi khong"
            })
        }

        if(latitude === undefined || longitude === undefined){
            return res.status(400).json({
                message:"location chua co"
            })
        }

        const rider = await Rider.findOne({
            userId:user._id

        })

        if(!rider){
            return res.status(404).json({
                message:"rider co dau ma cap nhat"
            })
        }
        if(isAvailable && !rider.isVerified){
            return res.status(403).json({
                message:"rider bi ban roi"
            })
        }

        rider.isAvailable = isAvailable

        rider.location = {
            type:"Point",
            coordinates:[longitude, latitude],

        }

        rider.lastActive = new Date()

        res.json({
            message: isAvailable?"rider con song" :"rider offline roi",
            rider
        })
    }
)