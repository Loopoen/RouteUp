import { useState } from "react";
import type { IRestaurant } from "../type";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface Props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({
  restaurant,
  isSeller,
  onUpdate,
}: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        {
          status: !isOpen,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsOpen(data.restaurant.isOpen);
      onUpdate(data.restaurant);

      toast.success(data.message);
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        {
          name,
          description,  
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onUpdate(data.restaurant);
      setEditMode(false);

      toast.success(data.message);
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
 return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-10">
    <div className="max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-[40px] overflow-hidden shadow-2xl">
        <img
          src={restaurant.image || "/restaurant.jpg"}
          className="w-full h-[380px] object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute bottom-10 left-10 flex items-end gap-8">
          <img
            src={restaurant.image || "/restaurant.jpg"}
            className="w-40 h-40 rounded-full border-[6px] border-white shadow-2xl object-cover"
          />

          <div>
            <h1 className="text-6xl font-extrabold text-white">
              {name}
            </h1>

            <p className="text-white/90 mt-3 text-lg flex items-center gap-2">
              📍 {restaurant.autoLocation.formattedAddress}
            </p>

            <p className="text-lg text-gray-200 mt-3 max-w-xl">
              {description}
            </p>

            <div className="flex gap-3 mt-5">
              <span className="bg-white/20 backdrop-blur-lg px-5 py-2 rounded-full text-white">
                ⭐ 4.8 Rating
              </span>

              <span className="bg-white/20 backdrop-blur-lg px-5 py-2 rounded-full text-white">
                📦 250+ Orders
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-8 right-8">
          <div
            className={`px-7 py-3 rounded-full font-bold shadow-xl backdrop-blur-lg ${
              isOpen
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {isOpen ? "🟢 OPEN" : "🔴 CLOSED"}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        {/* Left */}
        <div className="lg:col-span-2 bg-white rounded-[30px] p-10 shadow-xl">
          <h2 className="text-3xl font-bold mb-8">
            Restaurant Information
          </h2>

          <div className="space-y-8">
            {/* Name */}
            <div>
              <label className="text-gray-500 font-semibold">
                Restaurant Name
              </label>

              {editMode ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-3 w-full bg-gray-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-orange-300"
                />
              ) : (
                <div className="mt-3 text-2xl font-bold">
                  {name}
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="text-gray-500 font-semibold">
                Address
              </label>

              <div className="mt-3 flex items-center gap-2 text-lg text-gray-700 bg-gray-50 rounded-2xl p-4">
                📍 {restaurant.address}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-gray-500 font-semibold">
                Description
              </label>

              {editMode ? (
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-3 w-full bg-gray-100 rounded-2xl p-4 outline-none resize-none focus:ring-4 focus:ring-orange-300"
                />
              ) : (
                <p className="mt-3 text-gray-600 leading-8">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <div className="bg-white rounded-[30px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold">
              Restaurant Status
            </h2>

            <p className="text-gray-500 mt-2">
              Customers can order only while your restaurant is open.
            </p>

            <div className="mt-8 flex justify-between items-center">
              <span className="font-semibold">
                {isOpen ? "Currently Open" : "Currently Closed"}
              </span>

              <button
                onClick={toggleOpenStatus}
                className={`relative w-20 h-10 rounded-full transition ${
                  isOpen ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-8 h-8 bg-white rounded-full transition ${
                    isOpen ? "left-11" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[30px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">
              Actions
            </h2>

            <div className="space-y-4">
              {editMode && (
                <button
                  onClick={() => setEditMode(false)}
                  className="w-full py-4 rounded-2xl bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={
                  editMode
                    ? saveChanges
                    : () => setEditMode(true)
                }
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-xl hover:scale-105 transition"
              >
                {loading
                  ? "Saving..."
                  : editMode
                  ? "Save Changes"
                  : "Edit Restaurant"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

};

export default RestaurantProfile;