import axios from "axios"
import { useNavigate } from "react-router-dom"
import { authServices } from "../main"
import { useState } from "react"
import toast from "react-hot-toast"
import { useGoogleLogin } from "@react-oauth/google"
import { FcGoogle } from "react-icons/fc"
import { useAppData } from "../context/AppContext"


const Login = ()=>{

    const [loading, setLoading] = useState(false)
    const {setIsAuth, setUser} = useAppData()

    const navigate = useNavigate()

    const responseGoogle = async(authResult:any)=>{
        setLoading(true)
        console.log("a", authServices)

        try{
            const result = await axios.post(`${authServices}/api/auth/login`, {
                code:authResult["code"]
            })

            localStorage.setItem("token", result.data.token)
            toast.success(result.data.message)
            setLoading(false)
            console.log("running", result.data)
            setUser(result.data)
            setIsAuth(true)
            navigate("/")


        }

        catch(err){
            console.log(err)
            toast.error("co van de trong luc login")

            setLoading(false)
        }
    }

    const googleLogin  = useGoogleLogin({
        onSuccess:responseGoogle,
        onError:responseGoogle,
        flow:"auth-code"
    })
    return <div className="flex min-h-screen items-center justify-center px-4 bg-white">

        <div className="w-full  max-w-sm space-y-6">
            <h1 className="text-center text-3xl font-bold text-[#E23774]"> 
                    RouteUp
            </h1>

            <p className="text-center text-sm text-gray-500">Log in or sign up to continue</p>

            <button onClick={googleLogin} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border border-gtay-300 bg-white px-4 py-3  ">

                <FcGoogle size={30}/> 

                {loading ? "Dang dang nhap vui long cho doi ..." : "Tiep tuc voi google"}



            </button>

            <p className="text-center text-xs">
                Tiep tuc, ban dong y voi  {" "}
                <span className="text-[#E23774]">hop dong </span>
                 <span className="text-[#E23774]">chinh sach</span>
            </p>
        </div>
    </div>
}

export default Login