import { useEffect, useMemo, useRef, useState } from "react";
import type { IOrder } from "../type";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import { restaurantService } from "../main";



const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
] as const;

type Status = (typeof ACTIVE_STATUSES)[number];

const STATUS_CONFIG: Record<
  Status,
  { label: string; accent: string; soft: string; text: string }
> = {
  placed: { label: "Placed", accent: "#5B8DEF", soft: "rgba(91,141,239,0.14)", text: "#8FB0F5" },
  accepted: { label: "Accepted", accent: "#8B5CF6", soft: "rgba(139,92,246,0.14)", text: "#B7A3F8" },
  preparing: { label: "Preparing", accent: "#F5A623", soft: "rgba(245,166,35,0.16)", text: "#F7C365" },
  ready_for_rider: { label: "Ready for rider", accent: "#10B981", soft: "rgba(16,185,129,0.15)", text: "#5FD8AC" },
  rider_assigned: { label: "Rider assigned", accent: "#06B6D4", soft: "rgba(6,182,212,0.15)", text: "#5FD3E8" },
  picked_up: { label: "Picked up", accent: "#8B93A1", soft: "rgba(139,147,161,0.14)", text: "#AEB4C0" },
};

const STATUS_ORDER: Record<Status, number> = ACTIVE_STATUSES.reduce(
  (acc, s, i) => ({ ...acc, [s]: i }),
  {} as Record<Status, number>
);

function formatElapsed(createdAt: string, now: number): { text: string; minutes: number } {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return { text: "—", minutes: 0 };
  const diffMs = Math.max(0, now - created);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return { text: "just now", minutes };
  if (minutes < 60) return { text: `${minutes}m`, minutes };
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return { text: `${hrs}h ${mins}m`, minutes };
}

function urgencyColor(minutes: number, status: Status): string {
  // picked_up orders are done, never flagged urgent
  if (status === "picked_up") return "#8B93A1";
  if (minutes >= 20) return "#F45B69"; // late — red
  if (minutes >= 10) return "#F5A623"; // getting there — amber
  return "#8B93A1"; // fresh — neutral
}

const Order = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [connected, setConnected] = useState(false);

  const navigate = useNavigate();
  const { socket } = useSocket();
  const railRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${restaurantService}/api/order/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("data order", data)
      setOrders(data.order);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    if (!socket) return;

    setConnected(socket.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("order:update", onOrderUpdate);
      socket.on("order:rider_assigned", onOrderUpdate)

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate)
    };
  }, [socket]);


  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const columns = useMemo(() => {
    const grouped: Record<Status, IOrder[]> = ACTIVE_STATUSES.reduce(
      (acc, s) => ({ ...acc, [s]: [] }),
      {} as Record<Status, IOrder[]>
    );
    for (const o of orders) {
      const s = (o as any).status as Status; // ⟵ field
      if (grouped[s]) grouped[s].push(o);
    }
    for (const s of ACTIVE_STATUSES) {
      grouped[s].sort(
        (a, b) =>
          new Date((a as any).createdAt).getTime() - // ⟵ field
          new Date((b as any).createdAt).getTime()
      );
    }
    return grouped;
  }, [orders]);

  

  const totalActive = orders.length;

  return (
    <div className="ord-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .ord-root {
          --bg: #14171C;
          --panel: #1B1F26;
          --card: #1E232B;
          --hairline: #2A2F38;
          --text: #F4F5F7;
          --text-dim: #8B93A1;
          --text-faint: #5B6270;
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding: 28px clamp(16px, 3vw, 40px) 60px;
          box-sizing: border-box;
        }
        .ord-root * { box-sizing: border-box; }

        .ord-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--hairline);
        }
        .ord-title-row { display: flex; align-items: center; gap: 12px; }
        .ord-title {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .ord-count-pill {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-dim);
          background: var(--panel);
          border: 1px solid var(--hairline);
          border-radius: 20px;
          padding: 4px 10px;
        }
        .ord-live {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--text-dim);
        }
        .ord-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--dot-color, #5B6270);
          box-shadow: 0 0 0 0 var(--dot-color, transparent);
        }
        .ord-live-dot.on {
          animation: pulse 1.8s ease-out infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
          70% { box-shadow: 0 0 0 7px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }

        .ord-board {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(268px, 1fr);
          gap: 16px;
          overflow-x: auto;
          padding-bottom: 8px;
        }
        @media (max-width: 900px) {
          .ord-board { grid-auto-columns: 82vw; }
        }

        .ord-col-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px 12px;
        }
        .ord-col-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .ord-col-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ord-col-count {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--text-dim);
          background: var(--panel);
          border-radius: 10px;
          padding: 2px 8px;
        }

        .ord-lane {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 80px;
        }

        .ord-empty-lane {
          border: 1px dashed var(--hairline);
          border-radius: 10px;
          padding: 18px 10px;
          text-align: center;
          font-size: 12px;
          color: var(--text-faint);
        }

        .ord-ticket {
          position: relative;
          background: var(--card);
          border: 1px solid var(--hairline);
          border-radius: 4px 4px 10px 10px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
          overflow: hidden;
        }
        .ord-ticket:hover {
          transform: translateY(-2px);
          border-color: var(--accent, var(--hairline));
        }
        .ord-ticket:focus-visible {
          outline: 2px solid var(--accent, #5B8DEF);
          outline-offset: 2px;
        }
        .ord-ticket::before {
          content: "";
          display: block;
          height: 3px;
          background: var(--accent, var(--hairline));
        }
        /* torn-ticket perforation edge */
        .ord-ticket::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 6px;
          background:
            radial-gradient(circle at 6px 0, transparent 3px, var(--card) 3.5px) repeat-x;
          background-size: 12px 6px;
        }

        .ord-ticket-body { padding: 12px 14px 14px; }

        .ord-ticket-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .ord-num {
          font-family: 'IBM Plex Mono', monospace;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
        }
        .ord-elapsed {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--elapsed-color, var(--text-dim));
        }

        .ord-items {
          list-style: none;
          margin: 0 0 10px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .ord-items li {
          font-size: 12.5px;
          color: var(--text-dim);
          display: flex;
          gap: 6px;
        }
        .ord-items li .qty {
          color: var(--text-faint);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          flex-shrink: 0;
        }
        .ord-items-more { font-size: 11px; color: var(--text-faint); }

        .ord-ticket-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--hairline);
          padding-top: 8px;
          margin-top: 4px;
        }
        .ord-customer {
          font-size: 11.5px;
          color: var(--text-faint);
          max-width: 60%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ord-total {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
        }

        .ord-skeleton {
          height: 118px;
          border-radius: 10px;
          background: linear-gradient(90deg, var(--card) 0%, var(--panel) 50%, var(--card) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border: 1px solid var(--hairline);
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .ord-global-empty {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-dim);
        }
        .ord-global-empty h3 {
          font-family: 'IBM Plex Mono', monospace;
          color: var(--text);
          font-size: 16px;
          margin: 0 0 6px;
        }
        .ord-global-empty p { font-size: 13px; margin: 0; }

        @media (prefers-reduced-motion: reduce) {
          .ord-ticket, .ord-live-dot.on, .ord-skeleton { animation: none !important; transition: none !important; }
        }
      `}</style>

      <div className="ord-header">
        <div className="ord-title-row">
          <h2 className="ord-title">Orders</h2>
          <span className="ord-count-pill">{totalActive} active</span>
        </div>
        <div className="ord-live" style={{ ["--dot-color" as any]: connected ? "#10B981" : "#5B6270" }}>
          <span className={`ord-live-dot ${connected ? "on" : ""}`} />
          {connected ? "Live" : "Reconnecting…"}
        </div>
      </div>

      {loading ? (
        <div className="ord-board">
          {ACTIVE_STATUSES.map((s) => (
            <div key={s}>
              <div className="ord-col-head">
                <span className="ord-col-label">
                  <span className="ord-col-dot" style={{ background: STATUS_CONFIG[s].accent }} />
                  {STATUS_CONFIG[s].label}
                </span>
              </div>
              <div className="ord-lane">
                <div className="ord-skeleton" />
                <div className="ord-skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : totalActive === 0 ? (
        <div className="ord-global-empty">
          <h3>No active orders</h3>
          <p>New orders will land here the moment they come in.</p>
        </div>
      ) : (
        <div className="ord-board">
          {ACTIVE_STATUSES.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const lane = columns[status];
            return (
              <div key={status}>
                <div className="ord-col-head">
                  <span className="ord-col-label">
                    <span className="ord-col-dot" style={{ background: cfg.accent }} />
                    {cfg.label}
                  </span>
                  <span className="ord-col-count">{lane.length}</span>
                </div>
                <div
                  className="ord-lane"
                  ref={(el) => (railRefs.current[status] = el)}
                >
                  {lane.length === 0 ? (
                    <div className="ord-empty-lane">No tickets</div>
                  ) : (
                    lane.map((order) => {
                      const id = (order as any)._id ?? (order as any).id; // ⟵ field
                      const orderNumber = (order as any).orderNumber ?? id?.slice?.(-6) ?? "—"; // ⟵ field
                      const createdAt = (order as any).createdAt; // ⟵ field
                      const items: { name: string; quantity: number }[] = (order as any).items ?? []; // ⟵ field
                      const customerName = (order as any).customerName; // ⟵ field
                      const total = (order as any).total; // ⟵ field
                      const elapsed = formatElapsed(createdAt, now);
                      const uColor = urgencyColor(elapsed.minutes, status);
                      const visibleItems = items.slice(0, 3);
                      const extra = items.length - visibleItems.length;

                      return (
                        <div
                          key={id}
                          className="ord-ticket"
                          role="button"
                          tabIndex={0}
                          style={{ ["--accent" as any]: cfg.accent }}
                          onClick={() => navigate(`/orders/${id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") navigate(`/orders/${id}`);
                          }}
                        >
                          <div className="ord-ticket-body">
                            <div className="ord-ticket-top">
                              <span className="ord-num">#{orderNumber}</span>
                              <span className="ord-elapsed" style={{ ["--elapsed-color" as any]: uColor }}>
                                {elapsed.text}
                              </span>
                            </div>

                            <ul className="ord-items">
                              {visibleItems.map((it, idx) => (
                                <li key={idx}>
                                  <span className="qty">{it.quantity}×</span>
                                  {it.name}
                                </li>
                              ))}
                              {extra > 0 && <li className="ord-items-more">+{extra} more</li>}
                            </ul>

                            <div className="ord-ticket-foot">
                              <span className="ord-customer">{customerName ?? "Walk-in"}</span>
                              {typeof total === "number" && (
                                <span className="ord-total">
                                  {total.toLocaleString("vi-VN")}₫
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Order;