import { Children, createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authServices } from "../main";
import axios from "axios";
import type { AppContextType } from "../type";

const AppContext = createContext(undefined)

interface AppProviderProps{
    children:ReactNode
}

export const AppProvider = ({children}: AppProviderProps)=>{
    const [user, setUser] = useState(null)

    const [isAuth, setIsAuth] = useState(false)

    const [loading, setLoading] = useState(false)

    const [location, setLocation] = useState(null)

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

    return <AppContext.Provider value={{isAuth, loading, setIsAuth, setLoading, setUser, user}}>
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