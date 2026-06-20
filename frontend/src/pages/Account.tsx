import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMap, BiPackage } from "react-icons/bi";

const Account = () => {
    const { user, setUser, setIsAuth } = useAppData();

    console.log("ser", user)
    const navigate = useNavigate();

    const firstLetter = user?.name?.charAt(0).toUpperCase();

    const logoutHandler = () => {
        localStorage.removeItem("token");

        setUser(null);
        setIsAuth(false);

        toast.success("Đăng xuất thành công");

        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white px-4 py-8">
            <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">

                <div className="relative overflow-hidden bg-gradient-to-r from-[#E23744] via-red-500 to-pink-500 p-8">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

                    <div className="relative flex items-center gap-4">
                        <div className="overflow-hidden rounded-2xl ring-4 ring-white/30 shadow-xl">
                            {user?.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="h-20 w-20 object-cover transition duration-300 hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center bg-white text-3xl font-bold text-[#E23744]">
                                    {firstLetter}
                                </div>
                            )}
                        </div>

                        <div className="text-white">
                            <h2 className="text-xl font-bold tracking-wide">
                                {user?.name}
                            </h2>

                            <p className="mt-1 text-sm text-red-100">
                                {user?.email}
                            </p>

                            <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                                Food Lover 🍔
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-3">
                    <button
                        onClick={() => navigate("/orders")}
                        className="group flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:bg-red-50 hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-red-100 p-3 transition-all duration-300 group-hover:scale-110">
                                <BiPackage className="h-5 w-5 text-[#E23744]" />
                            </div>

                            <span className="font-medium text-gray-700">
                                Đơn hàng của tôi
                            </span>
                        </div>

                        <span className="text-gray-400 transition-all duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </button>

                    <button
                        onClick={() => navigate("/addresses")}
                        className="group flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:bg-red-50 hover:shadow-md"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-red-100 p-3 transition-all duration-300 group-hover:scale-110">
                                <BiMap className="h-5 w-5 text-[#E23744]" />
                            </div>

                            <span className="font-medium text-gray-700">
                                Địa chỉ giao hàng
                            </span>
                        </div>

                        <span className="text-gray-400 transition-all duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </button>

                    <button
                        onClick={logoutHandler}
                        className="group mt-2 flex w-full items-center justify-between rounded-2xl p-4 transition-all duration-300 hover:bg-red-500 hover:text-white"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-red-100 p-3 transition-all duration-300 group-hover:bg-white/20">
                                <BiLogOut className="h-5 w-5" />
                            </div>

                            <span className="font-semibold">
                                Đăng xuất
                            </span>
                        </div>

                        <span className="transition-all duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Account;