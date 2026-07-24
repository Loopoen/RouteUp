import { io, type Socket } from "socket.io-client";
import { Children, createContext, useEffect, useRef, type ReactNode, useContext } from 'react';
import { useAppData } from "./AppContext";
import { realtimeService } from "../main";

interface SocketContextType{
    socket:Socket | null
}

const SocketContext = createContext<SocketContextType>({socket:null})

export const SocketProvider = ({children}:{children: ReactNode})=>{
    const {isAuth} = useAppData()

    const socketRef = useRef<Socket | null> (null) // toi luyện

    useEffect(()=>{
        if(!isAuth){
            socketRef.current?.disconnect()
            socketRef.current = null
            return
        }

        if(socketRef.current) return

        const socket = io(realtimeService, {
            auth:{
                token: localStorage.getItem("token")
            },
            transports:["websocket"]
        })

        socketRef.current = socket

        console.log("sc",socket)

        socket.on("connect", ()=>{
            console.log("sockent connected", socket.id)
        })
            socket.on("disconnect", ()=>{    
            console.log("sockent disconnected", socket.id)
        })

        socket.on("connect_error", (err)=>{
            console.log("socket error", err.message)
        })

        return ()=>{
            socket.disconnect()
            socketRef.current = null
        }
    }, [isAuth])

    return <SocketContext.Provider  value={{socket:socketRef.current}}>
        {children}
    </SocketContext.Provider>
}

export const useSocket = ()=>useContext(SocketContext)