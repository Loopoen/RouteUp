import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../type";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/faaah.mp3"
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "../components/OrderCard";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
]

const RestaurantOrder = ({restaurantId}:{restaurantId:string}) => {

  const [order, setOrder] = useState<IOrder[]>([])
  const [loading, setLoading] = useState(true)

  const [audioUnlock, setAudioUnlock] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true) 

  const {socket} = useSocket()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(()=>{
    audioRef.current = new Audio(audio)
    audioRef.current.load()
  },[])

  const unlockAudio = ()=>{
    if(audioRef.current){
      audioRef.current.play().then(()=>{
        audioRef.current!.pause()
        audioRef.current!.currentTime = 0
        setAudioUnlock(true)
      }).catch((err)=>{
        console.log("err audio", err)
      })
    }
  }

  // NEW: toggle bật/tắt âm thanh
  const toggleSound = () => {
    if (!audioUnlock) {
      unlockAudio()
      setSoundEnabled(true)
      return
    }
    setSoundEnabled((prev) => !prev)
  }

  const fetchOrders = async()=>{
    try{
      const {data} = await axios.get(`${restaurantService}/api/order/${restaurantId}`,{
        headers:{
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })

      setOrder(data.orders)

      console.log("data o", data)
    }
    catch(err){
      console.log(err)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchOrders()
  },[])

  useEffect(()=>{
    if(!socket) return 

    const onNewOrder = ()=>{
      if(audioUnlock && soundEnabled && audioRef.current){ // check thêm soundEnabled
        audioRef.current.currentTime = 0
        audioRef.current.play().catch((err)=>{
          console.error(err)
        })
      }

      fetchOrders()
    }
    socket.on("order:new", onNewOrder)

    return ()=>{
      socket.off("order:new", onNewOrder) 
    }
  }, [socket, audioUnlock, soundEnabled])

  useEffect(()=>{
    if(!socket){
      return
    }

    const onUpdateOrder = () =>{
      fetchOrders()
    }

    socket.on("order:rider_assigned", onUpdateOrder)
    return()=>{
      socket.off("order:rider_assigned", onUpdateOrder)
    }

  },[socket])

  const activeOrder = order.filter((o)=>{
    return ACTIVE_STATUSES.includes(o.status)
  })

  const completeOrders = order.filter(
    (o)=>{
      return ACTIVE_STATUSES.includes(o.status)
    }
  )

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Đơn hàng nhà hàng</h2>
            <p className="text-sm text-gray-500">
              {activeOrder.length} đơn đang xử lý · {completeOrders.length} đơn hoàn tất
            </p>
          </div>

          {/* Nút toggle âm thanh */}
          <button
            onClick={toggleSound}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
              audioUnlock && soundEnabled
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {audioUnlock && soundEnabled ? "🔔 Âm thanh: Bật" : "🔕 Âm thanh: Tắt"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cột đang xử lý */}
          <section className="lg:col-span-2">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Đang xử lý
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
                  </div>
                ))
              ) : activeOrder.length === 0 ? (
                <p className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                  Chưa có đơn hàng nào đang xử lý
                </p>
              ) : (
                activeOrder.map((order) => (
                  <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
                ))
              )}
            </div>
          </section>

          {/* Cột hoàn thành */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Đã hoàn thành
            </h3>
            <div className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                  </div>
                ))
              ) : completeOrders.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                  Chưa có đơn hoàn thành
                </p>
              ) : (
                completeOrders.map((order) => (
                  <OrderCard key={order._id} order={order} onStatusUpdate={fetchOrders} />
                ))
              )}
            </div>
          </section>

          

        </div>
      </div>
    </div>
  );
};

export default (RestaurantOrder);