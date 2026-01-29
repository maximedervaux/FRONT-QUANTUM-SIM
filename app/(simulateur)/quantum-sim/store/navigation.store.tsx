import { create } from 'zustand'

export type PageKey = "default" | "ondes" | "packets"

interface NavigationState {
  activePage: PageKey
  setActivePage: (page: PageKey) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activePage: "default",
  setActivePage: (page) => set({ activePage: page }) ,
}))