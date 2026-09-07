import { api } from "@/lib/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const AuthService = {
  // Login staff user
  async login(credentials: LoginCredentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Fetch current logged-in user profile
  async getProfile() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};