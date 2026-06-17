import { Navigate, Outlet } from "react-router-dom"
import { useAppData } from "../context/AppContext"

const PublicRoute = ()=>{
    const {isAuth, loading} = useAppData()

    if(loading ) return null

    return isAuth ? <Navigate to={"/"}/> : <Outlet/>

}

export default PublicRoute