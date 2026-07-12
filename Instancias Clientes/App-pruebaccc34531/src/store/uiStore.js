import { create } from 'zustand'

const useUiStore = create((set) => ({
  isSidebarOpen: false,
  activeModal: null,
  isLoading: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  setGlobalLoading: (loading) => set({ isLoading: loading }),
}))

export default useUiStore
