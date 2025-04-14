import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export default function Toast({ message, type = "success", duration = 3000, onClose }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose && onClose();
            }, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
    const borderColor = type === "success" ? "border-green-400" : "border-red-400";
    const textColor = type === "success" ? "text-green-800" : "text-red-800";
    const icon = type === "success" ? (
        <CheckCircle className="text-green-500" size={20} />
    ) : (
        <XCircle className="text-red-500" size={20} />
    );

    return (
        <div
            className={`fixed bottom-5 right-5 flex items-center p-4 mb-4 text-sm rounded-lg border ${bgColor} ${borderColor} ${textColor} transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                } shadow-md z-50`}
            role="alert"
        >
            <div className="flex items-center">
                {icon}
                <div className="ml-3 font-medium">{message}</div>
            </div>
            <button
                type="button"
                className="ml-5 -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-gray-200"
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => {
                        onClose && onClose();
                    }, 300);
                }}
            >
                <X size={16} />
            </button>
        </div>
    );
}