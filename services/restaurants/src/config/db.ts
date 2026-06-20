import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL as string, {dbName:"RouteUP_Clone"})
        console.log("connect to mongodb")
    }
    catch(error){
        console.log(error)
    }
}

export default connectDB