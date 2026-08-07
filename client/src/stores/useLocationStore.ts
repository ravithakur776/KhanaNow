import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserLocation {
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  label?: string;
}

interface LocationState {
  currentLocation: UserLocation;
  setLocation: (location: UserLocation) => void;
}

// Default location (Connaught Place, New Delhi)
const defaultLocation: UserLocation = {
  address: 'Connaught Place, Inner Circle',
  city: 'New Delhi',
  pincode: '110001',
  latitude: 28.6315,
  longitude: 77.2167,
  label: 'Home',
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      currentLocation: defaultLocation,
      setLocation: (location) => set({ currentLocation: location }),
    }),
    {
      name: 'khananow_location_store',
    }
  )
);
