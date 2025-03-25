import React, { useState, useRef } from "react";
import { Inbox, Mail, Tag } from "lucide-react";
import { createOrder ,uploadFiles} from "../firebase/order.js";
export default function AddNewOrder({ setOpen }) {
    const [customerEmail, setEmail] = useState("");
    const [orderName, setOrderName] = useState("");
    const [labelType, setLabelType] = useState("");
    const [orderDetails, setOrderDetails] = useState("");
    const [referenceNumber, setReferenceNumber] = useState("");
    const [files, setFiles] = useState([]);

    const fileInputRef = useRef(null); 

    const handleFileUpload = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles([...files, ...selectedFiles]);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click(); 
    };
    const handleSubmit = async () => {
        try {
            if (!referenceNumber || files.length === 0) {
                console.error("Reference number and files are required!");
                return;
            }

            console.log("Uploading files...");

            // Upload files to Firebase Storage and get download URLs
            const uploadedFiles = await uploadFiles(referenceNumber, "orderDetails", files);

            console.log("Uploaded Files:", uploadedFiles);

            // Prepare order data with file URLs
            const orderData = {
                customerEmail,
                referenceNumber,
                orderName,
                labelType,
                orderDetails,
                files: uploadedFiles, // Store uploaded files with URLs
            };

            console.log("Order Data JSON:", JSON.stringify(orderData, null, 2));

            // Create order in Firestore
            const response = await createOrder(orderData);
            console.log("Order Created Successfully:", response);

        } catch (error) {
            console.error("Error in handleSubmit:", error);
        }

        setOpen(false);
    };

    return (
        <div className="w-full bg-white  max-h-[80vh] overflow-y-auto">
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
                        value={customerEmail}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
            </div>

            {/* Reference Number */}
            <div className="mb-3">
                <label className="text-sm font-medium text-gray-700">Reference Number</label>
                <input
                    type="text"
                    className="border px-3 py-2 rounded w-full"
                    placeholder="ORD-2024-0001"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
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
            <div
                className="mb-3 border-dashed border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                onClick={handleUploadClick}
            >
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <div className="mt-2 flex flex-col items-center">
                    <Inbox className="text-gray-400" size={32} />
                    <p className="text-gray-600 text-sm">Click to upload files</p>
                    <p className="text-gray-400 text-xs">PDF, PNG, JPG up to 10MB</p>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                />
            </div>

            {/* Show Uploaded Files */}
            {files.length > 0 && (
                <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                    <ul className="list-disc ml-5 text-sm text-gray-600">
                        {files.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => setOpen(false)}
                    className="border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-100">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Order
                </button>
            </div>
        </div>
    );
}
