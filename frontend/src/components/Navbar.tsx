import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const { isAuth, city, loadingLocation,  } = useAppData();

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  return (
    <>
   
      <header
        className="
          sticky
          top-0
          z-50
          backdrop-blur-md
          bg-white/80
          border-b
          border-gray-100
          shadow-sm
        "
      >
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex h-20 items-center justify-between">
         
            <Link
              to="/"
              className="group flex items-center gap-3"
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-r
                  from-[#E23744]
                  to-pink-500
                  text-xl
                  shadow-lg
                  transition-all
                  duration-300
                  group-hover:rotate-6
                  group-hover:scale-110
                "
              >
               <svg width="250" height="250" viewBox="0 0 200 200">
    <path d="M100 20
             L40 80
             L60 170
             L100 140
             L140 170
             L160 80 Z"
          fill="#ff6b35"/>

    <path d="M100 140
             L70 100
             L130 100 Z"
          fill="white"/>

    <circle cx="80" cy="90" r="5" fill="#222"/>
    <circle cx="120" cy="90" r="5" fill="#222"/>
</svg>
              </div>

              <div>
                <h1
                  className="
                    text-2xl
                    font-extrabold
                    bg-gradient-to-r
                    from-[#E23744]
                    to-pink-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  RouteUp
                </h1>

                <p className="text-xs text-gray-400">
                  Fast Delivery
                </p>
              </div>
            </Link>

            {/* RIGHT */}
            <div className="flex items-center gap-5">
              {/* CART */}
              <Link
                to="/cart"
                className="
                  relative
                  rounded-xl
                  p-3
                  transition-all
                  duration-300
                  hover:bg-red-50
                  hover:scale-110
                "
              >
                <CgShoppingCart
                  className="h-7 w-7 text-[#E23744]"
                />

                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E23744]
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  0
                </span>

                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    h-5
                    w-5
                    animate-ping
                    rounded-full
                    bg-red-400
                    opacity-50
                  "
                />
              </Link>

              {!isAuth ? (
                <Link
                  to="/login"
                  className="
                    rounded-xl
                    bg-gradient-to-r
                    from-[#E23744]
                    to-pink-500
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-red-300
                  "
                >
                  Login
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="
                    rounded-xl
                    px-4
                    py-2
                    font-medium
                    text-gray-700
                    transition-all
                    duration-300
                    hover:bg-red-50
                    hover:text-[#E23744]
                  "
                >
                  My Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH SECTION */}
      {isHomePage && (
        <section
          className="
            bg-gradient-to-b
            from-red-50
            via-white
            to-white
            py-8
          "
        >
          <div className="mx-auto max-w-5xl px-4">
            <div
              className="
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-xl
                ring-1
                ring-gray-100
                transition-all
                duration-300
                hover:shadow-2xl
              "
            >
              <div className="flex flex-col md:flex-row">
             
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    border-b
                    md:border-b-0
                    md:border-r
                    px-5
                    py-4
                    text-gray-700
                  "
                >
                  <BiMapPin
                    className="
                      h-5
                      w-5
                      text-[#E23744]
                    "
                  />

                  <span className="font-medium">
                    {city}
                  </span>
                </div>

                {/* SEARCH */}
                <div
                  className="
                    flex
                    flex-1
                    items-center
                    px-4
                  "
                >
                  <BiSearch
                    className="
                      mr-3
                      h-5
                      w-5
                      text-gray-400
                    "
                  />

                  <input
                    type="text"
                    placeholder="Search restaurants, foods, drinks..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="
                      w-full
                      py-4
                      text-sm
                      outline-none
                      placeholder:text-gray-400
                    "
                  />
                </div>

        
                <button
                  className="
                    bg-gradient-to-r
                    from-[#E23744]
                    to-pink-500
                    px-8
                    py-4
                    font-medium
                    text-white
                    transition-all
                    duration-300
                    hover:brightness-110
                  "
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {[
                "Pizza",
                "Burger",
                "Coffee",
                "Milk Tea",
                "Chicken",
                "Dessert",
              ].map((item) => (
                <button
                  key={item}
                  className="
                    rounded-full
                    bg-white
                    px-4
                    py-2
                    text-sm
                    shadow
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#E23744]
                    hover:text-white
                  "
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Navbar;