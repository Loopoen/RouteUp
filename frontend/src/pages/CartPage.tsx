    
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { IRestaurant } from "../type";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import {
  FiArrowRight,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

const CartPage = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearCart, setClearCart] = useState(false);

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
      toast.success(data.message);
    } catch (error) {
      toast.error("Tăng số lượng thất bại");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
      toast.success(data.message);
    } catch (error) {
      toast.error("Giảm số lượng thất bại");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearQty = async () => {
    try {
      setClearCart(true);

      const { data } = await axios.delete(
        `${restaurantService}/api/cart/clear`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
      toast.success(data.message);
    } catch (error) {
      toast.error("Xóa giỏ hàng thất bại");
    } finally {
      setClearCart(false);
    }
  };

  const checkOut = () => {
    navigate("/checkout");
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[80vh] bg-gradient-to-br from-orange-50 via-white to-rose-50 px-4 py-10">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-white/70 bg-white/80 p-10 text-center shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100 text-orange-500 shadow-inner">
              <FiShoppingBag size={38} />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Giỏ hàng của bạn đang trống
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Có vẻ bạn chưa thêm món nào. Chọn vài món ngon rồi quay lại đây để
              hoàn tất đơn hàng nhé.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02]"
            >
              Khám phá món ăn
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 500 ? 49 : 0;
  const serviceFee = 7;
  const total = subTotal + deliveryFee + serviceFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50 px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* top header */}
        <div className="mb-8 rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                Cart summary
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Giỏ hàng của bạn
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {restaurant?.name
                  ? `Đơn hàng từ ${restaurant.name}`
                  : "Xem lại các món trước khi thanh toán"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                <p className="text-xs font-medium text-orange-500">
                  Tổng số món
                </p>
                <p className="text-lg font-bold text-gray-900">{quantity}</p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <p className="text-xs font-medium text-rose-500">Tạm tính</p>
                <p className="text-lg font-bold text-gray-900">
                  ${subTotal.toFixed(2)}
                </p>
              </div>

              <button
                onClick={clearQty}
                disabled={clearCart}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 />
                {clearCart ? "Đang xóa..." : "Xóa giỏ hàng"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.95fr]">
          {/* left */}
          <div className="space-y-5">
            {cart.map((cartItem: any) => {
              const item = cartItem.itemId;
              const itemId = item?._id;
              const itemName = item?.name || "Menu item";
              const itemPrice = Number(item?.price || 0);
              const itemImage =
                item?.image || "https://placehold.co/400x400?text=Food";
              const itemQty = Number(cartItem.quantity || 1);
              const isLoading = loadingItemId === itemId;

              return (
                <div
                  key={cartItem._id || itemId}
                  className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_25px_80px_rgba(0,0,0,0.08)] sm:p-5"
                >
                  <div className="flex flex-col gap-5 md:flex-row">
                    {/* image */}
                    <div className="relative h-40 w-full overflow-hidden rounded-[24px] bg-gray-100 md:h-40 md:w-40">
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow">
                        x{itemQty}
                      </div>
                    </div>

                    {/* content */}
                    <div className="flex flex-1 flex-col justify-between gap-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                            {itemName}
                          </h2>

                          {item?.description && (
                            <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 rounded-2xl bg-orange-50 px-4 py-3 text-left sm:text-right">
                          <p className="text-xs font-medium text-orange-500">
                            Đơn giá
                          </p>
                          <p className="mt-1 text-xl font-extrabold text-gray-900">
                            ${itemPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* qty controller */}
                        <div className="flex w-fit items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 shadow-inner">
                          <button
                            onClick={() => decreaseQty(itemId)}
                            disabled={isLoading}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiMinus />
                          </button>

                          <div className="min-w-[72px] text-center">
                            <p className="text-[11px] uppercase tracking-wide text-gray-400">
                              Số lượng
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {isLoading ? "..." : itemQty}
                            </p>
                          </div>

                          <button
                            onClick={() => increaseQty(itemId)}
                            disabled={isLoading}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        {/* total item */}
                        <div className="rounded-2xl bg-gray-50 px-5 py-3 text-left sm:text-right">
                          <p className="text-xs font-medium text-gray-400">
                            Thành tiền
                          </p>
                          <p className="mt-1 text-2xl font-extrabold tracking-tight text-gray-900">
                            ${(itemPrice * itemQty).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* right */}
          <div className="h-fit rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:sticky lg:top-6">
            <div className="rounded-[26px] bg-gradient-to-r from-orange-500 to-rose-500 p-[1px]">
              <div className="rounded-[25px] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Order summary
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  Tóm tắt đơn hàng
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Kiểm tra chi phí đơn hàng trước khi chuyển sang bước thanh toán.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tổng số món</span>
                    <span className="font-semibold text-gray-900">
                      {quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-900">
                      ${subTotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Phí giao hàng</span>
                    <span className="font-semibold text-gray-900">
                      ${deliveryFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Phí dịch vụ</span>
                    <span className="font-semibold text-gray-900">
                      ${serviceFee.toFixed(2)}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-700">
                        Tổng thanh toán
                      </span>
                      <span className="text-3xl font-extrabold tracking-tight text-orange-500">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={checkOut}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:scale-[1.01] hover:shadow-xl"
                >
                  Thanh toán ngay
                  <FiArrowRight />
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Tiếp tục chọn món
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-orange-100 bg-orange-50 p-5">
              <p className="text-sm font-semibold text-orange-600">
                Ưu đãi giao hàng
              </p>
              <p className="mt-2 text-sm leading-6 text-orange-700">
                Đơn từ <span className="font-bold">$500</span> sẽ được miễn phí
                giao hàng. Bạn còn{" "}
                <span className="font-bold">
                  ${Math.max(0, 500 - subTotal).toFixed(2)}
                </span>{" "}
                để đạt mốc freeship.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
