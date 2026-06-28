import axios from "axios";
import type { IMenuItem } from "../type";
import {
  FaPen,
  FaTrash,
  FaHeart,
  FaStar,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";
import { restaurantService } from "../main";
import toast from "react-hot-toast";


interface MenuItemProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItem = ({
  items,
  onItemDeleted,
  isSeller,
}: MenuItemProps) => {

  const handleDelete = async(itemId:string)=>{
    console.log("click delted")
    const confirm = window.confirm("chat cha k")

    console.log(window.confirm.toString())
    if(!confirm) {
      return;
    }

    try{
      await axios.delete(`${restaurantService}/api/item/${itemId}`,{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })

      toast.success("xoa thanh cong")

      onItemDeleted()
    }
    catch(error){
      toast.error("xoa khong thanh cong")
      console.log(error)
      
    }
  }

  const tongleStatus = async(itemId:string)=>{
    console.log("click delted")
    const confirm = window.confirm("chat chan k")

    console.log(window.confirm.toString())
    if(!confirm) {
      return;
    }

    try{
      const {data} = await axios.put(`${restaurantService}/api/item/status/${itemId}`,{},{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("token")}`
        }
      })

      toast.success(data.message)

      onItemDeleted()
    }
    catch(error){
      toast.error("xoa khong thanh cong")
      console.log(error)
      
    }
  }
  return (



    <div className="mt-10 bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-3xl p-8">

      {/* Header */}

      <div className="flex justify-between items-center mb-10">

        <div>
          <h2 className="text-4xl font-extrabold text-gray-800">
            🍽 Our Menu
          </h2>

          <p className="text-gray-500 mt-2">
            Freshly prepared delicious meals
          </p>
        </div>

        <div className="bg-orange-500 text-white px-5 py-2 rounded-full font-bold shadow">
          {items.length} Items
        </div>

      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-16 text-center">

          <div className="text-7xl mb-4">
            🍜
          </div>

          <h3 className="text-2xl font-bold text-gray-700">
            No Menu Available
          </h3>

          <p className="text-gray-500 mt-2">
            Add your first delicious dish.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {items.map((item) => (

            <div
              key={item._id}
              className="
                group
                bg-white
                rounded-[28px]
                overflow-hidden
                border
                border-gray-100
                shadow-lg
                hover:shadow-2xl
                hover:-translate-y-3
                transition-all
                duration-500
              "
            >

              {/* Image */}

              <div className="relative overflow-hidden">

                <img
                  src={item.image}
                  alt={item.name}
                  className="
                    w-full
                    h-64
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-110
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Favorite */}

                <button
                  className="
                    absolute
                    top-4
                    left-4
                    w-11
                    h-11
                    rounded-full
                    bg-white/90
                    backdrop-blur
                    shadow-lg
                    flex
                    items-center
                    justify-center
                    hover:bg-red-500
                    hover:text-white
                    transition
                  "
                >
                  <FaHeart />
                </button>

                {/* Status */}

                <span
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-xs font-bold shadow ${
                    item.isAvailable
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              {/* Body */}

              <div className="p-6">

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="text-2xl font-bold text-gray-800">
                      {item.name}
                    </h3>

                    <p className="text-gray-500 mt-2 line-clamp-2">
                      {item.description}
                    </p>

                  </div>

                  <div className="text-3xl font-bold text-orange-500">
                    ${item.price}
                  </div>

                </div>

                {/* Rating */}

                <div className="flex items-center gap-5 mt-6 text-sm">

                  <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                    <FaStar />
                    4.8
                  </div>

                  <div className="flex items-center gap-1 text-gray-500">
                    <FaClock />
                    20 mins
                  </div>

                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">
                    Best Seller
                  </span>

                </div>

                {/* Availability */}

                <div className="mt-6">

                  {item.isAvailable ? (

                    <span className="inline-flex items-center gap-2 bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold">

                      <FaCircleCheck />

                      Ready to Order

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold">

                      <FaCircleXmark />

                      Currently Unavailable

                    </span>

                  )}

                </div>

                {/* Buttons */}

                {isSeller && (

                  <div className="flex gap-4 mt-8">

                   <button
  onClick={() => tongleStatus(item._id)}
  className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
    item.isAvailable ? "bg-green-500" : "bg-gray-300"
  }`}
>
  <span
    className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ${
      item.isAvailable ? "left-8" : "left-1"
    }`}
  />
</button>

                    <button
                      onClick={()=>handleDelete(item._id)}
                      className="
                        flex-1
                        cursor-pointer
                        py-3
                        rounded-2xl
                        bg-gradient-to-r
                        from-red-500
                        to-pink-600
                        text-white
                        font-semibold
                        flex
                        justify-center
                        items-center
                        gap-2
                        hover:scale-105
                        transition
                      "
                    >
                      <FaTrash />
                      Delete
                    </button>

                  </div>

                )}

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default MenuItem;