import React, { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { TestTubeDiagonal, Factory, Truck } from "lucide-react";
import OrderDetails from "./OrderDetails";
import Sampling from "./Sampling";
import Production from "./Production";
import Shipment from "./Shipment";
import SentMails from "./SentMail";
import useOrderStore from "../store/orderStore"
export default function OrderProgress() {   
    const [activeTab, setActiveTab] = useState("order-details");
    // console.log("PROPS: ", orderDetails);
    const orderDetails = useOrderStore((state) => state.orderDetails);
    // console.log("ORDER DETAILS FROM ORDER PROGRESS: ", orderDetails);

    const steps = [
        { id: "sampling", label: "Sampling", icon: <TestTubeDiagonal color="#999999" /> },
        { id: "production", label: "Production", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#999999"><path d="M80-80v-481l280-119v80l200-80v120h320v480H80Zm360-160h80v-160h-80v160Zm-160 0h80v-160h-80v160Zm320 0h80v-160h-80v160Zm272-380H687l34-260h119l32 260Z" /></svg> },
        { id: "shipment", label: "Shipment", icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#999999"><path d="m20-427 20-80h220l-20 80H20Zm260 267q-50 0-85-35t-35-85H60l20-87h207l36-146h84l50-200H180l6-24q6-28 27.5-45.5T264-800h456l-37 160h117l120 160-40 200h-80q0 50-35 85t-85 35q-50 0-85-35t-35-85H400q0 50-35 85t-85 35ZM100-573l20-80h260l-20 80H100Zm180 333q17 0 28.5-11.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 17 11.5 28.5T280-240Zm400 0q17 0 28.5-11.5T720-280q0-17-11.5-28.5T680-320q-17 0-28.5 11.5T640-280q0 17 11.5 28.5T680-240Zm-43-200h193l4-21-74-99h-95l-28 120Z" /></svg> },
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
                            className={`text-sm mt-2 text-[#6B7280]`}
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
                <Tabs.List className="flex border-b border-[#E5E7EB]">
                    {["Order Details", "Sampling", "Production", "Shipment", "Sent Mails"].map(
                        (tab) => (
                            <Tabs.Trigger
                                key={tab}
                                value={tab.toLowerCase().replace(" ", "-")}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === tab.toLowerCase().replace(" ", "-")
                                    ? "border-b-2 border-blue-600 text-blue-600"
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
