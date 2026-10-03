"use client";

import React, { useEffect, useState } from "react";
import { OrderService } from "@/services/order.service";
import { Order } from "@/components/kds/OrderCard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { RefreshCw, Search, Filter, Printer, X, CreditCard, Wallet, User, Phone } from "lucide-react";

interface ReceiptData {
  receiptId: string;
  restaurantName: string;
  address: string;
  tableNumber: string;
  orderId: string;
  date: string;
  notes?: string;
  items: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
  summary: { subtotal: number; taxRate: number; taxAmount: number; grandTotal: number };
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
      );
      await OrderService.updateStatus(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      fetchOrders();
    }
  };

  const handlePrintReceipt = async (order: Order) => {
    try {
      const restaurantId = (order as any).restaurantId || user?.restaurantId;
      const data = await OrderService.getReceipt(order.id, restaurantId);
      setReceiptData(data);
    } catch (err) {
      console.error("Failed to fetch receipt:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table?.tableNumber?.toString().includes(searchQuery) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerPhone && order.customerPhone.includes(searchQuery));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-65px)] text-white">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Orders</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor, filter, and manage historical and active table orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, or Table Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY">Ready</option>
            <option value="SERVED">Served</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-slate-800/40 border border-dashed border-slate-700/80 rounded-2xl text-slate-400">
          No orders match the selected criteria.
        </div>
      ) : (
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800 border-b border-slate-700 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Table</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Payment Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredOrders.map((order) => {
                const paymentMethod =
                  (order as any).payments?.[0]?.method ||
                  (order as any).paymentMethod ||
                  "PAY_AT_TABLE";
                const isOnline = paymentMethod === "ONLINE";

                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      Table {order.table?.tableNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {order.customerName || order.customerPhone ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            {order.customerName || "Guest"}
                          </p>
                          {order.customerPhone && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                              <Phone className="w-3.5 h-3.5 text-emerald-400" />
                              {order.customerPhone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Walk-in Guest</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ul className="space-y-1">
                        {order.items?.map((item: any) => (
                          <li key={item.id} className="text-xs text-slate-300">
                            <span className="font-semibold text-indigo-400">{item.quantity}x</span>{" "}
                            {item.menuItem?.name}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          isOnline
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {isOnline ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5" /> Online
                          </>
                        ) : (
                          <>
                            <Wallet className="w-3.5 h-3.5" /> Pay at Table
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-200 border border-slate-600">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                        title="Print Thermal Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="READY">READY</option>
                        <option value="SERVED">SERVED</option>
                        <option value="PAID">PAID</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* POS Thermal Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-black font-mono p-6 rounded-lg max-w-sm w-full shadow-2xl relative print:m-0 print:p-2 print:shadow-none">
            <button
              onClick={() => setReceiptData(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-slate-200 text-slate-700 hover:bg-slate-300 print:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center border-b-2 border-dashed border-black pb-3 mb-3">
              <h2 className="text-xl font-bold uppercase">{receiptData.restaurantName}</h2>
              <p className="text-xs">{receiptData.address}</p>
              <p className="text-xs mt-1">Receipt #{receiptData.receiptId}</p>
              <p className="text-xs">
                Table: {receiptData.tableNumber} | Date: {new Date(receiptData.date).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-1.5 text-xs mb-3">
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-black pt-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{receiptData.summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({receiptData.summary.taxRate}%):</span>
                <span>₹{receiptData.summary.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                <span>TOTAL:</span>
                <span>₹{receiptData.summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-2 bg-black text-white font-sans text-xs font-bold rounded-md hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" /> Print POS Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
      <OrdersContent />
    </ProtectedRoute>
  );
}