import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document{
    userId:string,
    restaurantId:string,
    restaurantName:string,
    riderId?:string | null,
    riderPhone: number |null,
    riderName:string | null,

    distance:number,
    riderAmount:number,

    items:{
        itemId:string,
        name:string,
        price:number,
        quantity:number,

    }[],

    subTotal:number,
    deliveryFee:number,
    platFromFee:number,
    totalAmount:number,
    addressId:string,

    deliveryAddress:{
        formattedAddress:string,
        mobile:number,
        latitude:number,
        longitude:number
    }

    status : "placed" | "accepted" | "preparing" | "ready_for_rider" | "rider_assigned" | "pick_up" | "delivered" | "cancelled",
    
    
    paymentMethod: "razorpay" | "stripe",

    paymentStatus: "pending" | "paid" | "failed",

    expriresAt:Date,
    
    createdAt:Date,
    updatedAt:Date


}


const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type:String,
      ref: "User",
      required: true,
      index: true,
    },

    restaurantId: {
      type:String,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    restaurantName: {
      type:String,
      required: true,
      trim: true,
    },

    riderId: {
      type:String,
      ref: "User",
      default: null,
    },

    riderPhone: {
      type: Number,
      default: null,
    },

    riderName: {
      type: String,
      default: null,
      trim: true,
    },

    distance: {
      type: Number,
      required: true,
      min: 0,
    },

    riderAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    items: [
        {
            itemId:String,
            name:String,
            price:Number,
            quantity:Number
        }
    ],

    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    platFromFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    addressId: {
      type: String,
      ref: "Address",
      required: true,
    },

    deliveryAddress: {
      formattedAddress:{type:String, required:true},
      mobile:{type:Number,required:true},
      latitude:Number,
      longitude:Number
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready_for_rider",
        "rider_assigned",
        "picked_up",
        "delivered",
      
      ],
      default: "placed",
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      required: true,
    },

  

    expriresAt: {
      type: Date,
       index:{expireAfterSeconds:0}
    },

    
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>("Order", orderSchema)