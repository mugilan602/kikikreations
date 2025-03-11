import React from "react";

export default function OrderDetails() {
    return (
        <div className="bg-white py-8 rounded-lg">
            {/* Order Details Section */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Customer Email</label>
                    <input
                        type="text"
                        value="client@example.com"
                        readOnly
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Reference Number</label>
                    <input
                        type="text"
                        value="#ORD-2024-001"
                        readOnly
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Order Name</label>
                    <input
                        type="text"
                        value="Custom Woven Labels"
                        readOnly
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Label Type</label>
                    <input
                        type="text"
                        value="Woven"
                        readOnly
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
            </div>

            {/* Order Details Text Area */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Order Details</label>
                <textarea
                    readOnly
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    rows="3"
                >
                    Custom woven labels with company logo, size specifications: 2x3 inches,
                    material: high-quality polyester, color: navy blue with white text.
                </textarea>
            </div>

            {/* Attachments */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-2 flex items-center gap-3">
                    <span className="px-3 py-1 text-sm bg-gray-200 rounded-md flex items-center gap-1">
                        📄 design_specs.pdf
                    </span>
                    <span className="px-3 py-1 text-sm bg-gray-200 rounded-md flex items-center gap-1">
                        🖼️ logo.png
                    </span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-red-500 text-white rounded-md">
                    Delete Order
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
