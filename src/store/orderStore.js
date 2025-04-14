import { create } from 'zustand';

const useOrderStore = create((set) => ({
    // The currently selected order details
    orderDetails: null,

    // Array of all orders (for the table view)
    orders: [],

    // Set the detailed order information for the currently selected order
    setOrderDetails: (orderDetails) => set({ orderDetails }),

    // Set the orders array
    setOrders: (orders) => set({ orders }),

    // Add a new order to the list
    addOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
    })),

    // Update an existing order in the list
    updateOrder: (updatedOrder) => set((state) => ({
        orders: state.orders.map(order =>
            order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
        ),
        // Also update orderDetails if it's the current order
        orderDetails: state.orderDetails?.id === updatedOrder.id
            ? { ...state.orderDetails, ...updatedOrder }
            : state.orderDetails
    })),

    // Remove an order from the list
    removeOrder: (orderId) => set((state) => ({
        orders: state.orders.filter(order => order.id !== orderId),
        // Clear orderDetails if it's the deleted order
        orderDetails: state.orderDetails?.id === orderId ? null : state.orderDetails
    })),
}));

export default useOrderStore;