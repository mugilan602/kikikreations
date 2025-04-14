import React, { useState, useEffect, useMemo } from "react";
import { Search, Trash2, Filter } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { FaChevronRight } from "react-icons/fa6";
import { getOrders, getOrderWithDetails, deleteOrder } from "../firebase/order.js";
import { motion } from "framer-motion";
import useOrderStore from "../store/orderStore.js";
import OrderProgress from "./OrderProgess.jsx";
import DeleteConfirmationModal from "./DeleteConfirmationModal.jsx";
import { useToast } from "./ToastContext.jsx";

export default function OrderTable() {
    const statusStyles = {
        production: "bg-yellow-100 text-yellow-800",
        shipment: "bg-green-100 text-green-800",
        sampling: "bg-blue-100 text-blue-800",
        "order-details": "bg-gray-100 text-gray-800",
    };

    // Get all necessary data and functions from the Zustand store
    const orderDetails = useOrderStore((state) => state.orderDetails);
    const setOrderDetails = useOrderStore((state) => state.setOrderDetails);
    const orders = useOrderStore((state) => state.orders);
    const setOrders = useOrderStore((state) => state.setOrders);
    const removeOrder = useOrderStore((state) => state.removeOrder);

    const { showToast } = useToast(); // Use the toast context

    const [searchQuery, setSearchQuery] = useState("");
    const [openItem, setOpenItem] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [loadingTimestamp, setLoadingTimestamp] = useState(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState("all");
    const [labelFilter, setLabelFilter] = useState("all");

    // Delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get unique label types and statuses for filter dropdowns
    // Add a unique key to force recalculation when needed
    const [filterUpdateKey, setFilterUpdateKey] = useState(0);

    // Force refresh of filters
    const refreshFilters = () => {
        setFilterUpdateKey(prevKey => prevKey + 1);
    };

    const uniqueLabelTypes = useMemo(() => {
        console.log("Recalculating label types");
        const labelTypes = new Set();
        orders.forEach(order => {
            if (order.labelType) labelTypes.add(order.labelType);
        });
        return Array.from(labelTypes).sort();
    }, [orders, filterUpdateKey]);

    const uniqueStatuses = useMemo(() => {
        console.log("Recalculating statuses");
        const statuses = new Set();
        orders.forEach(order => {
            const status = order.status || "order-details";
            statuses.add(status);
        });
        return Array.from(statuses).sort();
    }, [orders, filterUpdateKey]);

    // Force refresh of filters when selecting a dropdown
    const handleFilterClick = () => {
        refreshFilters();
    };

    // Fetch orders on mount and store them in Zustand
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                // Sort orders by createdAt date (newest first)
                const sortedOrders = data.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                    return dateB - dateA;
                });

                setOrders(sortedOrders); // Update orders in Zustand store
                console.log("Initial Fetched Orders: ", sortedOrders);
            } catch (error) {
                console.error("Error fetching orders: ", error);
                showToast(`Error fetching orders: ${error.message}`, "error");
            }
        };

        // Only fetch if orders array is empty
        if (orders.length === 0) {
            fetchOrders();
        }
    }, [setOrders, orders.length, showToast]);

    // Listen for changes to orderDetails and update filters when status changes
    useEffect(() => {
        if (orderDetails) {
            refreshFilters();
        }
    }, [orderDetails?.status]);

    // Listen for any changes in the orders array length (additions or deletions)
    useEffect(() => {
        refreshFilters();
    }, [orders.length]);

    const handleOrderOpen = async (orderId) => {
        // When closing (orderId is null or empty), just clean up
        if (!orderId) {
            setOpenItem(null);
            // Don't clear orderDetails to avoid flickering if user reopens the same order
            return;
        }

        // If closing the currently open item
        if (orderId === openItem) {
            setOpenItem(null);
            // Don't clear orderDetails to avoid flickering if user reopens the same order
            return;
        }

        setOpenItem(orderId);
        setIsLoadingDetails(true);
        setLoadingTimestamp(Date.now());
        console.log("Opening Order ID: ", orderId);

        try {
            // Check if we have the order details in the Zustand store and it's the one we're opening
            const hasDetailsInStore = orderDetails && orderDetails.id === orderId;

            if (!hasDetailsInStore) {
                // Only clear previous details if we're loading a different order
                // setOrderDetails(null); // Commented out to avoid flickering

                // Fetch fresh details from the database
                const details = await getOrderWithDetails(orderId);
                console.log("Fetched Order Details: ", details);

                // Update Zustand store with fresh data
                setOrderDetails(details);
            } else {
                console.log("Using order details from Zustand store");
                // We already have the details in the store, no need to fetch again
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
            showToast(`Error fetching order details: ${error.message}`, "error");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Handle opening the delete confirmation modal
    const handleDeleteClick = (e, order) => {
        e.stopPropagation(); // Prevent the accordion from toggling
        setOrderToDelete(order);
        setIsDeleteModalOpen(true);
    };

    // Handle the actual deletion
    const handleConfirmDelete = async () => {
        if (!orderToDelete) return;

        setIsDeleting(true);
        try {
            // Delete the order from Firestore
            await deleteOrder(orderToDelete.id);

            // Update the Zustand store by removing the deleted order
            removeOrder(orderToDelete.id);

            // If the deleted order was open, close it
            if (openItem === orderToDelete.id) {
                setOpenItem(null);
            }

            // Show success toast
            showToast(`Order ${orderToDelete.referenceNumber || orderToDelete.id} deleted successfully`, "success");

            // Close the modal
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
        } catch (error) {
            console.error("Error deleting order:", error);
            showToast(`Failed to delete order: ${error.message}`, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter orders based on search query, status, and label
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Search filter
            const matchesSearch =
                (order.orderName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    order.id?.toLowerCase().includes(searchQuery.toLowerCase()));

            // Status filter
            const orderStatus = order.status || "order-details";
            const matchesStatus = statusFilter === "all" || orderStatus === statusFilter;

            // Label filter
            const matchesLabel = labelFilter === "all" || order.labelType === labelFilter;

            return matchesSearch && matchesStatus && matchesLabel;
        });
    }, [orders, searchQuery, statusFilter, labelFilter]);

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setLabelFilter("all");
    };

    // Check if any filters are active
    const isFiltered = searchQuery !== "" || statusFilter !== "all" || labelFilter !== "all";

    return (
        <div className="rounded-xl bg-white shadow-sm mb-4 mx-8">
            {/* Search Bar and Filters */}
            <div className="flex rounded-xl flex-col bg-white md:flex-row md:items-center gap-2 px-4 py-6 mb-4">
                <div className="relative w-6/12">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="border border-[#E5E7EB] pl-10 pr-3 py-2 rounded w-full focus:ring-2 focus:ring-gray-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status Filter */}
                <div className="relative w-3/12">
                    <select
                        className="border border-[#E5E7EB] px-3 py-2 rounded w-full"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        onClick={handleFilterClick}
                        onFocus={handleFilterClick}
                    >
                        <option value="all">All Statuses</option>
                        {uniqueStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status === "order-details" ? "New Order" : status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Label Filter */}
                <div className="relative w-3/12">
                    <select
                        className="border border-[#E5E7EB] px-3 py-2 rounded w-full"
                        value={labelFilter}
                        onChange={(e) => setLabelFilter(e.target.value)}
                        onClick={handleFilterClick}
                        onFocus={handleFilterClick}
                    >
                        <option value="all">All Label Types</option>
                        {uniqueLabelTypes.map((label) => (
                            <option key={label} value={label}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Indicator */}
            {isFiltered && (
                <div className="flex items-center justify-between px-4 pb-4 -mt-2">
                    <div className="flex items-center text-sm text-gray-600">
                        <Filter size={16} className="mr-1" />
                        <span>
                            Filters:
                            {searchQuery && <span className="ml-1">Search</span>}
                            {statusFilter !== "all" && <span className="ml-1">• Status</span>}
                            {labelFilter !== "all" && <span className="ml-1">• Label</span>}
                        </span>
                    </div>
                    <button
                        onClick={resetFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Reset filters
                    </button>
                </div>
            )}

            {/* Scrollable Table Wrapper for Mobile */}
            <div className="overflow-x-auto">
                <Accordion.Root
                    className="w-full min-w-[1000px]"
                    type="single"
                    collapsible
                    onValueChange={handleOrderOpen}
                    value={openItem}
                >
                    {/* Table Head */}
                    <div className="text-[#6B7280] bg-[#F9FAFB] text-sm border-b border-[#E5E7EB] flex font-medium">
                        <div className="py-3 px-4 w-12"></div>
                        <div className="py-3 px-4 flex-[2]">Reference</div>
                        <div className="py-3 px-4 flex-[3]">Order Name</div>
                        <div className="py-3 px-4 flex-[4]">Customer Email</div>
                        <div className="py-3 px-4 flex-[2] text-center">Status</div>
                        <div className="py-3 px-4 w-18 text-center">Actions</div>
                    </div>

                    {/* Table Body */}
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => {
                            // Always prefer the status from orderDetails if it's the currently open order
                            const displayStatus =
                                orderDetails && orderDetails.id === order.id
                                    ? orderDetails.status
                                    : order.status || "order-details"; // Default status

                            return (
                                <Accordion.Item
                                    key={order.id}
                                    value={order.id}
                                    className={index === filteredOrders.length - 1 ? "" : "border-b border-[#E5E7EB]"}
                                >
                                    <Accordion.Header>
                                        <Accordion.Trigger asChild>
                                            <div className="text-sm text-gray-700 flex items-center hover:bg-gray-50 cursor-pointer">
                                                <div className="py-4 px-4 w-12 flex items-center justify-center">
                                                    <motion.div
                                                        animate={{
                                                            rotate: openItem === order.id ? 90 : 0,
                                                        }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <FaChevronRight className="text-gray-500" />
                                                    </motion.div>
                                                </div>
                                                <div className="py-4 px-4 flex-[2] text-black font-medium whitespace-nowrap">
                                                    {order.referenceNumber || "N/A"}
                                                </div>
                                                <div className="py-4 px-4 flex-[3] whitespace-nowrap">
                                                    {order.orderName || "Unnamed Order"}
                                                </div>
                                                <div className="py-4 px-4 flex-[4] whitespace-nowrap">
                                                    {order.customerEmail || "No email"}
                                                </div>
                                                <div className="py-4 px-4 flex-[2] text-center">
                                                    <span
                                                        className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[displayStatus] || "bg-gray-100 text-gray-800"}`}
                                                    >
                                                        {displayStatus === "order-details" ? "New Order" : displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="py-4 px-4 w-18 text-center">
                                                    <button
                                                        className="text-red-500 cursor-pointer hover:text-red-700"
                                                        onClick={(e) => handleDeleteClick(e, order)}
                                                        aria-label="Delete order"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </Accordion.Trigger>
                                    </Accordion.Header>

                                    <Accordion.Content>
                                        <div className="p-4 border-t border-[#E5E7EB]">
                                            {orderDetails && orderDetails.id === order.id && !isLoadingDetails ? (
                                                <OrderProgress />
                                            ) : (
                                                <div className="py-4 text-center text-gray-500">
                                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                    Loading order details...
                                                </div>
                                            )}
                                        </div>
                                    </Accordion.Content>
                                </Accordion.Item>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center text-gray-500 w-full">
                            {isFiltered ? (
                                <>No orders match your filter criteria. <button onClick={resetFilters} className="text-blue-600 hover:underline">Reset filters</button></>
                            ) : (
                                <>No orders found. Add your first order to get started.</>
                            )}
                        </div>
                    )}
                </Accordion.Root>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Order"
                message={`Are you sure you want to delete order ${orderToDelete?.referenceNumber || ''}? This action cannot be undone.`}
            />
        </div>
    );
}