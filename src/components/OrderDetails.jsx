import React, { useState } from "react";
import { FaFilePdf, FaFileImage } from "react-icons/fa6";

export default function OrderDetails() {
    const initialDetails = {
        customerEmail: "client@example.com",
        referenceNumber: "#ORD-2024-001",
        orderName: "Custom Woven Labels",
        labelType: "Woven",
        orderDetails: "Custom woven labels with company logo, size specifications: 2x3 inches, material: high-quality polyester, color: navy blue with white text."
    };

    const [details, setDetails] = useState(initialDetails);
    const [isDraftDisabled, setIsDraftDisabled] = useState(true);

    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value
        });
        setIsDraftDisabled(false);
    };

    const handleSaveDraft = () => {
        setIsDraftDisabled(true);
    };

    return (
        <div className="bg-white py-8 rounded-lg">
            {/* Order Details Section */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Customer Email</label>
                    <input
                        type="text"
                        name="customerEmail"
                        value={details.customerEmail}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Reference Number</label>
                    <input
                        type="text"
                        name="referenceNumber"
                        value={details.referenceNumber}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Order Name</label>
                    <input
                        type="text"
                        name="orderName"
                        value={details.orderName}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Label Type</label>
                    <input
                        type="text"
                        name="labelType"
                        value={details.labelType}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
                    />
                </div>
            </div>

            {/* Order Details Text Area */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Order Details</label>
                <textarea
                    name="orderDetails"
                    value={details.orderDetails}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
                    rows="3"
                />
            </div>

            {/* Attachments */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-2 flex flex-wrap gap-2">
                    <span className="flex items-center gap-2 px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-md shadow-sm">
                        <FaFilePdf className="text-red-600" size={18} />
                        design_specs.pdf
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-md shadow-sm">
                        <FaFileImage className="text-blue-600" size={18} />
                        logo.png
                    </span>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-white font-medium border border-gray-400 text-red-600 rounded-md">
                    Delete Order
                </button>

                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isDraftDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
                        }`}
                    onClick={handleSaveDraft}
                    disabled={isDraftDisabled}
                >
                    Save Draft
                </button>

                <button className="px-4 py-2 bg-blue-600 font-medium text-white rounded-md">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
