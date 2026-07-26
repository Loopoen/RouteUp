import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { riderService } from "../main";
import toast from "react-hot-toast";

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

  // onboarding form state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cccdNumber, setCccdNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchMyProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myProfile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfile(data || null);
    } catch (err) {
      console.log(err);
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

  const toggleAvailablity = async () => {
    if (!navigator.geolocation) {
      toast.error("Không thể truy cập vị trí của bạn, vui lòng bật định vị");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.patch(
            `${riderService}/api/rider/toggle`,
            {
              isAvailable: !profile?.isAvailable,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          setProfile((prev) => (prev ? { ...prev, isAvailable: !prev.isAvailable } : prev));
          toast.success(
            !profile?.isAvailable ? "Bạn đã bắt đầu nhận chuyến" : "Bạn đã tạm dừng nhận chuyến"
          );
        } catch (err) {
          console.log(err);
          toast.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
          setToggling(false);
        }
      },
      () => {
        toast.error("Không thể lấy vị trí, vui lòng bật định vị");
        setToggling(false);
      }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!phoneNumber || !cccdNumber || !drivingLicenseNumber) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Không thể truy cập vị trí của bạn, vui lòng bật định vị");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const formData = new FormData();
        formData.append("phoneNumber", phoneNumber);
        formData.append("cccdNumber", cccdNumber);
        formData.append("drivingLicenseNumber", drivingLicenseNumber);
        formData.append("latitude", pos.coords.latitude.toString());
        formData.append("longitude", pos.coords.longitude.toString());
        if (image) formData.append("file", image);

        try {
          const { data } = await axios.post(`${riderService}/api/rider/add`, formData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          });
          setProfile(data);
          toast.success("Đăng ký thành công, vui lòng chờ xác minh");
        } catch (err) {
          console.log(err);
          toast.error("Đăng ký thất bại, vui lòng thử lại");
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        toast.error("Không thể lấy vị trí, vui lòng bật định vị");
        setSubmitting(false);
      }
    );
  };

  if (user?.role !== "rider") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12181A] text-[#F4EFE6]">
        <p className="text-lg tracking-wide">Trang này chỉ dành cho tài xế.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#12181A]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#F2B134] border-t-transparent animate-spin" />
          <p className="text-[#F4EFE6]/60 text-sm tracking-widest uppercase">Đang tải hồ sơ</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#12181A] text-[#F4EFE6] px-6 py-12">
        <div className="max-w-md mx-auto">
          <p className="text-xs tracking-[0.3em] uppercase text-[#F2B134] mb-2">Hồ sơ tài xế</p>
          <h1 className="text-3xl font-semibold mb-1">Hoàn tất đăng ký</h1>
          <p className="text-[#F4EFE6]/60 mb-8 text-sm leading-relaxed">
            Điền thông tin bên dưới để bắt đầu nhận chuyến. Hồ sơ của bạn sẽ được xác minh trong
            vòng 24 giờ.
          </p>

          <div className="space-y-5">
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                Ảnh chân dung
              </span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1E2624] border border-[#F4EFE6]/10 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-[#F4EFE6]/30">+</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-[#F4EFE6]/60 file:mr-3 file:py-2 file:px-3 file:rounded-full file:border-0 file:bg-[#F2B134] file:text-[#12181A] file:text-xs file:font-medium file:cursor-pointer"
                />
              </div>
            </label>

            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                Số điện thoại
              </span>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09xx xxx xxx"
                className="w-full bg-[#1E2624] border border-[#F4EFE6]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2B134] focus:ring-1 focus:ring-[#F2B134] transition"
              />
            </label>

            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                Số CCCD
              </span>
              <input
                value={cccdNumber}
                onChange={(e) => setCccdNumber(e.target.value)}
                placeholder="001xxxxxxxxx"
                className="w-full bg-[#1E2624] border border-[#F4EFE6]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2B134] focus:ring-1 focus:ring-[#F2B134] transition"
              />
            </label>

            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[#F4EFE6]/50 mb-2">
                Số bằng lái xe
              </span>
              <input
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                placeholder="xxxxxxxxxx"
                className="w-full bg-[#1E2624] border border-[#F4EFE6]/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F2B134] focus:ring-1 focus:ring-[#F2B134] transition"
              />
            </label>

            <p className="text-xs text-[#F4EFE6]/40 leading-relaxed">
              Chúng tôi cần vị trí hiện tại của bạn để xác nhận khu vực hoạt động.
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#F2B134] text-[#12181A] font-semibold rounded-xl py-3 text-sm tracking-wide hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Gửi hồ sơ"}
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (!profile.isVerified) {
    return (
      <div className="min-h-screen bg-[#12181A] text-[#F4EFE6] flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 mx-auto mb-6 rounded-full border-2 border-[#F2B134] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#F2B134] animate-pulse" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Hồ sơ đang chờ xác minh</h1>
          <p className="text-[#F4EFE6]/60 text-sm leading-relaxed">
            Chúng tôi đang kiểm tra thông tin của bạn. Bạn sẽ có thể nhận chuyến ngay sau khi hồ sơ
            được duyệt.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#12181A] text-[#F4EFE6]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <img
              src={profile.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.userId}`}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border border-[#F4EFE6]/10"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#F2B134]">Tài xế</p>
              <p className="font-medium">{profile.phoneNumber}</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#4FD1C5]/10 text-[#4FD1C5] border border-[#4FD1C5]/30 tracking-wide">
            Đã xác minh
          </span>
        </div>

        {/* Signature element: beacon toggle, echoing a taxi rooftop light */}
        <div className="relative rounded-3xl border border-[#F4EFE6]/10 bg-[#1A211F] p-8 overflow-hidden">
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${
              profile.isAvailable ? "opacity-100" : "opacity-0"
            }`}
            style={{
              background: "radial-gradient(circle at 20% 20%, rgba(242,177,52,0.12), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col items-center text-center">
            <button
              onClick={toggleAvailablity}
              disabled={toggling}
              className="relative w-32 h-32 rounded-full flex items-center justify-center mb-6 transition disabled:opacity-60"
              style={{
                background: profile.isAvailable
                  ? "conic-gradient(from 0deg, #F2B134, #FFD98A, #F2B134)"
                  : "#1E2624",
                boxShadow: profile.isAvailable
                  ? "0 0 40px rgba(242,177,52,0.35)"
                  : "inset 0 0 0 2px rgba(244,239,230,0.1)",
              }}
            >
              <div className="w-24 h-24 rounded-full bg-[#12181A] flex items-center justify-center">
                {toggling ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[#F2B134] border-t-transparent animate-spin" />
                ) : (
                  <span className="text-sm font-semibold tracking-wide">
                    {profile.isAvailable ? "ONLINE" : "OFFLINE"}
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
              onClick={toggleAvailablity}
              disabled={toggling}
              className={`px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition disabled:opacity-50 ${
                profile.isAvailable
                  ? "bg-[#F4EFE6]/10 text-[#F4EFE6] hover:bg-[#F4EFE6]/15"
                  : "bg-[#F2B134] text-[#12181A] hover:brightness-95"
              }`}
            >
              {profile.isAvailable ? "Ngừng nhận chuyến" : "Bắt đầu nhận chuyến"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="rounded-2xl border border-[#F4EFE6]/10 bg-[#1A211F] p-5">
            <p className="text-xs uppercase tracking-wider text-[#F4EFE6]/40 mb-2">CCCD</p>
            <p className="text-sm font-medium">{profile.cccdNumber}</p>
          </div>
          <div className="rounded-2xl border border-[#F4EFE6]/10 bg-[#1A211F] p-5">
            <p className="text-xs uppercase tracking-wider text-[#F4EFE6]/40 mb-2">Bằng lái xe</p>
            <p className="text-sm font-medium">{profile.drivingLicenseNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDashBoard;