import { useEffect, useState } from "react";
import axios from "axios";
import type { IOrder } from "../type";
import { ORDER_ACTION } from '../utils/OrderFlow';
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { TbLoader2 } from "react-icons/tb";
import { BiRefresh } from "react-icons/bi";

interface props {
  order: IOrder,
  onStatusUpdate?: () => void
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "accepted":
      return "bg-indigo-50 text-indigo-600 border-indigo-200";
    case "preparing":
      return "bg-amber-50 text-amber-600 border-amber-200";
    case "ready_for_rider":
      return "bg-purple-50 text-purple-600 border-purple-200";
    case "pick_up":
      return "bg-cyan-50 text-cyan-600 border-cyan-200";
    case "completed":
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

const OrderCard = ({ order, onStatusUpdate }: props) => {

  const [loading, setLoading] = useState(false)

  const [retryVisible, setRetryVisible] = useState(false)

 
  // NEW: state cục bộ để hiển thị ngay, không đợi fetch lại từ cha
  const [localStatus, setLocalStatus] = useState(order.status)

  // NEW: nếu order từ cha đổi (do fetchOrders trả về), đồng bộ lại state cục bộ
  useEffect(() => {
    setLocalStatus(order.status)
  }, [order.status])
   useEffect(()=>{
    if(localStatus != "ready_for_rider"){
      setRetryVisible(false)

      return
    }

    const timer = setTimeout(()=>{
      setRetryVisible(true)
    }, 10000)

    return ()=> clearTimeout(timer)
  }, [localStatus])


  const action = ORDER_ACTION[localStatus] || []

  const updateStatus = async (status: string) => {
    const prevStatus = localStatus // lưu lại để rollback nếu lỗi

    try {
      setLoading(true)
      setRetryVisible(false)
      setLocalStatus(status) // NEW: cập nhật giao diện ngay lập tức (optimistic)

      await axios.put(`${restaurantService}/api/order/${order._id}`, { status }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      toast.success("cap nhat order thanh cong")
      onStatusUpdate?.()
    }
    catch (err) {
      console.log(err)
      setLocalStatus(prevStatus) // NEW: rollback nếu API lỗi
      toast.error("cap nhat that bai")
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            #{order._id?.slice(-6).toUpperCase()} · {order.restaurantName}
          </p>
          <p className="text-xs text-gray-400">
            {order.createdAt && new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusColor(localStatus)}`}>
          {localStatus}
        </span>
      </div>

      {/* Địa chỉ */}
      {order.deliveryAddress?.formattedAddress && (
        <p className="mt-2 line-clamp-1 text-xs text-gray-500">
          📍 {order.deliveryAddress.formattedAddress}
        </p>
      )}

      {/* Items */}
      <div className="mt-3 space-y-1 border-t border-dashed border-gray-100 pt-3">
        {order.items?.slice(0, 3).map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between text-sm text-gray-600">
            <span>{item.quantity}x {item.name}</span>
            <span className="text-gray-400">{item.price?.toLocaleString("vi-VN")}đ</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <p className="text-xs text-gray-400">+{order.items.length - 3} món khác</p>
        )}
      </div>

      {/* Tổng tiền */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm text-gray-500">Tổng cộng</span>
        <span className="text-base font-semibold text-gray-900">
          {order.totalAmount?.toLocaleString("vi-VN")}đ
        </span>
      </div>

      {/* Rider + payment */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {order.paymentMethod} · {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
        </span>
        {order.riderName ? (
          <span>🛵 {order.riderName}</span>
        ) : (
          <span className="text-gray-400">Chưa có tài xế</span>
        )}
      </div>

      {/* Actions */}
      {action.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {action.map((next: string) => (
            <button
              key={next}
              disabled={loading}
              onClick={() => updateStatus(next)}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang cập nhật..." : next}
            </button>
          ))}
        </div>
      )}
      {localStatus === "ready_for_rider" && retryVisible && (
  <div className="pt-2">
    <button
      onClick={() => updateStatus("ready_for_rider")}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md border border-amber-200
        bg-amber-50 text-amber-700 text-sm font-medium px-3.5 py-1.5
        disabled:opacity-70"
    >
      {loading ? (
        <>
          <TbLoader2 size={15} className="animate-spin" />
          Đang tìm...
        </>
      ) : (
        <>
          <BiRefresh size={15} />
          Tìm tài xế lại
        </>
      )}
    </button>
  </div>
    )}
    </div>
  );
};

export default OrderCard;