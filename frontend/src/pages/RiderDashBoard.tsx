import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";
import audio from "../assets/faaah.mp3";
import type { IOrder } from "../type";
import RiderCurrentOrder from "../components/RiderCurrentOrder";

export interface IRider {
  userId: string;
  picture: string;
  phoneNumber: string;
  cccdNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  isAvailable: boolean;
}

const RiderDashBoard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();



  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);



  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

 
  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);

  const [respondingOrderId, setRespondingOrderId] =
    useState<string | null>(null);


  const [phoneNumber, setPhoneNumber] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [submitting, setSubmitting] = useState(false);



  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("rider_audio_muted") === "true";
  });

  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;

    localStorage.setItem(
      "rider_audio_muted",
      String(isMuted)
    );
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const playAlert = () => {
    if (isMutedRef.current) return;

    const el = audioRef.current;

    if (!el) return;

    el.currentTime = 0;

    el.play().catch((err) => {
      console.log("Không thể phát âm thanh:", err);
    });
  };



  const fetchMyProfile = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/myProfile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProfile(data || null);

      console.log("Rider profile:", data);
    } catch (err) {
      console.log("Fetch profile error:", err);

      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchMyProfile();
    } else {
      setLoading(false);
    }
  }, [user]);



  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Current order:", data);

      setCurrentOrder(data.order || null);
    } catch (err) {
      console.log("Không có current order");

      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchCurrentOrder();
    }
  }, [user]);


  const removeIncomingOrder = (orderId: string) => {
    setIncomingOrders((prev) =>
      prev.filter((id) => id !== orderId)
    );
  };



  useEffect(() => {
    if (!socket) return;

    const handleOrderAvailable = (payload: {
      orderId: string;
    }) => {
      console.log(
        "order:available:",
        payload
      );

      if (!payload?.orderId) return;

  
      if (currentOrder) {
        return;
      }

      setIncomingOrders((prev) => {
    
        if (prev.includes(payload.orderId)) {
          return prev;
        }

        return [
          ...prev,
          payload.orderId,
        ];
      });

      playAlert();

      toast.success(
        "Có chuyến mới!"
      );
    };

    const handleOrderTaken = (payload: {
      orderId: string;
    }) => {
      if (!payload?.orderId) return;

      console.log(
        "order:taken:",
        payload
      );

      removeIncomingOrder(
        payload.orderId
      );
    };

    const handleOrderExpired = (payload: {
      orderId: string;
    }) => {
      if (!payload?.orderId) return;

      console.log(
        "order:expired:",
        payload
      );

      removeIncomingOrder(
        payload.orderId
      );
    };

    socket.on(
      "order:available",
      handleOrderAvailable
    );

    socket.on(
      "order:taken",
      handleOrderTaken
    );

    socket.on(
      "order:expired",
      handleOrderExpired
    );

    return () => {
      socket.off(
        "order:available",
        handleOrderAvailable
      );

      socket.off(
        "order:taken",
        handleOrderTaken
      );

      socket.off(
        "order:expired",
        handleOrderExpired
      );
    };
  }, [socket, currentOrder]);



  const acceptOrder = async (
    orderId: string
  ) => {
    setRespondingOrderId(orderId);

    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );


      await fetchCurrentOrder();

   
      setIncomingOrders([]);

      toast.success(
        "Bạn đã nhận chuyến"
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
      console.log("========== FRONTEND ACCEPT ERROR ==========");
      console.log("URL:", err.config?.url);
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
    }

    toast.error(
      axios.isAxiosError(err)
        ? err.response?.data?.message || "Không thể nhận chuyến"
        : "Không thể nhận chuyến"
    );
    } finally {
      setRespondingOrderId(null);
    }
  };


  const declineOrder = async (
    orderId: string
  ) => {
    setRespondingOrderId(orderId);
   
      removeIncomingOrder(orderId);

      setRespondingOrderId(null);
    
  };



  const toggleAvailablity = async () => {
    if (!navigator.geolocation) {
      toast.error(
        "Không thể truy cập vị trí của bạn"
      );

      return;
    }

    if (!profile) return;

    setToggling(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newAvailability =
          !profile.isAvailable;

        try {
          const { data } =
            await axios.patch(
              `${riderService}/api/rider/toggle`,
              {
                isAvailable:
                  newAvailability,

                latitude:
                  pos.coords.latitude,

                longitude:
                  pos.coords.longitude,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "token"
                  )}`,
                },
              }
            );

          console.log(
            "Toggle response:",
            data
          );

          
          setProfile((prev) =>
            prev
              ? {
                  ...prev,

                  isAvailable:
                    data.rider
                      ?.isAvailable ??
                    newAvailability,
                }
              : prev
          );

          if (newAvailability) {
            toast.success(
              "Bạn đã bắt đầu nhận chuyến"
            );
          } else {
            toast.success(
              "Bạn đã tạm dừng nhận chuyến"
            );

         
            setIncomingOrders([]);
          }
        } catch (err) {
          console.log(
            "Toggle error:",
            err
          );

          toast.error(
            "Có lỗi xảy ra, vui lòng thử lại"
          );
        } finally {
          setToggling(false);
        }
      },
      () => {
        toast.error(
          "Không thể lấy vị trí, vui lòng bật định vị"
        );

        setToggling(false);
      }
    );
  };



  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };



  const handleSubmit = async () => {
    if (
      !phoneNumber ||
      !cccdNumber ||
      !drivingLicenseNumber
    ) {
      toast.error(
        "Vui lòng điền đầy đủ thông tin"
      );

      return;
    }

    if (!navigator.geolocation) {
      toast.error(
        "Không thể truy cập vị trí của bạn"
      );

      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const formData =
          new FormData();

        formData.append(
          "phoneNumber",
          phoneNumber
        );

        formData.append(
          "cccdNumber",
          cccdNumber
        );

        formData.append(
          "drivingLicenseNumber",
          drivingLicenseNumber
        );

        formData.append(
          "latitude",
          pos.coords.latitude.toString()
        );

        formData.append(
          "longitude",
          pos.coords.longitude.toString()
        );

        if (image) {
          formData.append(
            "file",
            image
          );
        }

        try {
          const { data } =
            await axios.post(
              `${riderService}/api/rider/add`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "token"
                  )}`,

                  "Content-Type":
                    "multipart/form-data",
                },
              }
            );

     
          setProfile(
            data.riderProfile ||
              data
          );

          toast.success(
            "Đăng ký thành công, vui lòng chờ xác minh"
          );
        } catch (err) {
          console.log(
            "Add rider error:",
            err
          );

          toast.error(
            "Đăng ký thất bại, vui lòng thử lại"
          );
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        toast.error(
          "Không thể lấy vị trí, vui lòng bật định vị"
        );

        setSubmitting(false);
      }
    );
  };



  if (user?.role !== "rider") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>
          Trang này chỉ dành cho tài xế.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#F4EFE6]/60">
          Đang tải hồ sơ...
        </p>
      </div>
    );
  }


  if (!profile) {
    return (
      <div className="min-h-screen bg-[#12181A] text-[#F4EFE6] py-10">
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-3xl border border-[#F4EFE6]/10 bg-[#1A211F] p-8">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-[#F2B134] mb-2">
                Hồ sơ tài xế
              </p>

              <h1 className="text-2xl font-semibold">
                Hoàn tất đăng ký
              </h1>

              <p className="text-sm text-[#F4EFE6]/50 mt-3 leading-relaxed">
                Điền thông tin bên dưới để
                bắt đầu nhận chuyến. Hồ sơ
                của bạn sẽ được xác minh
                trong vòng 24 giờ.
              </p>
            </div>

            <div className="space-y-5">
              {/* IMAGE */}

              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                  Ảnh chân dung
                </span>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1E2624] border border-[#F4EFE6]/10 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-[#F4EFE6]/30">
                        +
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleImageChange
                    }
                    className="text-sm text-[#F4EFE6]/60 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-[#F2B134] file:text-[#12181A] file:text-xs file:font-medium file:cursor-pointer"
                  />
                </div>
              </label>

              {/* PHONE */}

              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                  Số điện thoại
                </span>

                <input
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(
                      e.target.value
                    )
                  }
                  placeholder="09xx xxx xxx"
                  className="w-full bg-[#1E2624] border border-[#F4EFE6]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2B134] focus:ring-1 focus:ring-[#F2B134] transition"
                />
              </label>

              {/* CCCD */}

              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                  Số CCCD
                </span>

                <input
                  value={cccdNumber}
                  onChange={(e) =>
                    setCccdNumber(
                      e.target.value
                    )
                  }
                  placeholder="001xxxxxxxxx"
                  className="w-full bg-[#1E2624] border border-[#F4EFE6]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2B134] focus:ring-1 focus:ring-[#F2B134] transition"
                />
              </label>

              {/* LICENSE */}

              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                  Số bằng lái xe
                </span>

                <input
                  value={
                    drivingLicenseNumber
                  }
                  onChange={(e) =>
                    setDrivingLicenseNumber(
                      e.target.value
                    )
                  }
                  placeholder="xxxxxxxxxx"
                  className="w-full bg-[#1E2624] border border-[#F4EFE6]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2B134] focus:ring-1 focus:ring-[#F2B134] transition"
                />
              </label>

              <p className="text-xs text-[#F4EFE6]/40 leading-relaxed">
                Chúng tôi cần vị trí hiện
                tại của bạn để xác nhận
                khu vực hoạt động.
              </p>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#F2B134] text-[#12181A] font-semibold rounded-xl py-3 text-sm tracking-wide hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50"
              >
                {submitting
                  ? "Đang gửi..."
                  : "Gửi hồ sơ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  if (!profile.isVerified) {
    return (
      <div className="min-h-screen bg-[#12181A] text-[#F4EFE6] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-[#F4EFE6]/10 bg-[#1A211F] p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[#F2B134]/10 flex items-center justify-center">
            <span className="text-2xl">
              ⏳
            </span>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-[#F2B134] mb-3">
            Rider
          </p>

          <h1 className="text-xl font-semibold">
            Hồ sơ đang chờ xác minh
          </h1>

          <p className="text-sm text-[#F4EFE6]/50 mt-4 leading-relaxed">
            Chúng tôi đang kiểm tra thông
            tin của bạn. Bạn sẽ có thể
            nhận chuyến ngay sau khi hồ
            sơ được duyệt.
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#12181A] text-[#F4EFE6]">
      {/* AUDIO */}

      <audio
        ref={audioRef}
        src={audio}
        preload="auto"
      />

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <img
              src={
                profile.picture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${profile.userId}`
              }
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border border-[#F4EFE6]/10"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#F2B134]">
                Tài xế
              </p>

              <p className="font-medium">
                {profile.phoneNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* MUTE */}

            <button
              onClick={toggleMute}
              title={
                isMuted
                  ? "Bật âm thanh cảnh báo"
                  : "Tắt âm thanh cảnh báo"
              }
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[#F4EFE6]/10 bg-[#1A211F] hover:bg-[#1E2624] transition text-[#F4EFE6]/70"
            >
              {isMuted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

                  <line
                    x1="23"
                    y1="9"
                    x2="17"
                    y2="15"
                  />

                  <line
                    x1="17"
                    y1="9"
                    x2="23"
                    y2="15"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />

                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {/* VERIFIED */}

            <span className="text-xs px-3 py-1.5 rounded-full bg-[#4FD1C5]/10 text-[#4FD1C5] border border-[#4FD1C5]/30 tracking-wide">
              Đã xác minh
            </span>
          </div>
        </div>

     

        {incomingOrders.length > 0 &&
          !currentOrder && (
            <div className="mb-6 space-y-3">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#F2B134]">
                    Đơn mới
                  </p>

                  <p className="text-sm text-[#F4EFE6]/50 mt-1">
                    Có{" "}
                    {incomingOrders.length}{" "}
                    chuyến đang chờ bạn
                    nhận
                  </p>
                </div>

                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F2B134]/10 text-[#F2B134] text-sm font-semibold">
                  {incomingOrders.length}
                </span>
              </div>

              {incomingOrders.map(
                (orderId) => (
                  <div
                    key={orderId}
                    className="rounded-2xl border border-[#F2B134]/40 bg-[#1A211F] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-[#F2B134] animate-pulse" />

                          <p className="text-xs uppercase tracking-wider text-[#F2B134]">
                            Chuyến mới
                          </p>
                        </div>

                        <p className="text-sm text-[#F4EFE6]/80">
                          Có đơn hàng mới
                          đang chờ bạn nhận
                        </p>

                        <p className="text-xs text-[#F4EFE6]/30 mt-2 truncate">
                          Mã đơn:{" "}
                          {orderId}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">

                        {/* DECLINE */}

                        <button
                          onClick={() =>
                            declineOrder(
                              orderId
                            )
                          }
                          disabled={
                            respondingOrderId ===
                            orderId
                          }
                          className="px-4 py-2.5 rounded-full text-xs font-medium bg-[#F4EFE6]/10 text-[#F4EFE6] hover:bg-[#F4EFE6]/15 transition disabled:opacity-50"
                        >
                          Bỏ qua
                        </button>

                        {/* ACCEPT */}

                        <button
                          onClick={() =>
                            acceptOrder(
                              orderId
                            )
                          }
                          disabled={
                            respondingOrderId ===
                            orderId
                          }
                          className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#F2B134] text-[#12181A] hover:brightness-95 transition disabled:opacity-50"
                        >
                          {respondingOrderId ===
                          orderId
                            ? "..."
                            : "Nhận"}
                        </button>

                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}


        {currentOrder && (
          <div className="mb-6 rounded-3xl border border-[#4FD1C5]/30 bg-[#1A211F] p-6">

            <div className="flex items-center justify-between mb-5">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#4FD1C5]">
                  Chuyến hiện tại
                </p>

                <p className="text-sm text-[#F4EFE6]/50 mt-1">
                  Bạn đang thực hiện
                  một chuyến
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-full text-xs bg-[#4FD1C5]/10 text-[#4FD1C5] border border-[#4FD1C5]/20">
                Đang giao
              </span>
            </div>

            <div className="rounded-2xl bg-[#12181A] p-4">

              <p className="text-xs text-[#F4EFE6]/40">
                Order ID
              </p>

              <p className="text-sm font-medium mt-1 break-all">
                {currentOrder._id}
              </p>

            </div>
          </div>
        )}

       
        <div className="relative rounded-3xl border border-[#F4EFE6]/10 bg-[#1A211F] p-8 overflow-hidden">

          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              profile.isAvailable
                ? "opacity-100"
                : "opacity-0"
            }`}
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(242,177,52,0.12), transparent 60%)",
            }}
          />

          <div className="relative flex flex-col items-center text-center">

            <button
              onClick={
                toggleAvailablity
              }
              disabled={toggling}
              className="relative w-32 h-32 rounded-full flex items-center justify-center mb-6 transition disabled:opacity-60"
              style={{
                background:
                  profile.isAvailable
                    ? "conic-gradient(from 0deg, #F2B134, #FFD98A, #F2B134)"
                    : "#1E2624",

                boxShadow:
                  profile.isAvailable
                    ? "0 0 40px rgba(242,177,52,0.35)"
                    : "inset 0 0 0 2px rgba(244,239,230,0.1)",
              }}
            >

              <div className="w-24 h-24 rounded-full bg-[#12181A] flex items-center justify-center">

                {toggling ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[#F2B134] border-t-transparent animate-spin" />
                ) : (
                  <span className="text-sm font-semibold tracking-wide">
                    {profile.isAvailable
                      ? "ONLINE"
                      : "OFFLINE"}
                  </span>
                )}

              </div>
            </button>

            <p className="text-sm text-[#F4EFE6]/60 max-w-xs leading-relaxed mb-6">

              {profile.isAvailable
                ? "Bạn đang hiển thị với khách hàng gần đây và có thể nhận chuyến mới."
                : "Bật trạng thái để bắt đầu nhận chuyến từ khách hàng gần bạn."}

            </p>

            <button
              onClick={
                toggleAvailablity
              }
              disabled={toggling}
              className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition disabled:opacity-50 ${
                profile.isAvailable
                  ? "bg-[#F4EFE6]/10 text-[#F4EFE6] hover:bg-[#F4EFE6]/15"
                  : "bg-[#F2B134] text-[#12181A] hover:brightness-95"
              }`}
            >
              {profile.isAvailable
                ? "Ngừng nhận chuyến"
                : "Bắt đầu nhận chuyến"}
            </button>

          </div>
        </div>


        <div className="grid grid-cols-2 gap-4 mt-6">

          <div className="rounded-2xl border border-[#F4EFE6]/10 bg-[#1A211F] p-5">

            <p className="text-xs uppercase tracking-wider text-[#F4EFE6]/40 mb-2">
              CCCD
            </p>

            <p className="text-sm font-medium">
              {profile.cccdNumber}
            </p>

          </div>

          <div className="rounded-2xl border border-[#F4EFE6]/10 bg-[#1A211F] p-5">

            <p className="text-xs uppercase tracking-wider text-[#F4EFE6]/40 mb-2">
              Bằng lái xe
            </p>

            <p className="text-sm font-medium">
              {profile.drivingLicenseNumber}
            </p>

          </div>

        </div>

      </div>

        {currentOrder && <div className="mx-auto max-w-md px-4 space-y-4">
            <RiderCurrentOrder order = {currentOrder} onStateUpdate = {fetchCurrentOrder}/>
          
      </div>}
    </div>


  
  );
};

export default RiderDashBoard;