import axios from "axios";
import type { IRestaurant } from "../type";
import { restaurantService } from "../main";
import { useEffect, useState } from "react";
import AddRestaurant from "../components/AddRestaurant";



const Restaurant = () => {
    const [restaurants, setRestaurants] = useState<IRestaurant | null> (null)

    const [loading , setLoading] = useState(true)

    console.log("lo",localStorage.getItem("token"))
    const fetchMyRestaurant = async()=>{
        try{
            const {data} = await axios.post(`${restaurantService}/api/restaurant/my`,{
                headers:{
                    Authorization:`Bearer ${localStorage.getItem("token")}`
                }
            })

            console.log("data", data)
            setRestaurants(data.restaurant || null)

        }
        catch(err){
            console.log(err)
        }

        finally{
            console.log("catch")
            setLoading(false)
        }
    }

    useEffect(()=>{
        fetchMyRestaurant()
    }, [])

    if(loading){
        return <h1>Dang loading ...</h1>
    }

    if(!restaurants){
        return <AddRestaurant/>
    }
  return (
    <div>
      <h2>Restaurant</h2>
    </div>
  );
};

export default Restaurant;