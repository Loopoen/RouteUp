import { useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

const AddRestaurant = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !image || !location) {
      alert("Tất cả thông tin bắt buộc phải được nhập");
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Thêm Nhà Hàng
        </h2>

        <div className="space-y-5">
          {/* Tên nhà hàng */}
          <div>
            <label className="block mb-2 font-medium">
              Tên nhà hàng *
            </label>
            <input
              type="text"
              placeholder="Nhập tên nhà hàng"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block mb-2 font-medium">
              Số điện thoại
            </label>
            <input
              type="text"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block mb-2 font-medium">
              Mô tả
            </label>
            <textarea
              rows={4}
              placeholder="Mô tả nhà hàng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block mb-2 font-medium">
              Hình ảnh *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files?.[0] || null)
              }
              className="w-full border rounded-lg p-3"
            />

            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="mt-4 h-40 w-full object-cover rounded-lg border"
              />
            )}
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block mb-2 font-medium">
              Địa chỉ hiện tại
            </label>

            {loadingLocation ? (
              <p className="text-gray-500">Đang lấy vị trí...</p>
            ) : (
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                {location?.formattedAddress ||
                  "Không lấy được vị trí"}
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400"
          >
            {submitting ? "Đang tạo..." : "Tạo Nhà Hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;