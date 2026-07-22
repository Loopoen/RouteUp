import { Server } from "socket.io";

import http from "http"
import jwt from 'jsonwebtoken'

let io:Server

export const initSocket= (server:http.Server)=>{
    io = new Server(server, {
        cors:{
            origin:"*"
        }
    })

    io.use((socket, next)=>{
        try{
            const token = socket.handshake.auth?.token

            if(!token){
                return next(new Error("chua co auth"))

               
            }

             const decode = jwt.verify(token, process.env.JWT_SECRET!) as any

                if(!decode || !decode.user){
                    return next(new Error("chua co auth khi giai ma"))
                }

                // console.log("decode",decode);

                socket.data.user = decode.user

console.log(decode.user);

                next()
        }
        catch(err){
            console.log(err)
            next(new Error("loi tai lien ket socket"))
        }
    })

    io.on("connection", (socket)=>{
        const user = socket.data.user

        if(!user){
            socket.disconnect()
            return
        }

        const userId = user._id

        socket.join(`user:${userId}`)
        console.log(socket.data.user);

        if(user.restaurantId){
            socket.join(`restaurant:${user.restaurantId}`)
        }

        console.log(`User connected :${userId}`)

        console.log("SocketRoom: " , [...socket.rooms])

        socket.on("disconnect", ()=>{
            console.log(`User disconnected: ${userId}`)
        })

    })

    return io
}

export const getIO = ()=>{
    if(!io){
        throw new Error("socket.io chua tao")

        
    }


    return io
}