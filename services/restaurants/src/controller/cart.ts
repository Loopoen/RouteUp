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