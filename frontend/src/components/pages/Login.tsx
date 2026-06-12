import axios from "axios"
import { useNavigate } from "react-router-dom"
import { authServices } from "../../main"
import { useState } from "react"
import toast from "react-hot-toast"
import { useGoogleLogin } from "@react-oauth/google"


const Login = ()=>{

    const [loading, setLoading] = useState(false)

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
    return <div className="flex min-h-screen items-center justify-center">

        <div className="w-full max-w-sm space-y-6">
            <h1 className="text-center text-3xl font-bold text-[#E23774]"> 
                    RouteUp
            </h1>

            <p className="text-center text-sm text-gray-500">Log in or sign up to continue</p>

            <button onClick={googleLogin} disabled={loading} className="flex w-ful items-center justify-center gap-3 rounded-xl border border-gtay-300 bg-white px-4 py-3  ">

             Login
            </button>
        </div>
    </div>
}

export default Login