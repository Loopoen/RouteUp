import axios from "axios";
import type { IMenuItem, IRestaurant } from "../type";
import { restaurantService } from "../main";
import { useEffect, useState } from "react";
import AddRestaurant from "../components/AddRestaurant";
import { Toaster } from "react-hot-toast";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItem from "../components/MenuItem";
import AddItem from "../components/AddItem";
import { FaRightFromBracket } from "react-icons/fa6";


type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
 
  const [restaurants, setRestaurants] = useState<IRestaurant | null>(null);

  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<SellerTab>("menu");
    const [menuItem, setMenuItem] = useState<IMenuItem[]>([])

   const handleLogout = () => {
  const confirmLogout = window.confirm(
    "Bạn có chắc chắn muốn đăng xuất?"
  );

  if (!confirmLogout) return;

  
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  
  window.location.href = "/";
};

  useEffect(()=>{
    if(restaurants?._id){
      fetchMenuItems(restaurants._id)
    }
  }, [restaurants])



  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/restaurant/my`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurants(data.restaurant || null);
      console.log("hehehe",data)
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
        <div className="text-2xl font-bold text-orange-500 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!restaurants) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }


  const fetchMenuItems = async(restaurantId:string)=>{
    try{
      const {data} = await axios.get(`${restaurantService}/api/item/all/${restaurants._id}`,{
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      console.log("data", data)

      setMenuItem(data)
    }


    catch(err){
      console.log(err)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <Toaster />

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Seller Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Welcome back! Manage your restaurant here.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h2 className="font-bold text-lg">{restaurants.name}</h2>

              <p className="text-sm text-gray-500">
                {restaurants.isOpen ? "🟢 Open" : "🔴 Closed"}
              </p>
            </div>

            <img
              src={restaurants.image || "/restaurant.jpg"}
              className="w-16 h-16 rounded-full object-cover border-4 border-orange-200 shadow-lg"
            />
          </div>
          <button
    onClick={handleLogout}
    className="
      flex
      items-center
      gap-2
      bg-red-500
      hover:bg-red-600
      text-white
      px-5
      py-3
      rounded-xl
      shadow-lg
      transition
      hover:scale-105
    "
  >
    <FaRightFromBracket />
    Logout
  </button>
        </div>

  
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-3xl shadow-lg p-3 flex gap-4 mb-8">
          <button
            onClick={() => setTab("menu")}
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              tab === "menu"
                ? "bg-orange-500 text-white shadow-lg"
                : "hover:bg-orange-100"
            }`}
          >
            🍽 Restaurant
          </button>

          <button
            onClick={() => setTab("add-item")}
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              tab === "add-item"
                ? "bg-orange-500 text-white shadow-lg"
                : "hover:bg-orange-100"
            }`}
          >
            ➕ Add Item
          </button>

          <button
            onClick={() => setTab("sales")}
            className={`flex-1 py-3 rounded-2xl font-semibold transition ${
              tab === "sales"
                ? "bg-orange-500 text-white shadow-lg"
                : "hover:bg-orange-100"
            }`}
          >
            📈 Sales
          </button>
        </div>

        {/* Content */}
        <div className="rounded-3xl overflow-hidden shadow-xl bg-white">
          {tab === "menu" && (
           <>
             <RestaurantProfile
              restaurant={restaurants}
              isSeller={true}
              onUpdate={setRestaurants}
            />

            <MenuItem items={menuItem} onItemDeleted={()=>fetchMenuItems(restaurants._id)} isSeller={true}/>
           
           </>
          )}

          {tab === "add-item" && (
            <AddItem  onItemAdd={() =>fetchMenuItems(restaurants._id)}/>
          )}

          {tab === "sales" && (
            <div className="p-10">
              <h2 className="text-3xl font-bold mb-8">
                Sales Statistics
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-orange-50 rounded-3xl p-8 shadow">
                  <h3 className="text-gray-500">
                    Revenue
                  </h3>

                  <p className="text-4xl font-bold mt-3">
                    $12,540
                  </p>
                </div>

                <div className="bg-green-50 rounded-3xl p-8 shadow">
                  <h3 className="text-gray-500">
                    Orders
                  </h3>

                  <p className="text-4xl font-bold mt-3">
                    324
                  </p>
                </div>

                <div className="bg-blue-50 rounded-3xl p-8 shadow">
                  <h3 className="text-gray-500">
                    Rating
                  </h3>

                  <p className="text-4xl font-bold mt-3">
                    ⭐ 4.8
                  </p>
                </div>
              </div>

              <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-300 h-80 flex items-center justify-center text-gray-400 text-xl">
                Revenue Chart
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;