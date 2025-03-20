import React, { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { FaChevronRight } from "react-icons/fa6";

import { motion } from "framer-motion";
import OrderProgress from "../components/OrderProgess";

export default function OrderTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [openItem, setOpenItem] = useState(null); // Track open item for Framer Motion

    const orders = [
        {
            id: "ORD-2024-001",
            name: "Custom Woven Labels",
            email: "client@example.com",
            status: "Production",
            statusColor: "bg-yellow-100 text-yellow-800",
            details: {
                quantity: 1000,
                deliveryDate: "2024-03-20",
                notes: "Urgent order - client needs expedited shipping"
            }
        },
        {
            id: "ORD-2024-002",
            name: "Printed Care Labels",
            email: "customer@example.com",
            status: "Shipment",
            statusColor: "bg-green-100 text-green-800",
            details: {
                quantity: 500,
                deliveryDate: "2024-03-15",
                notes: "Standard shipping"
            }
        },

        {
            id: "ORD-2024-003",
            name: "Printed Care Labels",
            email: "customer@example.com",
            status: "Shipment",
            statusColor: "bg-green-100 text-green-800",
            details: {
                quantity: 500,
                deliveryDate: "2024-03-15",
                notes: "Standard shipping"
            }
        },

        {
            id: "ORD-2024-004",
            name: "Printed Care Labels",
            email: "customer@example.com",
            status: "Shipment",
            statusColor: "bg-green-100 text-green-800",
            details: {
                quantity: 500,
                deliveryDate: "2024-03-15",
                notes: "Standard shipping"
            }
        },

        {
            id: "ORD-2024-005",
            name: "Printed Care Labels",
            email: "customer@example.com",
            status: "Shipment",
            statusColor: "bg-green-100 text-green-800",
            details: {
                quantity: 500,
                deliveryDate: "2024-03-15",
                notes: "Standard shipping"
            }
        },

        {
            id: "ORD-2024-006",
            name: "Printed Care Labels",
            email: "customer@example.com",
            status: "Shipment",
            statusColor: "bg-green-100 text-green-800",
            details: {
                quantity: 500,
                deliveryDate: "2024-03-15",
                notes: "Standard shipping"
            }
        },

        {
            id: "ORD-2024-007",
            name: "Printed Care Labels",
            email: "customer@example.com",
            status: "Shipment",
            statusColor: "bg-green-100 text-green-800",
            details: {
                quantity: 500,
                deliveryDate: "2024-03-15",
                notes: "Standard shipping"
            }
        },
    ];

    const filteredOrders = orders.filter(order =>
        order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="rounded-xl bg-white shadow-sm mb-4 mx-8">
            {/* Search Bar */}
            <div className="flex rounded-xl flex-col bg-white  md:flex-row md:items-center gap-2 px-4 py-6 mb-4">
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
                <select className="border border-[#E5E7EB] px-3 py-2 rounded w-3/12">
                    <option>All Status</option>
                </select>
                <select className="border border-[#E5E7EB] px-3 py-2 rounded w-3/12">
                    <option>All Label Types</option>
                </select>
            </div>

            {/* Scrollable Table Wrapper for Mobile */}
            <div className="overflow-x-auto">
                <Accordion.Root
                    className="w-full min-w-[1000px]"
                    type="single"
                    collapsible
                    onValueChange={(value) => setOpenItem(value)} // Track open item
                >
                    {/* Table Head */}
                    <div className="text-[#6B7280] bg-[#F9FAFB] text-sm border-b border-[#E5E7EB] flex font-medium">
                        <div className="py-3 px-4 w-12"></div> {/* Icon Column */}
                        <div className="py-3 px-4 flex-[2]">Reference</div>
                        <div className="py-3 px-4 flex-[3]">Order Name</div>
                        <div className="py-3 px-4 flex-[4]">Customer Email</div>
                        <div className="py-3 px-4 flex-[2] text-center">Status</div>
                        <div className="py-3 px-4 w-18 text-center"></div> {/* Delete Icon Column */}
                    </div>

                    {/* Table Body */}
                    {filteredOrders.map((order,index) => (
                        <Accordion.Item key={order.id} value={order.id} className={index === filteredOrders.length - 1 ? "" : "border-b border-[#E5E7EB]"}>
                            <Accordion.Header>
                                <Accordion.Trigger asChild>
                                    <div className="text-sm text-gray-700 flex items-center hover:bg-gray-50 cursor-pointer">
                                        {/* Expand Icon with Framer Motion */}
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
                                        {/* Order Data */}
                                        <div className="py-4 px-4 flex-[2] text-black font-medium whitespace-nowrap">
                                            #{order.id}
                                        </div>
                                        <div className="py-4 px-4 flex-[3] whitespace-nowrap">
                                            {order.name}
                                        </div>
                                        <div className="py-4 px-4 flex-[4] whitespace-nowrap">
                                            {order.email}
                                        </div>
                                        <div className="py-4 px-4 flex-[2] text-center">
                                            <span
                                                className={`px-3 py-1 text-xs font-medium rounded-full ${order.statusColor}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                        {/* Delete Button */}
                                        <div className="py-4 px-4 w-18 text-center">
                                            <button
                                                className="text-red-500 hover:text-red-700"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </Accordion.Trigger>
                            </Accordion.Header>

                            {/* Accordion Content - Expanded Details */}
                            <Accordion.Content className="">
                                <div className="p-4 border-t border-[#E5E7EB]">
                                    <OrderProgress />
                                </div>
                            </Accordion.Content>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </div>
        </div>
    );
}
