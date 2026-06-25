import { Children, createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authServices } from "../main";
import axios from "axios";
import type { AppContextType, LocationData } from "../type";

const AppContext = createContext(undefined)

interface AppProviderProps{
    children:ReactNode
}

export const AppProvider = ({children}: AppProviderProps)=>{
    const [user, setUser] = useState(null)

    const [isAuth, setIsAuth] = useState(false)

    const [loading, setLoading] = useState(false)

    const [location, setLocation] = useState<LocationData | null>(null)
    const [loadingLocation, setLoadingLocation] = useState(false)

    const [city, setCity] = useState("Fetching location ...")

    async function fetchUser(){

        const token = localStorage.getItem("token")
        if(!token){
            setLoading(false)
            return
        }
        try{

            setLoading(true)
            const token = localStorage.getItem("token")
            const {data} = await axios.get(`${authServices}/api/auth/me`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
              
            })

            console.log("token =", token);
console.log("authServices =", authServices);

              setUser(data)
              setIsAuth(true)


        }
        catch(error){
            console.log(error)
        }

        finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchUser()
    }, [])

    useEffect(()=>{
        if(!navigator.geolocation) return alert("Cho phep truy cap vao dia chi cua ban...")

        setLoadingLocation(true)

        navigator.geolocation.getCurrentPosition(async(position)=>{
            const { latitude, longitude } = position.coords

            try{
                const res= await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)

                const  data  = await res.json()

                console.log("hehe",data)

                setLocation({
                    latitude,
                    longitude,
                    formattedAddress:data.display_name || "dia chi hien tai"
            })

                setCity(data.address.city || data.address.town || data.address.village || "dia chi cua ban")
            }
            catch(err){
              setLocation({
                latitude,
                longitude,
                formattedAddress:"Dia chi hien tai"
              })

              setCity("khong tim duoc thanh pho")
            }
        })



    }, [])

    return <AppContext.Provider value={{isAuth, loading, setIsAuth, setLoading, setUser, user, location, loadingLocation, city }}>
        {children}
    </AppContext.Provider>

}

export const useAppData = ():AppContextType =>{
    const context = useContext(AppContext)
    if(!context){
        throw new Error("Approvider error")
    }
    return context
}