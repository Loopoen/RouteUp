import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash } from "react-icons/bi";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: string;
  latitude?: number;
  longitude?: number;
}


const LocationPicker = ({
  setLocation,  
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};


const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {    
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { animate: true });
        onLocate(latitude, longitude);
      },
      () => {
        toast.error("Location permission denied");
      }
    );
  };

  return (
    <button
      type="button"
      onClick={locateUser}
      className="absolute right-3 top-3 z-[1000] flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-medium shadow-md transition hover:bg-gray-100"
    >
      <LuLocateFixed size={16} />
      Use current location
    </button>
  );
};

const AddAddressPage = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);


  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const defaultCenter: [number, number] = [10.7769, 106.7009];

  const selectedPosition: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await res.json();
      setFormattedAddress(data?.display_name || "");
    } catch {
      toast.error("Failed to fetch address");
    }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  // ===============================
  // Fetch all saved addresses
  // ===============================
  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/address/all`,
        authHeaders
      );

      setAddresses(data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);


  const addAddress = async () => {
    if (!mobile.trim()) {
      toast.error("Please enter mobile number");
      return;
    }

    if (!formattedAddress.trim() || latitude === null || longitude === null) {
      toast.error("Please select a location on the map");
      return;
    }

    try {
      setAdding(true);

      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          mobile,
          latitude,
          longitude,
        },
        authHeaders
      );

      toast.success("Address added successfully");

      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);

      await fetchAddresses();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add address");
    } finally {
      setAdding(false);
    }
  };

  // ===============================
  // Delete address
  // ===============================
  const deleteAddress = async (id: string) => {
    const ok = window.confirm("Delete this address?");
    if (!ok) return;

    try {
      setDeletingId(id);

      await axios.delete(`${restaurantService}/api/address/${id}`, authHeaders);

      toast.success("Address deleted");
      await fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT: MAP + FORM */}
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Select Delivery Address
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Click on the map or use your current location to save an address.
            </p>
          </div>

          {/* MAP */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-[420px] w-full">
              <MapContainer
                center={selectedPosition || defaultCenter}
                zoom={13}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <LocationPicker setLocation={setLocation} />
                <LocateMeButton onLocate={setLocation} />

                {selectedPosition && <Marker position={selectedPosition} />}
              </MapContainer>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 p-4">
              <div className="text-sm font-medium text-gray-700">
                Selected address
              </div>

              {formattedAddress ? (
                <p className="mt-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-gray-700">
                  📍 {formattedAddress}
                </p>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No location selected yet.
                </p>
              )}
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Save new address
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Mobile number
                </label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#E23744]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={formattedAddress}
                  onChange={(e) => setFormattedAddress(e.target.value)}
                  placeholder="Select on map or edit address manually"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#E23744]"
                />
              </div>

              <button
                type="button"
                disabled={adding}
                onClick={addAddress}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E23744] px-4 py-3 font-medium text-white transition hover:bg-[#d32f3a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {adding ? (
                  <>
                    <BiLoader className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : (
                  <>
                    <BiPlus size={18} />
                    Save Address
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SAVED ADDRESSES */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Saved Addresses
            </h2>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {addresses.length} item{addresses.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <BiLoader className="mr-2 animate-spin" size={18} />
              Loading addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
              No addresses saved yet
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-4 transition hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-3 text-sm font-medium text-gray-800">
                      {addr.formattedAddress}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      📞 {addr.mobile}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteAddress(addr._id)}
                    disabled={deletingId === addr._id}
                    className="rounded-xl p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Delete address"
                  >
                    {deletingId === addr._id ? (
                      <BiLoader size={18} className="animate-spin" />
                    ) : (
                      <BiTrash size={18} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAddressPage;