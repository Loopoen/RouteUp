import { Request, Response, NextFunction } from "express";
import jwt, {JwtPayload} from 'jsonwebtoken';



export interface IUser {
    _id:string,
    name:string,
    email:string,
    image:string,
    role:string
}


export interface AuthenticatedRequest extends Request{
    user?:IUser | null
}

export const isAuth = async(req:AuthenticatedRequest, res:Response, next:NextFunction):Promise<void>=>{


   
    try{
        const authHeader = req.headers.authorization
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"dang nhap nhap loi khong co header"

            })

            return;
        }
        const token  = authHeader.split(" ")[1]
        if(!token){
            res.status(401).json({
                message:"dang nhap loi chua co token"
            })
            return;
        }

        const decodeValue = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

        if(!decodeValue || !decodeValue.user){
            res.status(401).json({
                message: "loi stoken"
            })

            return
        }

        req.user= decodeValue.user

        next()
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:"loi dang nhap voi jwt"
        })
    }
}

