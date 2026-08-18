import type { IOrder } from "../type";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { MapPin, Package, Bike, Navigation } from "lucide-react";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

interface Props {
  order: IOrder;
}

interface RoutingProps {
  from: [number, number];
  to: [number, number];
}

const riderIcon = new L.DivIcon({
  html: `
    <div style="
      font-size: 28px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    ">
      🏍️
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: "",
});

const deliveryIcon = new L.DivIcon({
  html: `
    <div style="
      font-size: 28px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    ">
      📦
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: "",
});

const Routing = ({ from, to }: RoutingProps) => {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1]),
      ],

      lineOptions: {
        styles: [
          {
            color: "#E23744",
            weight: 5,
            opacity: 0.8,
          },
        ],
      },

      addWaypoints: false,
      draggableWaypoints: false,

      createMarker: (index: number, waypoint: any) => {
        if (index === 0) {
          return L.marker(waypoint.latLng, {
            icon: riderIcon,
          });
        }

        return L.marker(waypoint.latLng, {
          icon: deliveryIcon,
        });
      },

      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [from, to, map]);

  return null;
};

const RiderOrderMap = ({ order }: Props) => {
  /*
   * Đổi những field này theo IOrder thật của bạn
   */
  const riderLat = 10.7769;
  const riderLng = 106.7009;

  const deliveryLat = order.deliveryAddress.latitude;
  const deliveryLng = order.deliveryAddress.longitude;

  const riderPosition: [number, number] = [
    riderLat,
    riderLng,
  ];

  const deliveryPosition: [number, number] = [
    deliveryLat,
    deliveryLng,
  ];

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery Route
          </h2>

          <p className="text-sm text-gray-500">
            Theo dõi lộ trình giao hàng
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Đang giao
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[450px] w-full">
        <MapContainer
          center={riderPosition}
          zoom={14}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Routing
            from={riderPosition}
            to={deliveryPosition}
          />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              🚲
            </div>

            <span className="text-sm text-gray-700">
              Rider
            </span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
              📦
            </div>

            <span className="text-sm text-gray-700">
              Điểm giao hàng
            </span>
          </div>
        </div>

        {/* Navigation button */}
        <button
          className="
            absolute
            right-4
            bottom-4
            z-[1000]
            flex
            items-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-3
            text-sm
            font-medium
            text-gray-700
            shadow-lg
            transition
            hover:bg-gray-50
          "
        >
          <Navigation size={17} />

          Điều hướng
        </button>
      </div>

      {/* Order information */}
      <div className="grid grid-cols-1 gap-4 border-t p-5 md:grid-cols-2">
        {/* Rider */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Bike
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Rider
            </p>

            <p className="font-medium text-gray-900">
              {order.riderName || "Rider"}
            </p>

            <p className="text-sm text-gray-500">
              {order.riderPhone || "Chưa có số điện thoại"}
            </p>
          </div>
        </div>

        {/* Delivery */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <Package
              size={20}
              className="text-red-600"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Địa chỉ giao hàng
            </p>

            <p className="font-medium text-gray-900">
              {order.deliveryAddress?.address ||
                "Địa chỉ giao hàng"}
            </p>
          </div>
        </div>
      </div>

      {/* Distance */}
      <div className="border-t bg-gray-50 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={17} />

          <span>
            Khoảng cách:{" "}
            <strong className="text-gray-900">
              {order.distance
                ? `${(order.distance / 1000).toFixed(1)} km`
                : "Đang tính..."}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RiderOrderMap;