import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAppData } from "../context/AppContext"

const ProtectedRoute = () => {
    const { isAuth, user, loading } = useAppData()
    const location = useLocation()

    console.log("ProtectedRoute", {
        isAuth,
        loading,
        user,
        pathname: location.pathname
    })

    if (loading) return null

    if (!isAuth) {
        return <Navigate to="/login" replace />
    }

  
    if (!user?.role && location.pathname !== "/select-role") {
        return <Navigate to="/select-role" replace />
    }

  
    if (user?.role && location.pathname === "/select-role") {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute