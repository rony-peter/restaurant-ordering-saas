"use client";

import React, { useEffect, useState, useRef } from "react";
import { TableService, TableItem } from "@/services/table.service";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { QRCodeSVG } from "qrcode.react";
import { Plus, RefreshCw, Download, Trash2 } from "lucide-react";

function TablesContent() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await TableService.getTables();
      setTables(data);
    } catch (err) {
      console.error("Failed to load tables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber) return;

    try {
      setCreating(true);
      const createdTable = await TableService.createTable(newTableNumber);
      setTables((prev) => [...prev, createdTable]);
      setNewTableNumber("");
    } catch (err) {
      console.error("Failed to create table:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;

    try {
      setDeletingId(id);
      await TableService.deleteTable(id);
      setTables((prev) => prev.filter((table) => table.id !== id));
    } catch (err) {
      console.error("Failed to delete table:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadQR = (tableNumber: string, containerId: string) => {
    const svgElement = document.getElementById(containerId)?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;

      if (ctx) {
        // Draw white background canvas
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        downloadLink.download = `Table-${tableNumber}-QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="p-6 bg-slate-900 min-h-[calc(100vh-65px)] text-white">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tables & QR Codes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage floor tables and download unique QR codes for customer ordering.
          </p>
        </div>

        {/* Create Table Form */}
        <form onSubmit={handleCreateTable} className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Table Number (e.g., 10 or A1)"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={creating || !newTableNumber}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            {creating ? "Adding..." : "Add Table"}
          </button>
        </form>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => {
            const qrUrl = typeof window !== "undefined" ? `${window.location.origin}/order?qr=${table.qrCodeToken}` : "";
            const containerId = `qr-container-${table.id}`;

            return (
              <div
                key={table.id}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 flex flex-col items-center gap-4 relative group"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-lg">Table {table.tableNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-medium">
                      {table.status}
                    </span>
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      disabled={deletingId === table.id}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div id={containerId} className="p-3 bg-white rounded-xl shadow-lg">
                  <QRCodeSVG value={qrUrl} size={140} />
                </div>

                <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-slate-700/60">
                  <p className="text-xs text-slate-400 truncate flex-1">
                    Token: {table.qrCodeToken.slice(0, 10)}...
                  </p>
                  <button
                    onClick={() => handleDownloadQR(table.tableNumber, containerId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PNG
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TablesPage() {
  return (
    <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
      <TablesContent />
    </ProtectedRoute>
  );
}