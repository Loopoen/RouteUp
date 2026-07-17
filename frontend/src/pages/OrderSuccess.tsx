import axios from "axios";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";


const OrderSuccess = () => {
    const [params, setParams] =useSearchParams()

    const sessionId = params.get("session_id")

    useEffect(()=>{
        const verifyPayment = async()=>{
            try{
                await axios.post(`${utilsService}/api/payment/stripe/verify`,{
                    sessionId
                })

                toast.success("thanh toan thanh cong")
            }
            catch(err){
                toast.error("Strip loi")
                console.log(err)
            }
        }

        verifyPayment()
    },[sessionId])
  return (
    <div>
      <h2>OrderSuccess</h2>
    </div>
  );
};

export default (OrderSuccess);