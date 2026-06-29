import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewaves/isAuth.js";
import TryCatch from "../middlewaves/TryCatch.js";
import Retaurants from "../models/Retaurants.js";
import jwt from 'jsonwebtoken';
import { Request } from 'express';


export const addRestaurant = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user
    if (!user) {
        return res.status(401).json({
            message: "khong phai la do de mon trong thien ha nay"
        })
    }

    const exitingRestaurant = await Retaurants.findOne({
        
        ownerId: user._id,

    })

    console.log("hehe", user._id)
    if (exitingRestaurant) {
        return res.status(400).json({
            messaage: "ban thu su co 1 tong mon o day"
        })
    }

    const { name, description, latitude, longtitude, formatedAddress, phone } = req.body

    console.log("formatedAdress", formatedAddress)

    if (!name || !latitude || !longtitude) {
        return res.status(400).json({
            message: "gui toi thong tin day du"
        })
    }

    const file = req.file
    if (!file) {
        return res.status(400).json({
            message: "gui toi hinh anh tong mon"
        })
    }

    const fileBuffer = getBuffer(file)

    if (!fileBuffer.content) {
        return res.status(500).json({
            message: "loi khong tao duoc anh"
        })
    }

    const { data: uploadResult } = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`, {
        buffer: fileBuffer.content
    })

    const restaurant = await Retaurants.create({
        name,
        description,
        phone,
        image: uploadResult.url,
        ownerId: user._id,
        autoLocation: {
            type: "Point",
            coordinates: [Number(longtitude), Number(latitude)],
            formatedAddress
        },
        isVerified:false
    })

    return res.status(201).json({
        message: "tao thanh cong mon phai",
        restaurant
    })
})

export const fetchRestaurant = TryCatch(
    async (req: AuthenticatedRequest, res) => {
        if (!req.user) {
            return res.status(401).json({
                message: "dang nhap dum cai"
            })
        }
        const restaurant = await Retaurants.findOne({ ownerId: req.user._id })
        if (!restaurant) {
            return res.status(400).json({
                message: "khong co cua hang"
            })
        }
        if (!req.user.restaurantId) {
            const token = jwt.sign(
                {
                    users: {
                        ...req.user,
                        restaurantId: restaurant._id,
                    }
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: "15d"
                }
            );

            return res.json({
                restaurant, token
            })
        }

        res.json({restaurant})
        
    }




)

export const updateStatusRestaurant = TryCatch(
    async (req:AuthenticatedRequest , res)=>{
        if(!req.user){
            return res.status(403).json({
                messsage:"loi login"
            })
        }

        const {status} = req.body

        if(typeof status !== "boolean"){
            return res.status(400).json({
                mesage:"status phai la boolean"
            })
        }

        const restaurant = await Retaurants.findOneAndUpdate({
            ownerId:req.user._id,

        },{
            isOpen:status
        },{
            new:true
        })


        if(!restaurant){
            return res.status(404).json(
                {
                    message:"mon phai do chua ton tai"
                }
            )
        }

        res.json({
    message: "Đổi trạng thái thành công",
    restaurant
});
    }


)

export const updateRestaurant  = TryCatch(
    async(req:AuthenticatedRequest, res)=>
    {
        if(!req.user){
            return res.status(403).json({
                message:"loi login"
            })
        }

        const {name, description} = req.body

        const restaurant = await Retaurants.findOneAndUpdate(
            {ownerId:req.user._id},
            {name:name, description:description},
            {new:true}
        )

         if (!restaurant) {
        return res.status(404).json({
            message: "Không tìm thấy cửa hàng"
        });
    }

    return res.json({
        message: "Cập nhật thành công",
        restaurant
    });
    }
)

export const getNearByRestaurant = TryCatch(
    async(req, res)=>{
        const {latitude,longitude, radius= 50000000000, search =""} =req.query
        console.log("la", latitude)
        console.log("lo", longitude)

        if(!latitude || !longitude){
            return res.status(400).json({
                message:"vi tuyen va kinh tuyen ch co"
            })


        }

        const query:any = {
            isVerified:true
        }

        if(search && typeof search ==="string"){
            query.name = {$regex:search, $options:"i"}
        }

        const restaurant = await Retaurants.aggregate([
            {
                $geoNear:{
                    near:{
                        type:"Point",
                        coordinates:[Number(longitude), Number(latitude)]
                    },

                    distanceField:"distance",
                    maxDistance:Number(radius),
                    spherical:true,
                    query

                }
            },
            {
                $sort:{
                    isOpen:-1,
                    distance:1
                }
            },
            {
                $addFields:{
                    distanceKm:{
                        $round:[{$divide:["$distance", 1000]}, 2]
                    }
                }
            }
        ])

        res.json({
            suscess:true,
            count:restaurant.length,
            restaurant
        })
    }
)

export const fetchSingleRestaurant = TryCatch(
    async(req, res)=>{
        const restaurant = await Retaurants.findById(req.params.id)

        res.json(restaurant)
    }
)