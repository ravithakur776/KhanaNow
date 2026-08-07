import { create } from 'zustand';

interface UIState {
  isCartDrawerOpen: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register';
  isSearchModalOpen: boolean;
  isLocationDrawerOpen: boolean;

  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;

  openAuthModal: (view?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  openSearchModal: () => void;
  closeSearchModal: () => void;

  openLocationDrawer: () => void;
  closeLocationDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartDrawerOpen: false,
  isAuthModalOpen: false,
  authModalView: 'login',
  isSearchModalOpen: false,
  isLocationDrawerOpen: false,

  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),
  toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),

  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),

  openLocationDrawer: () => set({ isLocationDrawerOpen: true }),
  closeLocationDrawer: () => set({ isLocationDrawerOpen: false }),
}));
