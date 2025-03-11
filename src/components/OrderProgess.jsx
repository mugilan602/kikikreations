import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { FileText, Package, Truck } from "lucide-react";
import OrderDetails from "./OrderDetails";
import Sampling from "./Sampling";
import Production from "./Production";
import Shipment from "./Shipment";
import SentMails from "./SentMail";

export default function OrderProgress() {
    const [activeTab, setActiveTab] = useState("order-details");

    const steps = [
        { id: "sampling", label: "Sampling", icon: <FileText size={18} /> },
        { id: "production", label: "Production", icon: <Package size={18} /> },
        { id: "shipment", label: "Shipment", icon: <Truck size={18} /> },
    ];

    const stepProgress = {
        "order-details": 0,
        "sampling": 33,
        "production": 66,
        "shipment": 100,
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Stepper Progress Bar */}
            <div className="relative flex justify-between items-center mt-6 mb-8 px-6">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-300 "></div>
                {/* <div
                    className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-300"
                    style={{ width: `${stepProgress[activeTab]}%` }}
                ></div> */}

                {steps.map((step) => (
                    <div key={step.id} className="relative flex flex-col items-center w-1/3">
                        <div
                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2 bg-gray-200 border-gray-400 text-gray-500"}`}
                        >
                            {step.icon}
                        </div>
                        <span
                            className={`text-sm mt-2 "text-gray-500"}`}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Radix Tabs */}
            <Tabs.Root
                defaultValue="order-details"
                onValueChange={(value) => setActiveTab(value)}
                className="w-full"
            >
                {/* Tab Navigation */}
                <Tabs.List className="flex border-b">
                    {["Order Details", "Sampling", "Production", "Shipment", "Sent Mails"].map(
                        (tab) => (
                            <Tabs.Trigger
                                key={tab}
                                value={tab.toLowerCase().replace(" ", "-")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === tab.toLowerCase().replace(" ", "-")
                                    ? "border-b-2 border-black text-black"
                                    : "text-gray-500"
                                    }`}
                            >
                                {tab}
                            </Tabs.Trigger>
                        )
                    )}
                </Tabs.List>

                {/* Tab Content */}
                <div className="bg-white rounded-lg">
                    <Tabs.Content value="order-details">
                        <OrderDetails />
                    </Tabs.Content>

                    <Tabs.Content value="sampling">
                        <Sampling />
                    </Tabs.Content>

                    <Tabs.Content value="production">
                        <Production />
                    </Tabs.Content>

                    <Tabs.Content value="shipment">
                        <Shipment />
                    </Tabs.Content>

                    <Tabs.Content value="sent-mails">
                        <SentMails />
                    </Tabs.Content>
                </div>
            </Tabs.Root>
        </div>
    );
}
