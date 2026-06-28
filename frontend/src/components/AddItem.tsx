import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import MenuItem from "./MenuItem";
import type { IMenuItem, IRestaurant } from "../type";
import { FaImage, FaPlug, FaPlus, FaTimes, FaUtensils } from "react-icons/fa";

const AddItem = ({ onItemAdd }: { onItemAdd: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [preview, setPreview] = useState("");
    const [restaurants, setRestaurants] = useState<IRestaurant | null>(null);
  
   const [menuItem, setMenuItem] = useState<IMenuItem[]>([])



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
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      toast.error("dien day du");
      return;
    }

    if (Number(price) <= 0) {
      toast.error("gia lon hons 0");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);

      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("them mon thanh cong");

      resetForm();

      onItemAdd();
    } catch (err) {
      console.log(err);
      toast.error("loi");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-8">

    {/* Header */}

    <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">

      <div>
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
          <FaUtensils className="text-orange-500" />
          Menu Management
        </h1>

        <p className="text-slate-500 mt-2">
          Manage all dishes in your restaurant
        </p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500
        text-white px-6 py-3 rounded-2xl shadow-xl hover:scale-105 transition"
      >
        <FaPlus />
        Add Item
      </button>

    </div>

    {/* Modal */}

    {showForm && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 relative animate-[fadeIn_.25s]">

          <button
            onClick={() => setShowForm(false)}
            className="absolute right-6 top-6 text-2xl text-gray-500 hover:text-red-500"
          >
            <FaTimes />
          </button>

          <h2 className="text-3xl font-bold mb-8">
            Add New Menu Item
          </h2>

          <div className="space-y-6">

            {/* Upload */}

            <label className="border-2 border-dashed border-orange-300 rounded-3xl h-60 flex flex-col justify-center items-center cursor-pointer hover:border-orange-500 transition">

              {preview ? (
                <img
                  src={preview}
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <>
                  <FaImage className="text-6xl text-orange-500 mb-4" />
                  <p className="text-slate-500">
                    Click to upload image
                  </p>
                </>
              )}

              <input
                hidden
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    setImage(e.target.files[0]);
                    setPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-500 outline-none px-5 py-4 transition"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={4}
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-500 outline-none px-5 py-4 resize-none transition"
            />

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-orange-500 outline-none px-5 py-4 transition"
            />

            <div className="flex justify-end gap-4">

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={async () => {
                  await handleSubmit();
                  setShowForm(false);

                  if (restaurants?._id) {
                    fetchMenuItems(restaurants._id);
                  }
                }}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:scale-105 transition"
              >
                {loading ? "Adding..." : "Add Item"}
              </button>

            </div>

          </div>

        </div>

      </div>
    )}

    {/* Menu List */}

    <div className="max-w-7xl mx-auto">

      <div className="bg-white rounded-3xl shadow-xl p-6">

        <MenuItem
          items={menuItem}
          onItemDeleted={() => {
            if (restaurants?._id) {
              fetchMenuItems(restaurants._id);
            }
          }}
          isSeller={true}
        />

      </div>

    </div>

  </div>
);
  
};

export default AddItem;