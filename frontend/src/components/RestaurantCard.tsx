import { Link } from "react-router-dom";
import { FaLocationDot, FaCircle } from "react-icons/fa6";

type Props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({
  id,
  image,
  name,
  distance,
  isOpen,
}: Props) => {
  return (
    <Link
      to={`/restaurant/${id}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Status */}
        <div
          className={`absolute left-4 top-4 flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-white backdrop-blur-md ${
            isOpen
              ? "bg-green-500/90"
              : "bg-red-500/90"
          }`}
        >
          <FaCircle className="text-[8px]" />
          {isOpen ? "Open Now" : "Closed"}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        <div>
          <h2 className="truncate text-xl font-bold text-gray-800 transition-colors group-hover:text-orange-500">
            {name}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-gray-500">
            <FaLocationDot className="text-orange-500" />
            <span>{distance} away</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <button className="rounded-xl bg-orange-500 px-5 py-2 font-semibold text-white transition hover:bg-orange-600 active:scale-95">
            View Menu
          </button>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            Restaurant
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;