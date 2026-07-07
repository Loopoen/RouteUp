import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewaves/isAuth.js";
import TryCatch from "../middlewaves/TryCatch.js";
import Cart from "../models/Cart.js";

export const addToCart = TryCatch(
    async(req: AuthenticatedRequest, res)=>{
        if(!req.user){
            return res.status(401).json({
                message:"dang nhap di"
            })
        }

        const userId=req.user._id

        const {restaurantId, itemId} = req.body

        console.log("mon an va item", restaurantId, itemId)

        if(!mongoose.Types.ObjectId.isValid(restaurantId) || !mongoose.Types.ObjectId.isValid(itemId)){
            return res.status(400).json({

                message:"chua co cua hang va mon an"
            })
        }

        const cartDifferenentRestaurant = await Cart.findOne({
            userId,
            restaurantId:{$ne:restaurantId},
        })

        if(cartDifferenentRestaurant){
            return res.status(400).json({
                message:"ban chi co the order tu 1 cua hang tai 1 thoi diem"
            })
        }

        const cartItem =await Cart.findOneAndUpdate(
            {
                userId, restaurantId, itemId,
    
            },
            {
                $inc:{quantity:1},
                $setOnInsert:{userId, restaurantId, itemId},
               
            },
            {
                upsert:true, new:true,setDefaultsOnInsert:true
            }

        )

        return res.json({
            message:'da them vao cart',
            cart:cartItem
        })
    }
)



export const fetchMyCart = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        if(!req.user){
            return res.status(401).json({
                message:"login dum"
            })
        }

        const userId  = req.user._id

        const cartItems  = await Cart.find({userId}).populate("itemId").populate("restaurantId")

        let subTotal = 0;
        let cartLength = 0;
        
        for (const cartItem of cartItems){
            const item:any = cartItem.itemId

            subTotal += item.price * cartItem.quantity
            cartLength += cartItem.quantity
        }

        return res.json({
            success:true,
            cartLength,
            subTotal,
            cart:cartItems
        })
    }

)

export const incremmentCartItem = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        const userId = req.user?._id

        const {itemId} = req.body

        if(!userId || !itemId){
            return res.status(400).json({
                message:"hehe thieu roi nhe"
            })
        }

        const cartItem = await Cart.findOneAndUpdate(
            {userId,itemId},
            {$inc:{quantity:1}},
            {new:true}
        )

        if(!cartItem){
            return res.status(404).json({
                message:"khong tim thay item"
            })
        }

        res.json({
            message:"ton them 1 mớ tiền nhá",
            cartItem
        })
    }
)


export const deletedCartItem = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        const userId = req.user?._id

        const {itemId} = req.body

        if(!userId || !itemId){
            return res.status(400).json({
                message:"hehe thieu roi nhe"
            })
        }

        const cartItem = await Cart.findOne(
            {userId,itemId},
            
        )

        if(!cartItem){
            return res.status(404).json({
                message:"khong tim thay item"
            })
        }

        if(cartItem.quantity === 1){
            await Cart.deleteOne({userId, itemId})

            return res.json({
                message:"đã giải quyết 1 mối họa tài chính"
            })
        }

        cartItem.quantity  -=1
        await cartItem.save()



        res.json({
            message:"đã giải quyết 1 mối họa tài chính",
            cartItem
        })
    }
)

export const clearCart = TryCatch(
    async(req:AuthenticatedRequest, res)=>{
        const userId = req.user?._id

        if(!userId){
            return res.status(401).json({
                message:"thieu thong tin"
            })
        }

        await Cart.deleteMany({userId})

        res.json({
            "message":"quyết tâm mạnh tay quá đại zương"
        })
    }
)