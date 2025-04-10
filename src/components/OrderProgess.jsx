import React, { useState, useEffect } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { TestTubeDiagonal } from "lucide-react";
import OrderDetails from "./OrderDetails";
import Sampling from "./Sampling";
import Production from "./Production";
import Shipment from "./Shipment";
import SentMails from "./SentMail";
import useOrderStore from "../store/orderStore";

export default function OrderProgress() {
    const [activeTab, setActiveTab] = useState("order-details");
    const orderDetails = useOrderStore((state) => state.orderDetails);

    useEffect(() => {
        if (orderDetails?.status) {
            setActiveTab(orderDetails.status);
        }
    }, [orderDetails?.status]);

    const steps = [
        { id: "sampling", label: "Sampling", icon: <TestTubeDiagonal />, isLucide: true },
        {
            id: "production",
            label: "Production",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                    <path d="M80-80v-481l280-119v80l200-80v120h320v480H80Zm360-160h80v-160h-80v160Zm-160 0h80v-160h-80v160Zm320 0h80v-160h-80v160Zm272-380H687l34-260h119l32 260Z" />
                </svg>
            ),
            isLucide: false,
        },
        {
            id: "shipment",
            label: "Shipment",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                    <path d="m20-427 20-80h220l-20 80H20Zm260 267q-50 0-85-35t-35-85H60l20-87h207l36-146h84l50-200H180l6-24q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35ZM100-573l20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Zm-43-200h193l4-21-74-99h-95l-28 120Z" />
                </svg>
            ),
            isLucide: false,
        },
    ];

    const stepProgress = {
        "order-details": 0,
        "sampling": 33,
        "production": 66,
        "shipment": 100,
    };

    const getCurrentProgress = () => {
        const status = orderDetails?.status || "order-details";
        return stepProgress[status] || 0;
    };

    const getStepStatus = (stepId) => {
        const currentStatus = orderDetails?.status || "order-details";
        const currentProgress = stepProgress[currentStatus] || 0;
        const stepProgressValue = stepProgress[stepId] || 0;

        if (stepProgressValue <= currentProgress) {
            return "completed";
        }
        return "upcoming";
    };

    const getIconColor = (stepId) => {
        const currentProgress = getCurrentProgress();
        const stepProgressValue = stepProgress[stepId] || 0;
        return stepProgressValue <= currentProgress ? "#FFFFFF" : "#999999";
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Stepper Progress Bar */}
            <div className="relative flex justify-between items-center mt-6 mb-8 px-6">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-300"></div>
                <div
                    className="absolute top-5 left-0 h-1 bg-blue-600 transition-all duration-300"
                    style={{ width: `${getCurrentProgress()}%` }}
                ></div>

                {steps.map((step) => {
                    const iconColor = getIconColor(step.id);
                    return (
                        <div key={step.id} className="relative flex flex-col items-center w-1/3">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 
                                    ${getStepStatus(step.id) === "completed"
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "bg-gray-200 border-gray-400 text-gray-500"}`}
                            >
                                {React.cloneElement(step.icon, {
                                    ...(step.isLucide
                                        ? { color: iconColor } // For Lucide icons (stroke-based)
                                        : { fill: iconColor }), // For SVG icons (fill-based)
                                })}
                            </div>
                            <span
                                className={`text-sm mt-2 ${getStepStatus(step.id) === "completed"
                                    ? "text-blue-600 font-medium"
                                    : "text-[#6B7280]"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Radix Tabs */}
            <Tabs.Root
                value={activeTab}
                onValueChange={(value) => setActiveTab(value)}
                className="w-full"
            >
                <Tabs.List className="flex border-b border-[#E5E7EB]">
                    {["Order Details", "Sampling", "Production", "Shipment", "Sent Mails"].map(
                        (tab) => {
                            const tabValue = tab.toLowerCase().replace(" ", "-");
                            return (
                                <Tabs.Trigger
                                    key={tab}
                                    value={tabValue}
                                    className={`px-4 py-2 text-sm font-medium ${activeTab === tabValue
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {tab}
                                </Tabs.Trigger>
                            );
                        }
                    )}
                </Tabs.List>

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