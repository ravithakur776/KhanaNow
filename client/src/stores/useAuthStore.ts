import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  role: 'customer' | 'restaurant_owner' | 'admin' | 'delivery_partner';
  avatarUrl?: string;
  addresses?: Array<{
    _id?: string;
    label: 'Home' | 'Work' | 'Other';
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
  updateUser: (user) => set({ user }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
