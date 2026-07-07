import axios from "axios";
import type { IMenuItem } from "../type";
import {
  FaTrash,
  FaHeart,
  FaStar,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaMagnifyingGlass,
  FaCartShopping,
} from "react-icons/fa6";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAppData } from "../context/AppContext";

interface MenuItemProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItem = ({ items, onItemDeleted, isSeller }: MenuItemProps) => {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      (item.description || "").toLowerCase().includes(keyword)
    );
  });

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Bạn có chắc muốn xoá món này không?");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Xoá thành công");
      onItemDeleted();
    } catch (error) {
      toast.error("Xoá không thành công");
      console.log(error);
    }
  };

  const toggleStatus = async (itemId: string) => {
    const confirm = window.confirm("Bạn có chắc muốn đổi trạng thái món này không?");
    if (!confirm) return;

    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      toast.error("Cập nhật không thành công");
      console.log(error);
    }
  };

  const { fetchCart } = useAppData();

  const addCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId, itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      fetchCart();
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Thêm vào giỏ thất bại");
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div
      className="mt-10 bg-[#FBF4E8] rounded-3xl p-8"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <span
            className="text-xs tracking-[0.3em] uppercase text-[#E8A93A]"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Menu quán
          </span>
          <h2
            className="text-4xl mt-1 uppercase"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            Thực đơn
          </h2>
          <p className="text-[#8C8479] mt-2">Món ăn tươi mới mỗi ngày</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E8DCC4] bg-white px-5 py-3 pl-11 text-[#221F1B] shadow-sm focus:outline-none focus:ring-4 focus:ring-[#E8A93A]/30 focus:border-[#E8A93A]"
            />
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8479]" />
          </div>

          <div
            className="bg-[#221F1B] text-[#FBF4E8] px-5 py-3 rounded-xl font-bold shadow rotate-[-2deg] shrink-0"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            {filteredItems.length} MÓN
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-16 text-center">
          <div className="text-7xl mb-4">{search ? "🔍" : "🍜"}</div>
          <h3
            className="text-2xl uppercase"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            {search ? "Không tìm thấy món nào" : "Chưa có món nào"}
          </h3>
          <p className="text-[#8C8479] mt-2">
            {search
              ? `Không có món nào khớp với "${search}".`
              : "Thêm món ăn đầu tiên của bạn."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="group relative bg-white rounded-2xl border border-[#EFE7D4] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-2xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Favorite */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(item._id)}
                  aria-pressed={!!favorites[item._id]}
                  aria-label="Yêu thích món này"
                  className={`absolute top-4 left-4 w-10 h-10 rounded-full backdrop-blur shadow-lg flex items-center justify-center transition ${
                    favorites[item._id]
                      ? "bg-[#C1121F] text-white"
                      : "bg-white/90 text-[#221F1B] hover:bg-[#C1121F] hover:text-white"
                  }`}
                >
                  <FaHeart />
                </button>

                {/* Status stamp */}
                <span
                  className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold shadow border-2 ${
                    item.isAvailable
                      ? "bg-[#3F6B4A] text-white border-[#8FBF9C]"
                      : "bg-[#C1121F] text-white border-[#E8938C]"
                  }`}
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {item.isAvailable ? "CÒN HÀNG" : "HẾT HÀNG"}
                </span>
              </div>

              {/* Price tag */}
              <div
                className="absolute right-5 top-[12.5rem] bg-[#E8A93A] text-[#221F1B] px-4 py-2 rounded-lg font-bold shadow-lg rotate-[-3deg] border-2 border-[#221F1B] z-10"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ${item.price}
              </div>

              {/* Body */}
              <div className="p-6 pt-8">
                <h3 className="text-xl font-bold text-[#221F1B] pr-16">
                  {item.name}
                </h3>
                <p className="text-[#8C8479] mt-2 line-clamp-2 text-sm">
                  {item.description || "Chưa có mô tả"}
                </p>

                {/* Rating row */}
                <div
                  className="flex items-center gap-5 mt-5 text-sm text-[#5A554C]"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  <div className="flex items-center gap-1 text-[#E8A93A] font-semibold">
                    <FaStar />
                    4.8
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    20 phút
                  </div>
                </div>

                {/* Availability */}
                <div className="mt-5">
                  {item.isAvailable ? (
                    <span className="inline-flex items-center gap-2 bg-[#EAF2EC] text-[#3F6B4A] px-4 py-2 rounded-full font-semibold text-sm">
                      <FaCircleCheck />
                      Sẵn sàng đặt món
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-[#FBEAEA] text-[#C1121F] px-4 py-2 rounded-full font-semibold text-sm">
                      <FaCircleXmark />
                      Hiện không có sẵn
                    </span>
                  )}
                </div>

                {/* Buyer action: Add to cart */}
                {!isSeller && (
                  <button
                    type="button"
                    disabled={!item.isAvailable || loadingItemId === item._id}
                    onClick={() => addCart(item.restaurantId, item._id)}
                    className={`mt-6 w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 transition ${
                      !item.isAvailable
                        ? "bg-[#D8D1C4] text-[#8C8479] cursor-not-allowed"
                        : loadingItemId === item._id
                        ? "bg-[#221F1B]/70 text-white cursor-wait"
                        : "bg-[#221F1B] text-white hover:bg-[#3F6B4A] cursor-pointer"
                    }`}
                  >
                    {loadingItemId === item._id ? (
                      "Đang thêm..."
                    ) : (
                      <>
                        <FaCartShopping />
                        {item.isAvailable ? "Thêm vào giỏ" : "Hết hàng"}
                      </>
                    )}
                  </button>
                )}

                {/* Seller actions, separated by dashed "tear line" */}
                {isSeller && (
                  <>
                    <div className="mt-6 border-t-2 border-dashed border-[#E8DCC4]" />
                    <div className="flex gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => toggleStatus(item._id)}
                        aria-pressed={item.isAvailable}
                        aria-label="Đổi trạng thái còn hàng"
                        className={`relative w-16 h-9 rounded-full shrink-0 transition-all duration-300 ${
                          item.isAvailable ? "bg-[#3F6B4A]" : "bg-[#D8D1C4]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ${
                            item.isAvailable ? "left-8" : "left-1"
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 cursor-pointer py-3 rounded-xl bg-[#C1121F] text-white font-semibold flex justify-center items-center gap-2 hover:brightness-110 transition"
                      >
                        <FaTrash />
                        Xoá món
                      </button>
                    </div>
                  </>
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