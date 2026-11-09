"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { initPortalSocket } from "@/lib/socket";
import OrderCard, { Order } from "@/components/kds/OrderCard";
import { playNewOrderSound } from "@/lib/audioAlert";
import { KITCHEN_STATUSES } from "@/lib/orderStatus";
import { RefreshCw, Volume2, VolumeX, X } from "lucide-react";
import { Socket } from "socket.io-client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// An online order that has not been paid yet must not reach the kitchen.
const awaitingOnlinePayment = (o: Order) => {
  const payment = (o as any).payments?.[0];
  return payment?.method === "ONLINE" && payment?.status !== "COMPLETED";
};

const isKitchenOrder = (o: Order) =>
  KITCHEN_STATUSES.includes((o as any).status) && !awaitingOnlinePayment(o);

function KDSContent() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const prevOrdersCountRef = useRef(0);

  // Messages disappear on their own after a few seconds
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  // 1. Fetch the orders the kitchen still has to deal with
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/orders");
      // The kitchen only needs orders that are not yet served, paid, completed or cancelled.
      setOrders(response.data.filter(isKitchenOrder));
    } catch (err) {
      console.error("Failed to load kitchen orders:", err);
      setNotice("Couldn't load orders. Check your connection and press Refresh.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // 2. Play sound on new incoming orders
  useEffect(() => {
    if (soundEnabled && orders.length > prevOrdersCountRef.current && prevOrdersCountRef.current !== 0) {
      playNewOrderSound();
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, soundEnabled]);

  useEffect(() => {
    fetchOrders();

    // 3. Live updates
    const socket: Socket = initPortalSocket(token || undefined);

    if (user?.restaurantId) {
      socket.emit("join:restaurant", user.restaurantId);
    }

    // A new order arrives from the customer app
    socket.on("order:created", (newOrder: Order) => {
      setOrders((prev) => (prev.some((o) => o.id === newOrder.id) ? prev : [newOrder, ...prev]));
    });

    // The server sends the whole updated order whenever its status or payment changes
    socket.on("order:updated", (updated: Order) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === updated.id);
        if (!isKitchenOrder(updated)) return prev.filter((o) => o.id !== updated.id);
        return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [updated, ...prev];
      });
    });

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
      socket.disconnect();
    };
  }, [user, token, fetchOrders]);

  // 4. Update order status
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    // Show the change straight away, and undo it if the server refuses.
    setOrders((prev) =>
      KITCHEN_STATUSES.includes(nextStatus)
        ? prev.map((o) => (o.id === orderId ? ({ ...o, status: nextStatus } as any) : o))
        : prev.filter((o) => o.id !== orderId)
    );

    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
    } catch (err: any) {
      // Expected refusals (e.g. the order was already paid) are shown to the user, not logged as crashes.
      setNotice(err?.response?.data?.message || "Couldn't update the order. Please try again.");
      fetchOrders(true); // put the screen back in line with the database
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) playNewOrderSound();
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">Kitchen Display System</h1>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
            {orders.length} Active Orders
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              soundEnabled
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30"
                : "bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
            }`}
            title={soundEnabled ? "Mute New Order Alerts" : "Enable New Order Alerts"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            {soundEnabled ? "Audio On" : "Enable Audio"}
          </button>

          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {notice && (
        <div role="alert" className="mx-6 mt-4 flex items-start justify-between gap-3 p-3 text-sm text-amber-200 bg-amber-950/40 border border-amber-800/60 rounded-xl">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss" className="text-amber-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="p-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm">Loading Active Tickets...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 bg-slate-800/40 border border-dashed border-slate-700/80 rounded-2xl text-slate-400">
            <Volume2 className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-lg font-semibold text-slate-300">Kitchen is Clear!</p>
            <p className="text-sm text-slate-500 mt-1">
              New orders placed on the QR PWA will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function KDSPage() {
  return (
    <ProtectedRoute allowedRoles={["COOK", "MANAGER", "ADMIN"]}>
      <KDSContent />
    </ProtectedRoute>
  );
}