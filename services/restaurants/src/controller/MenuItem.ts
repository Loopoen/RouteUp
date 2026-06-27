import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewaves/isAuth.js";
import TryCatch from "../middlewaves/TryCatch.js";
import Retaurants from "../models/Retaurants.js";
import MenuItem from "../models/MenuItem.js";

export const addItem = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        if(!req.user){
            return res.status(401).json({
                message:"loi login"
            })
        }

        const restaurant = await Retaurants.findOne({ownerId:req.user._id})

        if(!restaurant){
            return res.status(404).json({
                message:"khong tim thay tong mon"
            })
        }

        const {name, description, price} = req.body

        if(!name || !price){
            return res.status(400).json({
                message:"chua co name va price"
            })
        }

        const file = req.file

        if(!file){
            return res.status(400).json({
                message:"anh chua co"
            })
        }

        const fileBuffer = getBuffer(file)

        if(!fileBuffer?.content){
            return res.status(500).json({
                message:"khong tao duoc duong dan"
            })
        }

        const {data :uploadResut} = await axios.post(`${process.env.UTILS_SERVICE}/api/upload`,{
            buffer:fileBuffer.content,

        })

        const item = await MenuItem.create({
            name,
            description,
            price,
            restaurantId:restaurant._id,
            image:uploadResut.url
        })

        res.json({
            message:'tao mon an thanh cong',
            item
        })
    }
)

export const getAllItem= TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        const {id} = req.params

        if(!id){
            return res.status(400).json({
                message:"khong co id"
            })
        }

        const item = await MenuItem.find({restaurantId:id})

        res.json(item)
    }   

    

    
)

export const deleteItem = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        if(!req.user){
            return res.status(401).json({
                message:"loi login"
            })
        }

        const {itemId} = req.params

        if(!itemId){
            return res.status(400).json({
                message:"id chua co "
            })
        }

        const item = await MenuItem.findById(itemId)

        if(!item){
            return res.status(404).json({
                message:"san pham khong ton tai"
            })
        }

        const restaurant = await Retaurants.findOne({
            _id:item.restaurantId,
            ownerId:req.user._id
        })

        if(!restaurant){
            return res.status(404).json({
                message:"khong tim duoc cua hang tuong ung"
            })
        }

        await item.deleteOne()

        res.json({
            message:"xoa san pham thanh cong"
        })
    }
)

export const toggleItem = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
         if(!req.user){
            return res.status(401).json({
                message:"loi login"
            })
        }

        const {itemId} = req.params

        if(!itemId){
            return res.status(400).json({
                message:"id chua co "
            })
        }

        const item = await MenuItem.findById(itemId)

        if(!item){
            return res.status(404).json({
                message:"san pham khong ton tai"
            })
        }

        const restaurant = await Retaurants.findOne({
            _id:item.restaurantId,
            ownerId:req.user._id
        })

        if(!restaurant){
            return res.status(404).json({
                message:"khong tim duoc cua hang tuong ung"
            })
        }

        item.isAvailable = !item.isAvailable

        await item.save()

        res.json({
            message:'chuyen doi trang thai thanh cong'
        })
    }
)