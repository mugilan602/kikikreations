import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { FileText, Package, Truck, Mail } from "lucide-react";

export default function Stepper({ activeStep }) {
  const steps = [
    { id: "sampling", label: "Sampling", icon: <FileText size={20} /> },
    { id: "production", label: "Production", icon: <Package size={20} /> },
    { id: "shipment", label: "Shipment", icon: <Truck size={20} /> },
    { id: "sent-mails", label: "Sent Mails", icon: <Mail size={20} /> },
  ];

  return (
    <Tabs.Root defaultValue="order-details" className="w-full max-w-6xl mx-auto">
      {/* Stepper Navigation */}
      <Tabs.List className="flex justify-between border-b mb-6 px-4 py-2">
        {steps.map((step) => (
          <Tabs.Trigger
            key={step.id}
            value={step.id}
            className={`flex flex-col items-center gap-1 px-4 py-2 text-sm font-medium ${activeStep === step.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-400"
              }`}
          >
            {step.icon}
            <span>{step.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
