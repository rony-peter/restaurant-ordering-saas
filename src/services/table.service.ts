import { api } from "@/lib/api";

export interface TableItem {
  id: string;
  tableNumber: string;
  qrCodeToken: string;
  status: "FREE" | "OCCUPIED";
}

export const TableService = {
  // Fetch all tables
  async getTables(): Promise<TableItem[]> {
    const response = await api.get("/tables");
    return response.data;
  },

  // Create a table
  async createTable(tableNumber: string | number): Promise<TableItem> {
    const response = await api.post("/tables", {
      tableNumber: String(tableNumber).trim(),
    });
    return response.data;
  },

  // Delete a table
  async deleteTable(id: string): Promise<void> {
    await api.delete(`/tables/${id}`);
  },
};