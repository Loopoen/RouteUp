import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../type";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItem from "../components/MenuItem";


const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurants, setRestaurants] = useState<IRestaurant | null>(null);
  const [menuItem, setMenuItem] = useState<IMenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("restauratn in Page", data);
      setRestaurants(data || null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("MenuItem in page", data);
      setMenuItem(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRestaurant();
    fetchMenuItems();
  }, []);

  // Loading state — matches the receipt/ticket theme of RestaurantProfile
  if (loading || !restaurants || !menuItem) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#FBF4E8] text-[#221F1B]"
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-[#E8DCC4] border-t-[#C1121F] animate-spin" />
          <span
            className="text-xs tracking-[0.3em] uppercase text-[#8C8479]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Đang tải quán ăn...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RestaurantProfile
        isSeller={false}
        restaurant={restaurants}
        onUpdate={setRestaurants}
      />

   


      <MenuItem isSeller={false} items={menuItem} onItemDeleted={()=>{}}/>
    </div>
  );
};

export default RestaurantPage;