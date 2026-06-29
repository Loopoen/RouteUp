import mongoose, { Document , Schema} from "mongoose";


export interface IRestaurant extends Document{
    name:string,
    description?:string,
    image:string,
    ownerId:string,
    phone:number,
    isVerified:boolean

    autoLocation:{
        type:"Point",
        coordinateds:[number, number],
         formattedAddress:string,
    
    },
       

    isOpen:boolean,
    createAt:Date

}

const schema = new Schema <IRestaurant>(  {
    name:{
        type:String,
        required:true,
        trim:true
    },

    description:String,

    image:{
        type:String,
        required:true
    },

    autoLocation:{
        type:{
            type:String,
            emun:["Point"],
            required:true
        },
        coordinates:{
            type:[Number, Number],
            required:true
        },
        formatedAddress:{
            type:String,
        },
        
        
    },
    ownerId:{
        type:String
    }
    ,

    isVerified: {
    type: Boolean,     
    default: false     
},
  

    isOpen:{
        type:Boolean,
        default:false,
    }
}, {
    timestamps:true
})

schema.index({autoLocation: "2dsphere"})

export default mongoose.model<IRestaurant>("Restaurant", schema)