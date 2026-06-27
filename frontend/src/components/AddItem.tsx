import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { restaurantService } from "../main";

const AddItem = ({ onItemAdd }: { onItemAdd: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        🍽️ Thêm món ăn mới
      </h2>

      <div className="space-y-5">

        <div>
          <label className="font-medium text-gray-700">
            Tên món
          </label>

          <input
            type="text"
            placeholder="Ví dụ: Pizza Hải Sản"
            className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium text-gray-700">
            Mô tả
          </label>

          <textarea
            rows={4}
            placeholder="Mô tả món ăn..."
            className="w-full mt-2 p-3 border rounded-xl resize-none focus:ring-2 focus:ring-orange-400 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium text-gray-700">
            Giá
          </label>

          <input
            type="number"
            placeholder="100000"
            className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium text-gray-700">
            Hình ảnh
          </label>

          <input
            type="file"
            accept="image/*"
            className="w-full mt-2 border rounded-xl p-3"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
          />

          {image && (
            <p className="text-sm text-gray-500 mt-2">
              Đã chọn: {image.name}
            </p>
          )}
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-semibold py-3 rounded-xl disabled:bg-gray-400"
        >
          {loading ? "Đang thêm..." : "➕ Thêm món"}
        </button>
      </div>
    </div>
  );
};

export default AddItem;