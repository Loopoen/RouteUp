import { useState } from "react";
import { FaStore, FaPhone, FaImage } from "react-icons/fa";
import { MdDescription, MdLocationOn } from "react-icons/md";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";



interface props{
  fetchMyRestaurant:()=>Promise<void> 
}

const AddRestaurant = ({fetchMyRestaurant}:props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(location.latitude));
    formData.append("longtitude", String(location.longitude));
    formData.append("formatedAddress", location.formattedAddress);
    formData.append("file", image);
    formData.append("phone", phone);

    console.log("one",localStorage.getItem("token"))

    try {
      setSubmitting(true);

      await axios.post(
        `${restaurantService}/api/restaurant/new`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Tạo nhà hàng thành công!");
      await fetchMyRestaurant()


    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 flex justify-center items-center p-6">
      <div className="w-full max-w-3xl backdrop-blur-lg bg-white/80 border border-white/20 shadow-2xl rounded-3xl p-8 animate-in fade-in duration-500">

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 text-white p-3 rounded-xl">
            <FaStore size={24} />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Thêm Nhà Hàng
            </h2>
            <p className="text-gray-500">
              Đăng ký nhà hàng mới vào hệ thống
            </p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Tên */}
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <FaStore />
              Tên nhà hàng
            </label>

            <input
              type="text"
              placeholder="Nhập tên nhà hàng..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <FaPhone />
              Số điện thoại
            </label>

            <input
              type="text"
              placeholder="Nhập số điện thoại..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <MdDescription />
              Mô tả
            </label>

            <textarea
              rows={4}
              placeholder="Mô tả nhà hàng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-4 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>

          
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <FaImage />
              Hình ảnh
            </label>

            <label className="cursor-pointer flex flex-col justify-center items-center border-2 border-dashed border-orange-300 rounded-2xl p-8 hover:bg-orange-50 transition-all">
              <FaImage
                size={40}
                className="text-orange-500 mb-3"
              />

              <p className="text-gray-600">
                Click để chọn ảnh
              </p>

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files?.[0] || null)
                }
              />
            </label>

            {image && (
              <div className="mt-5 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="h-60 w-full object-cover hover:scale-105 transition duration-500"
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 mb-2 font-medium">
              <MdLocationOn />
              Địa chỉ hiện tại
            </label>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              {loadingLocation ? (
                <p className="text-gray-500">
                  Đang lấy vị trí...
                </p>
              ) : (
                <p className="text-gray-700">
                  {location?.formattedAddress ||
                    "Không lấy được vị trí"}
                </p>
              )}
            </div>
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-4 rounded-xl hover:scale-[1.02] hover:shadow-xl transition-all duration-300 disabled:opacity-60"
          >
            {submitting ? (
              <div className="flex justify-center items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang tạo...
              </div>
            ) : (
              " Tạo Nhà Hàng"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;