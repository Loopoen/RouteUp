import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";

const OrderSuccess = () => {
  const [params] = useSearchParams();

 
  const sessionIdRef = useRef(params.get("session_id"));
  const hasVerifiedRef = useRef(false); // tránh gọi verify 2 lần (StrictMode / re-render)

  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    const sessionId = sessionIdRef.current;

    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }
      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, {
          sessionId,
        });
        setStatus("success");
        toast.success("Thanh toán thành công");
      } catch (err) {
        setStatus("error");
        toast.error("Xác thực thanh toán thất bại");
        console.log(err);
      }
    };

    verifyPayment();
  }, []); // chỉ chạy 1 lần khi mount

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-emerald-100 p-8 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

          {status === "verifying" && (
            <div className="relative">
              <div className="mx-auto mb-6 w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
              <h2 className="text-xl font-semibold text-slate-800">
                Đang xác nhận thanh toán...
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Vui lòng đợi trong giây lát
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="relative animate-[fadeIn_0.4s_ease-out]">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    style={{
                      strokeDasharray: 30,
                      strokeDashoffset: 30,
                      animation: "draw 0.5s 0.2s ease-out forwards",
                    }}
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-slate-800">
                Đặt hàng thành công!
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Cảm ơn bạn đã mua hàng. Chúng tôi đã gửi email xác nhận đơn hàng.
              </p>

              {sessionIdRef.current && (
                <div className="mt-6 bg-slate-50 rounded-xl px-4 py-3 text-left">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">
                    Mã giao dịch
                  </p>
                  <p className="text-sm font-mono text-slate-700 truncate">
                    {sessionIdRef.current}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/orders"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-medium py-2.5 rounded-lg text-sm"
                >
                  Xem đơn hàng
                </Link>
                <Link
                  to="/"
                  className="flex-1 border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 font-medium py-2.5 rounded-lg text-sm"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="relative">
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Không thể xác nhận thanh toán
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Vui lòng kiểm tra lại đơn hàng hoặc liên hệ hỗ trợ.
              </p>
              <Link
                to="/"
                className="inline-block mt-6 bg-slate-800 hover:bg-slate-900 transition-colors text-white font-medium py-2.5 px-6 rounded-lg text-sm"
              >
                Về trang chủ
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;