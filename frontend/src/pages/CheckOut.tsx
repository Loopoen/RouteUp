import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";

import { useAppData } from "../context/AppContext";
import { restaurantService, utilsService } from "../main";
import type { IMenuItem, IRestaurant } from "../type";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

const CheckOut = () => {
  const navigate = useNavigate();

  const { cart, subTotal, quantity } = useAppData();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
      return;
    }

    const fetchAddress = async () => {
      try {
        setLoadingAddress(true);

        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

      

        setAddresses(data || []);
      } catch (err) {
        console.log(err);
        toast.error("Cannot load addresses");
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [cart, navigate]);

  if (cart.length === 0) return null;

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "stripe") => {
    if (!selectedAddressId) return null;

    try {
      setCreatingOrder(true);

      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
          distance:10000
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch (err) {
      console.log(err);
      toast.error("Failed to create order");
      return null;
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithStripe = async  () => {
    try {
      setLoadingStripe(true);

      const order = await createOrder("stripe");

console.log("order",order);

      if (!order) return;

      await stripePromise;

      const { data } = await axios.post(
        `${utilsService}/api/payment/stripe/create`,
        {
          orderId: order.orderId,
        }
      );

        console.log("datacheckout", data)

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Unable to create Stripe checkout session");
      }
    } catch (err) {
      console.log(err);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-20 h-20 rounded-xl object-cover"
              />

              <div>
                <h2 className="text-2xl font-bold">
                  {restaurant.name}
                </h2>

                <p className="text-gray-500">
                  {restaurant.autoLocation.formattedAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-xl mb-5">
              Delivery Address
            </h3>

            {loadingAddress ? (
              <p>Loading...</p>
            ) : addresses.length === 0 ? (
              <p className="text-gray-500">
                No address found.
              </p>
            ) : (
              <div className="space-y-4">
                {addresses.map((item) => (
                  <div
                    key={item._id}
                    onClick={() =>
                      setSelectedAddressId(item._id)
                    }
                    className={`border rounded-xl p-4 cursor-pointer transition ${
                      selectedAddressId === item._id
                        ? "border-green-500 bg-green-50"
                        : "hover:border-green-400"
                    }`}
                  >
                    <p className="font-medium">
                      {item.formattedAddress}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.mobile}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-xl mb-5">
              Order Items
            </h3>

            <div className="space-y-5">
             {cart.map((cartItem) => {
    const menuItem = cartItem.itemId as IMenuItem;

    return (
        <div
            key={menuItem._id}
            className="flex justify-between items-center"
        >
            <div className="flex gap-4">
                <img
                    src={menuItem.image}
                    className="w-20 h-20 rounded-xl object-cover"
                />

                <div>
                    <h4 className="font-semibold">
                        {menuItem.name}
                    </h4>

                    <p className="text-gray-500">
                        Qty: {cartItem.quantity}
                    </p>
                </div>
            </div>

            <span className="font-semibold">
                $
                {(menuItem.price * cartItem.quantity).toFixed(2)}
            </span>
        </div>
    );
})}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
            <h3 className="font-bold text-xl mb-6">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{quantity}</span>
              </div>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>

              <hr />

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={
                loadingStripe ||
                creatingOrder ||
                !selectedAddressId
              }
              onClick={payWithStripe}
              className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold disabled:opacity-60"
            >
              {loadingStripe
                ? "Redirecting..."
                : "Pay with Stripe"}
            </button>

            {!selectedAddressId && (
              <p className="text-sm text-red-500 mt-3">
                Please select a delivery address.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOut;