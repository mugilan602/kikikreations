import { create } from "zustand";

const useOrderStore = create((set) => ({
    orderDetails: null,
    setOrderDetails: (details) => set({ orderDetails: details }),
}));

export default useOrderStore;
