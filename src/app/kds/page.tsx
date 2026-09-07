"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { initPortalSocket } from "@/lib/socket";
import OrderCard, { Order } from "@/components/kds/OrderCard";
import { playNewOrderSound } from "@/lib/audioAlert";
import { RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Socket } from "socket.io-client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function KDSContent() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevOrdersCountRef = useRef(0);

  // 1. Fetch Active Kitchen Orders
const fetchOrders = async () => {
  try {
    setLoading(true);
    const response = await api.get("/orders");
    // Filter out SERVED and PAID orders from active KDS board
    const activeOrders = response.data.filter(
      (o: Order) => o.status !== "SERVED" && o.status !== "PAID"
    );
    setOrders(activeOrders);
  } catch (err) {
    console.error("Failed to load kitchen orders:", err);
  } finally {
    setLoading(false);
  }
};

  // 2. Play Sound Alert on New Incoming Orders
  useEffect(() => {
    if (
      soundEnabled &&
      orders.length > prevOrdersCountRef.current &&
      prevOrdersCountRef.current !== 0
    ) {
      playNewOrderSound();
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, soundEnabled]);

  useEffect(() => {
    fetchOrders();

    // 3. Connect Socket.IO for Live Updates
    const socket: Socket = initPortalSocket(token || undefined);

    if (user?.restaurantId) {
      socket.emit("join:restaurant", user.restaurantId);
    }

    // New order arrives from Flutter Customer PWA
    socket.on("order:created", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    socket.on(
  "order:status_updated",
  ({ orderId, status }: { orderId: string; status: any }) => {
    if (status === "SERVED" || status === "PAID") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  }
);

    return () => {
      socket.off("order:created");
      socket.off("order:status_updated");
      socket.disconnect();
    };
  }, [user, token]);

  // 4. Update Order Status Handler
const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
  try {
    if (nextStatus === "SERVED" || nextStatus === "PAID") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: nextStatus as any } : o
        )
      );
    }

    await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
  } catch (err) {
    console.error("Failed to update status:", err);
    fetchOrders(); // Rollback on failure
  }
};

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playNewOrderSound(); // Play test chime on initial enable
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-900 text-white flex flex-col">
      {/* Sub-header for KDS view controls */}
      <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/60 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight">
            Kitchen Display System
          </h1>
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">
            {orders.length} Active Orders
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Alert Toggle Button */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              soundEnabled
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30"
                : "bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white"
            }`}
            title={soundEnabled ? "Mute New Order Alerts" : "Enable New Order Alerts"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            {soundEnabled ? "Audio On" : "Enable Audio"}
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <main className="p-6 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm">Loading Active Tickets...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 bg-slate-800/40 border border-dashed border-slate-700/80 rounded-2xl text-slate-400">
            <Volume2 className="w-12 h-12 mb-3 text-slate-600" />
            <p className="text-lg font-semibold text-slate-300">
              Kitchen is Clear!
            </p>
            <p className="text-sm text-slate-500 mt-1">
              New orders placed on the QR PWA will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={handleUpdateStatus}
              />
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