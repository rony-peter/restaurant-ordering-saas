import { api } from "@/lib/api";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
  restaurantId: string;
}

export interface CreateMenuItemPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable?: boolean;
  imageUrl?: string;
}

export const MenuService = {
  // 1. Fetch menu items passing the authenticated user's restaurantId
  async getMenuItems(restaurantId: string): Promise<MenuItem[]> {
    const response = await api.get(`/menu/restaurant/${restaurantId}`);
    return response.data;
  },

  // 2. Add menu item
  async createMenuItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
    const response = await api.post("/menu", payload);
    return response.data;
  },

  // 3. Toggle availability matching backend PATCH /:id/availability endpoint
  async toggleAvailability(id: string, isAvailable: boolean): Promise<void> {
    await api.patch(`/menu/${id}/availability`, { isAvailable });
  },

  // 4. Delete menu item
  async deleteMenuItem(id: string): Promise<void> {
    await api.delete(`/menu/${id}`);
  },
};