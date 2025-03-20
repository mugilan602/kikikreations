import React, { useState } from "react";
import { Inbox, Mail, Tag } from "lucide-react";

export default function AddNewOrder() {
    const [email, setEmail] = useState("");
    const [orderName, setOrderName] = useState("");
    const [labelType, setLabelType] = useState("");
    const [orderDetails, setOrderDetails] = useState("");
    const [files, setFiles] = useState([]);

    const handleFileUpload = (event) => {
        setFiles([...files, ...event.target.files]);
    };

    return (
        <div className="max-w-lg mx-auto bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add New Order</h2>

            {/* Customer Email */}
            <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Customer Email</label>
                <div className="relative mt-1">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="email"
                        className="border pl-10 pr-3 py-2 rounded w-full focus:ring-2 focus:ring-gray-300"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            {/* Reference Number (Read-Only) */}
            <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Reference Number</label>
                <input
                    type="text"
                    className="border px-3 py-2 rounded w-full bg-gray-100"
                    value="ORD-2024-0001"
                    readOnly
                />
            </div>

            {/* Order Name */}
            <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Order Name</label>
                <div className="relative mt-1">
                    <Tag className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        className="border pl-10 pr-3 py-2 rounded w-full focus:ring-2 focus:ring-gray-300"
                        placeholder="e.g. Winter Collection Labels"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                    />
                </div>
            </div>

            {/* Kind of Label (Dropdown) */}
            <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Kind of Label</label>
                <select
                    className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-gray-300"
                    value={labelType}
                    onChange={(e) => setLabelType(e.target.value)}
                >
                    <option value="">Select a label type</option>
                    <option value="woven">Woven Labels</option>
                    <option value="printed">Printed Labels</option>
                    <option value="care">Care Labels</option>
                </select>
            </div>

            {/* Order Details */}
            <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Order Details</label>
                <textarea
                    className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-gray-300"
                    placeholder="Enter additional details about your order"
                    rows={3}
                    value={orderDetails}
                    onChange={(e) => setOrderDetails(e.target.value)}
                />
            </div>

            {/* File Upload */}
            <div className="mb-3 border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-2 flex flex-col items-center">
                    <Inbox className="text-gray-400" size={32} />
                    <p className="text-gray-600 text-sm">Upload files or drag and drop</p>
                    <p className="text-gray-400 text-xs">PDF, PNG, JPG up to 10MB</p>
                    <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
                <button className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-100">
                    Cancel
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Order
                </button>
            </div>
        </div>
    );
}
