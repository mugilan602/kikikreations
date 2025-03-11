import React from "react";
import { Trash2 } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import OrderProgress from "./OrderProgess";

export default function OrderTable() {
    const orders = [
        {
            id: "ORD-2024-001",
            name: "Custom Woven Labels",
            email: "client@example.com",
            status: "Production",
            statusColor: "bg-yellow-100 text-yellow-800",
            // Adding some example details for the accordion content
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
    ];

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <Accordion.Root className="w-full" type="single" collapsible>
                {/* Table Head */}
                <div className="text-gray-600 text-sm border-b flex">
                    <div className="py-3 px-4 w-10"></div>
                    <div className="py-3 px-4 flex-1 min-w-0">Reference</div>
                    <div className="py-3 px-4 flex-1 min-w-0">Order Name</div>
                    <div className="py-3 px-4 flex-1 min-w-0">Customer Email</div>
                    <div className="py-3 px-4 w-32 text-center">Status</div>
                    <div className="py-3 px-4 w-10 text-center"></div>
                </div>

                {/* Table Body */}
                {orders.map((order) => (
                    <Accordion.Item
                        key={order.id}
                        value={order.id}
                        className="border-b"
                    >
                        <Accordion.Trigger asChild>
                            <div className="text-sm text-gray-700 flex items-center hover:bg-gray-50 cursor-pointer">
                                <div className="py-4 px-6 w-10">
                                    <ChevronDownIcon className="text-gray-500 transition-transform duration-300 data-[state=open]:rotate-180" />
                                </div>
                                <div className="py-4 px-6 text-blue-600 font-medium whitespace-nowrap flex-1 min-w-0">
                                    #{order.id}
                                </div>
                                <div className="py-4 px-6 whitespace-nowrap flex-1 min-w-0">
                                    {order.name}
                                </div>
                                <div className="py-4 px-6 whitespace-nowrap flex-1 min-w-0">
                                    {order.email}
                                </div>
                                <div className="py-4 px-6 w-32 text-center">
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${order.statusColor}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                                <div className="py-4 px-6 w-10 text-center">
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </Accordion.Trigger>
                        <Accordion.Content className="">
                            <OrderProgress />
                        </Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </div>
    );
}