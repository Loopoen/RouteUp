import { useState } from "react";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import type { IOrder } from "../type";
import { MapPin, Store, Phone, Package, Loader2, Navigation } from "lucide-react";

interface Props {
  order: IOrder;
  onStateUpdate: () => void;
}

const STATUS_LABEL: Record<IOrder["status"], string> = {
  placed: "Chờ xác nhận",
  accepted: "Nhà hàng đã nhận",
  preparing: "Đang chuẩn bị",
  ready_for_rider: "Chờ tài xế",
  rider_assigned: "Đã nhận đơn",
  picked_up: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

const STATUS_STYLE: Record<IOrder["status"], string> = {
  placed: "bg-gray-100 text-gray-600 ring-gray-500/20",
  accepted: "bg-blue-50 text-blue-700 ring-blue-600/20",
  preparing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  ready_for_rider: "bg-amber-50 text-amber-700 ring-amber-600/20",
  rider_assigned: "bg-amber-50 text-amber-700 ring-amber-600/20",
  picked_up: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  delivered: "bg-gray-100 text-gray-600 ring-gray-500/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
};

// Chỉ 2 bước rider được phép tự tay chuyển tiếp
const NEXT_STEP: Partial<Record<IOrder["status"], { next: IOrder["status"]; label: string }>> = {
  rider_assigned: { next: "picked_up", label: "Xác nhận đã lấy hàng" },
  picked_up: { next: "delivered", label: "Hoàn thành đơn" },
};

const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

const RiderCurrentOrder = ({ order, onStateUpdate }: Props) => {
  const [loading, setLoading] = useState(false);
  const step = NEXT_STEP[order.status];

  const updateStatus = async () => {
    if (!step) return;
    setLoading(true);
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        { },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Cập nhật đơn hàng thành công");
      onStateUpdate();
    } catch (err) {
      toast.error("Cập nhật đơn hàng không thành công");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Đơn hiện tại</p>
          <p className="text-sm font-semibold text-gray-900">
            #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[order.status]}`}
        >
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* Route: quán -> khách */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-1">
            <Store className="w-4 h-4 text-gray-400" />
            <div className="w-px flex-1 bg-gray-200 my-1" />
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-400">Lấy hàng tại</p>
              <p className="text-sm font-medium text-gray-900">{order.restaurantName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Giao đến</p>
              <p className="text-sm font-medium text-gray-900">
                {order.deliveryAddress.formattedAddress}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          
            <a href={`tel:${order.deliveryAddress.mobile}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold  " />
          <span className="text-black">
            <Phone className="w-3.5 h-3.5 text-black" />
            {order.deliveryAddress.mobile}
          </span>
          
            <a href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 text-black" />
          <span className="text-black">
            <Navigation className="w-3.5 h-3.5" />
            {order.distance} km
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <Package className="w-3.5 h-3.5" />
          {order.items.length} món
        </div>
        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={item.itemId} className="flex justify-between text-sm text-gray-700">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-500">{formatVND(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tổng tiền + thu nhập rider + hành động */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Tổng đơn hàng</span>
          <span>{formatVND(order.totalAmount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Thu nhập chuyến này</p>
            <p className="text-base font-semibold text-emerald-600">
              {formatVND(order.riderAmount)}
            </p>
          </div>

          {step ? (
            <button
              onClick={updateStatus}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : step.label}
            </button>
          ) : (
            <span className="text-sm text-gray-400">Không có thao tác</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderCurrentOrder;