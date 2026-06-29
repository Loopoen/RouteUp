import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../type";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import Navbar from "../components/Navbar";
import { FaLocationDot } from "react-icons/fa6";

const Home = () => {
  const { location } = useAppData();

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [restaurant, setRestaurant] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return +(R * c).toFixed(2);
  };

  const fetchRestaurant = async () => {
    if (!location) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setRestaurant(data.restaurant ?? []);
    } catch (err) {
      toast.error("Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [location, search]);

  return (
    <div className="min-h-screen bg-gray-50">
    s
      {/* Banner */}
     
      {/* Restaurant */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Restaurants Near You
          </h2>

          <span className="rounded-full bg-orange-100 px-4 py-2 text-orange-600 font-semibold">
            {restaurant.length} Restaurants
          </span>
        </div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-3xl bg-gray-200"
              />
            ))}
          </div>
        ) : restaurant.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-3xl font-bold text-gray-600">
              No restaurants found 😢
            </h2>

            <p className="mt-3 text-gray-400">
              Try another keyword.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurant.map((res) => {
              const [lng, lat] = res.autoLocation.coordinates;

              const distance = location
                ? getDistanceKm(
                    location.latitude,
                    location.longitude,
                    lat,
                    lng
                  )
                : 0;

              return (
                <RestaurantCard
                  key={res._id}
                  id={res._id}
                  image={res.image ?? ""}
                  name={res.name}
                  distance={`${distance} km`}
                  isOpen={res.isOpen}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;