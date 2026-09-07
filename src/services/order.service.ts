import { api } from "@/lib/api";
import { Order } from "@/components/kds/OrderCard";

export interface CreateOrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderPayload {
  tableId: string;
  items: CreateOrderItem[];
}

export const OrderService = {
  // Get all orders for the current restaurant
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get("/orders");
    return response.data;
  },

  // Get active orders filtered for KDS (excluding COMPLETED orders)
  async getActiveOrders(): Promise<Order[]> {
    const response = await api.get("/orders");
    return response.data.filter(
      (o: Order) => o.status !== "SERVED" && o.status !== "PAID"
    );
  },

  // Get single order details by ID
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Place a new order (used by customer/PWA or manual entry)
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post("/orders", payload);
    return response.data;
  },

  // Update order status (e.g., ACCEPTED, PREPARING, READY, SERVED, COMPLETED)
  async updateStatus(orderId: string, status: string): Promise<Order> {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel an active order
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await api.patch(`/orders/${orderId}/status`, { status: "CANCELLED" });
    return response.data;
  },

  // Delete an order permanently (or purge completed KDS orders)
  async deleteOrder(orderId: string): Promise<void> {
    await api.delete(`/orders/${orderId}`);
  },
};