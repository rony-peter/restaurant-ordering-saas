import { api } from "@/lib/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterAdminPayload {
  restaurantName: string;
  address?: string;
  phone?: string;
  taxRate?: number;
  currency?: string;
  email: string;
  password: string;
}

export interface StaffUser {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "COOK";
  restaurantId?: string;
  createdAt?: string;
}

export const AuthService = {
  // Login staff user
  async login(credentials: LoginCredentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Register restaurant & primary admin account
  async registerAdmin(data: RegisterAdminPayload) {
    const response = await api.post("/auth/register-admin", data);
    return response.data;
  },

  // Register new staff member (Admin only)
  async registerStaff(data: { email: string; password: string; role: string }): Promise<StaffUser> {
    const response = await api.post("/staff", data);
    return response.data;
  },

  // Fetch list of all staff members for current restaurant
  async getStaffList(): Promise<StaffUser[]> {
    const response = await api.get("/staff");
    return response.data;
  },

  // Delete staff member by ID
  async deleteStaff(id: string): Promise<void> {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },

  // Fetch current logged-in user profile
  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};