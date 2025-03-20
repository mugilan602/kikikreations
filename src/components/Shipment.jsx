import React, { useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";

export default function Shipment() {
    const [shipmentData, setShipmentData] = useState({
        courierEmail: "courier@shipping.com",
        referenceNumber: "#ORD-2024-001",
        orderName: "Summer Collection 2024",
        labelType: "Woven",
        orderDetails: "",
    });

    const [files, setFiles] = useState([]);
    const [isDraftDisabled, setIsDraftDisabled] = useState(true);
    const [isSendEnabled, setIsSendEnabled] = useState(true);

    // Handle input changes
    const handleChange = (e) => {
        setShipmentData({
            ...shipmentData,
            [e.target.name]: e.target.value,
        });
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file), // Generate preview URL
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    // Remove file from preview
    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    // Save draft function
    const handleSaveDraft = () => {
        console.log("Draft Saved:", shipmentData, files);
        setIsDraftDisabled(true);
        setIsSendEnabled(true);
    };

    // Get icon and background based on file type
    const getFileInfo = (fileName) => {
        const extension = fileName.split(".").pop().toLowerCase();
        if (["pdf"].includes(extension)) {
            return { icon: <FaFilePdf className="text-red-600" />, bg: "bg-red-100 text-red-700" };
        }
        if (["jpg", "jpeg", "png"].includes(extension)) {
            return { icon: <FaFileImage className="text-blue-600" />, bg: "bg-blue-100 text-blue-700" };
        }
        return { icon: <FaFileAlt className="text-gray-600" />, bg: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="py-8 bg-white rounded-lg">
            {/* Courier Email & Reference Number */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Courier Email</label>
                    <input
                        type="email"
                        name="courierEmail"
                        value={shipmentData.courierEmail}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Reference Number</label>
                    <input
                        type="text"
                        name="referenceNumber"
                        value={shipmentData.referenceNumber}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {/* Order Name & Label Type */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Order Name</label>
                    <input
                        type="text"
                        name="orderName"
                        value={shipmentData.orderName}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Label Type</label>
                    <input
                        type="text"
                        name="labelType"
                        value={shipmentData.labelType}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {/* Order Details */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Order Details</label>
                <textarea
                    name="orderDetails"
                    placeholder="Enter shipping instructions or remarks..."
                    value={shipmentData.orderDetails}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    rows="3"
                ></textarea>
            </div>

            {/* Attachments */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
                <div
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-500"
                    onClick={() => document.getElementById("fileUpload").click()}
                >
                    <input
                        type="file"
                        id="fileUpload"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".png,.jpg,.jpeg,.pdf"
                    />
                    <div className="text-gray-500">
                        <FaCloudUploadAlt size={25} className="mx-auto" />
                        <p className="text-sm">Upload a file or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-4">
                        {files.map(({ file, url }, index) => {
                            const { icon, bg } = getFileInfo(file.name);
                            return (
                                <div key={index} className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}>
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        {icon}
                                        <span className="truncate">{file.name}</span>
                                    </a>
                                    <button
                                        onClick={() => handleRemoveFile(index)}
                                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-400 text-red-600 font-medium rounded-md">
                    Cancel
                </button>

                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isDraftDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}`}
                    onClick={handleSaveDraft}
                    disabled={isDraftDisabled}
                >
                    Save Draft
                </button>

                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isSendEnabled ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`}
                    disabled={!isSendEnabled}
                >
                    Send to Shipment
                </button>
            </div>
        </div>
    );
}
