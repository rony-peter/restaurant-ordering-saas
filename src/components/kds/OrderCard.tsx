"use client";

import React, { useEffect, useState } from "react";
import { Clock, CheckCircle, Flame } from "lucide-react";

export interface OrderItem {
  id: string;
  quantity: number;
  notes?: string;
  menuItem: {
    name: string;
  };
}

export interface Order {
  id: string;
  status: "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "SERVED" | "PAID";
  createdAt: string;
  table?: {
    tableNumber: string | number;
  };
  items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: string) => void;
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Track elapsed time since order creation
  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const diffInMinutes = Math.floor((now - created) / 60000);
      setElapsedMinutes(diffInMinutes >= 0 ? diffInMinutes : 0);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Color dynamic card header based on ticket status and delay
  const getHeaderColor = () => {
    if (order.status === "PLACED" || order.status === "PAID" || order.status === "ACCEPTED") {
      return elapsedMinutes > 10
        ? "bg-red-500/20 border-red-500/50 text-red-400"
        : "bg-amber-500/20 border-amber-500/50 text-amber-400";
    }
    if (order.status === "PREPARING") {
      return "bg-blue-500/20 border-blue-500/50 text-blue-400";
    }
    return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400";
  };

  // ✅ FIX: Added explicit handling for PAID and ACCEPTED so orders flow into PREPARING -> READY -> SERVED
  const getNextStatusAction = () => {
    if (order.status === "PLACED" || order.status === "PAID" || order.status === "ACCEPTED") {
      return { label: "Start Cooking", next: "PREPARING", icon: Flame, color: "bg-blue-600 hover:bg-blue-500" };
    }
    if (order.status === "PREPARING") {
      return { label: "Mark Ready", next: "READY", icon: CheckCircle, color: "bg-emerald-600 hover:bg-emerald-500" };
    }
    return { label: "Bump / Serve", next: "SERVED", icon: CheckCircle, color: "bg-slate-700 hover:bg-slate-600" };
  };

  const action = getNextStatusAction();
  const Icon = action.icon;

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
      {/* Ticket Header */}
      <div>
        <div className={`p-4 border-b flex justify-between items-center ${getHeaderColor()}`}>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-75">
              Table {order.table?.tableNumber || "N/A"}
            </span>
            <h3 className="text-lg font-bold text-white">Order #{order.id.slice(-4)}</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsedMinutes}m ago</span>
          </div>
        </div>

        {/* Item List */}
        <div className="p-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-start text-slate-200">
              <div className="flex items-start gap-3">
                <span className="bg-slate-700 text-indigo-300 font-bold px-2 py-0.5 rounded text-sm min-w-[28px] text-center">
                  {item.quantity}x
                </span>
                <div>
                  <p className="font-semibold text-sm leading-tight">{item.menuItem.name}</p>
                  {item.notes && (
                    <p className="text-xs text-amber-400/90 mt-1 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bump Action Button */}
      <div className="p-4 border-t border-slate-700/60 bg-slate-800/50">
        <button
          onClick={() => onUpdateStatus(order.id, action.next)}
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${action.color}`}
        >
          <Icon className="w-4 h-4" />
          {action.label}
        </button>
      </div>
    </div>
  );
}