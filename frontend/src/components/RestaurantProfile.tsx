import { useEffect, useState } from "react";
import type { IRestaurant } from "../type";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface Props {
  restaurant: IRestaurant | null;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document.getElementById("rp-fonts")) return;
    const link = document.createElement("link");
    link.id = "rp-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Anton&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || "");
      setDescription(restaurant.description || "");
      setIsOpen(restaurant.isOpen || false);
    }
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-lg font-semibold bg-[#FBF4E8] text-[#221F1B]"
        style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
      >
        Đang tải nhà hàng...
      </div>
    );
  }

  const address =
    restaurant.autoLocation?.formatedAddress ||
    restaurant.autoLocation?.formattedAddress ||
    "Chưa có địa chỉ";

  const toggleOpenStatus = async () => {
    if (!isSeller) return;
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setIsOpen(data.restaurant.isOpen);
      onUpdate(data.restaurant);
      toast.success(data.message || "Cập nhật trạng thái thành công");
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const saveChanges = async () => {
    if (!isSeller) return;
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      onUpdate(data.restaurant);
      setName(data.restaurant.name || "");
      setDescription(data.restaurant.description || "");
      setIsOpen(data.restaurant.isOpen || false);
      setEditMode(false);
      toast.success(data.message || "Cập nhật nhà hàng thành công");
    } catch (err: any) {
      console.log(err);
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setName(restaurant.name || "");
    setDescription(restaurant.description || "");
    setIsOpen(restaurant.isOpen || false);
  };

  // Perforated "receipt edge" — the signature visual motif
  const TicketEdge = () => (
    <div
      className="h-4 w-full"
      style={{
        background:
          "radial-gradient(circle at 12px 0px, transparent 9px, #FBF4E8 9px) 0 -1px/24px 16px repeat-x",
      }}
    />
  );

  return (
    <div
      className="min-h-screen bg-[#FBF4E8] text-[#221F1B] pb-16"
      style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* HERO */}
      <div className="bg-[#221F1B] pt-12 pb-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-center lg:items-end">
          {/* image, tilted like a pinned photo */}
          <div className="relative shrink-0">
            <div
              className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-[#FBF4E8] shadow-[0_20px_50px_rgba(0,0,0,0.5)] rotate-[-3deg]"
            >
              <img
                src={restaurant.image || "/restaurant.jpg"}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#C1121F] border-2 border-[#FBF4E8] shadow-md" />
          </div>

          <div className="flex-1 text-center lg:text-left">
            <span
              className="inline-block text-xs tracking-[0.3em] uppercase text-[#E8A93A] mb-2"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {isSeller ? "Bảng điều khiển • Chủ quán" : "Hồ sơ quán ăn"}
            </span>

            <h1
              className="text-5xl md:text-7xl leading-none text-[#FBF4E8] uppercase"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              {name}
            </h1>

            <p className="text-[#C9C2B6] mt-4 text-lg flex items-center justify-center lg:justify-start gap-2">
              <span className="text-[#E8A93A]">📍</span> {address}
            </p>

            <div className="flex gap-3 mt-5 justify-center lg:justify-start flex-wrap">
              <span
                className="border border-[#E8A93A] text-[#E8A93A] px-4 py-1.5 rounded-full text-sm rotate-[-1deg]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                ★ 4.8 ĐÁNH GIÁ
              </span>
              <span
                className="border border-[#E8A93A] text-[#E8A93A] px-4 py-1.5 rounded-full text-sm rotate-[1deg]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                250+ ĐƠN HÀNG
              </span>
              {isSeller && (
                <span className="bg-[#C1121F] text-[#FBF4E8] px-4 py-1.5 rounded-full text-sm font-semibold">
                  Chế độ chủ quán
                </span>
              )}
            </div>
          </div>

          {/* hanging status tag */}
          <div className="shrink-0 rotate-[-4deg]">
            <div
              className={`px-6 py-3 rounded-lg font-bold shadow-xl border-2 ${
                isOpen
                  ? "bg-[#3F6B4A] border-[#8FBF9C] text-[#FBF4E8]"
                  : "bg-[#C1121F] border-[#E8938C] text-[#FBF4E8]"
              }`}
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              {isOpen ? "● ĐANG MỞ" : "● ĐÃ ĐÓNG"}
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* INFO CARD */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-xl">
            <h2
              className="text-2xl mb-8 uppercase tracking-wide"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              Thông tin quán ăn
            </h2>

            <div className="space-y-8">
              <div>
                <label
                  className="text-[#E8A93A] text-xs tracking-[0.2em] uppercase font-bold"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Tên quán
                </label>
                {editMode && isSeller ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-3 w-full bg-[#FBF4E8] rounded-xl p-4 outline-none focus:ring-4 focus:ring-[#E8A93A]/40 border border-[#E8DCC4]"
                  />
                ) : (
                  <div className="mt-3 text-2xl font-bold">{name}</div>
                )}
              </div>

              <div>
                <label
                  className="text-[#E8A93A] text-xs tracking-[0.2em] uppercase font-bold"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Địa chỉ
                </label>
                <div className="mt-3 flex items-center gap-2 text-lg text-[#5A554C] bg-[#FBF4E8] rounded-xl p-4 border border-[#E8DCC4]">
                  📍 {address}
                </div>
              </div>

              <div>
                <label
                  className="text-[#E8A93A] text-xs tracking-[0.2em] uppercase font-bold"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Mô tả
                </label>
                {editMode && isSeller ? (
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-3 w-full bg-[#FBF4E8] rounded-xl p-4 outline-none resize-none focus:ring-4 focus:ring-[#E8A93A]/40 border border-[#E8DCC4]"
                  />
                ) : (
                  <p className="mt-3 text-[#5A554C] leading-8">
                    {description || "Chưa có mô tả"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — receipt-style tickets */}
          <div className="space-y-6">
            {isSeller && (
              <div className="bg-white rounded-t-3xl rounded-b-2xl shadow-xl overflow-hidden">
                <div className="p-8 pb-4">
                  <h2
                    className="text-xl uppercase tracking-wide"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    Trạng thái quán
                  </h2>
                  <p className="text-[#8C8479] mt-2 text-sm">
                    Khách chỉ đặt được khi quán đang mở.
                  </p>

                  <div className="mt-8 flex justify-between items-center">
                    <span
                      className="font-semibold text-sm"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {isOpen ? "ĐANG MỞ" : "ĐÃ ĐÓNG"}
                    </span>
                    <button
                      type="button"
                      onClick={toggleOpenStatus}
                      className={`relative w-16 h-9 rounded-full transition ${
                        isOpen ? "bg-[#3F6B4A]" : "bg-[#D8D1C4]"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-7 h-7 bg-white rounded-full transition shadow ${
                          isOpen ? "left-8" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <TicketEdge />
              </div>
            )}

            {isSeller && (
              <div className="bg-white rounded-t-3xl rounded-b-2xl shadow-xl overflow-hidden">
                <div className="p-8 pb-6">
                  <h2
                    className="text-xl mb-6 uppercase tracking-wide"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    Thao tác
                  </h2>

                  <div className="space-y-3">
                    {editMode && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="w-full py-3.5 rounded-xl bg-[#F0EAD9] hover:bg-[#E8DCC4] transition font-medium"
                      >
                        Huỷ
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={editMode ? saveChanges : () => setEditMode(true)}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-[#C1121F] text-white font-bold shadow-lg hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? "Đang lưu..."
                        : editMode
                        ? "Lưu thay đổi"
                        : "Chỉnh sửa quán"}
                    </button>
                  </div>
                </div>
                <TicketEdge />
              </div>
            )}

            {!isSeller && (
              <div className="bg-white rounded-t-3xl rounded-b-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <h2
                    className="text-xl uppercase tracking-wide"
                    style={{ fontFamily: "'Anton', sans-serif" }}
                  >
                    Trạng thái quán
                  </h2>
                  <p className="mt-4 text-lg font-semibold">
                    {isOpen ? "🟢 Đang mở" : "🔴 Đã đóng"}
                  </p>
                </div>
                <TicketEdge />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;