import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";

export default function Production() {
    const [vendorEmail, setVendorEmail] = useState("vendor@example.com");
    const [files, setFiles] = useState([]);
    const [quantity, setQuantity] = useState("100");
    const [notes, setNotes] = useState(
        "Please ensure all prints are aligned correctly according to the provided design specifications."
    );
    const [isSaved, setIsSaved] = useState(true); // Track changes

    // Handle file upload
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsSaved(false);
    };

    // Remove file from list
    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsSaved(false);
    };

    // Get file type icon & styles
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

    // Handle input changes & track modifications
    const handleChange = (setter) => (e) => {
        setter(e.target.value);
        setIsSaved(false);
    };

    // Save Draft action
    const handleSaveDraft = () => {
        setIsSaved(true);
    };

    return (
        <div className="py-8 bg-white rounded-lg">
            {/* Vendor Email & Quantity */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Vendor Email</label>
                    <input
                        type="text"
                        value={vendorEmail}
                        onChange={handleChange(setVendorEmail)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleChange(setQuantity)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {/* Design Files Upload */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Design Files</label>

                
                {/* Upload Box */}
                <div
                    className="mt-4 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-500"
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
                        <FaCloudUploadAlt size={30} className="mx-auto" />
                        <p className="text-sm">Upload a file or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>
            </div>
            {/* Uploaded Files List */}
            {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-4">
                    {files.map(({ file, url }, index) => {
                        const { icon, bg } = getFileInfo(file.name);
                        return (
                            <div key={index} className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}>
                                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    {icon}
                                    <span className="truncate">{file.name}</span>
                                </a>
                                {/* Remove File Button */}
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

            {/* Production Notes */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Production Notes</label>
                <textarea
                    value={notes}
                    onChange={handleChange(setNotes)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    rows="3"
                ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-400 text-red-600 font-semibold rounded-md">
                    Cancel
                </button>
                <button
                    onClick={handleSaveDraft}
                    disabled={isSaved}
                    className={`px-4 py-2 font-medium rounded-md ${isSaved ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-600 text-white"
                        }`}
                >
                    Save Draft
                </button>
                <button
                    disabled={!isSaved}
                    className={`px-4 py-2 font-medium rounded-md ${isSaved ? "bg-blue-600 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    Send to production
                </button>
            </div>
        </div>
    );
}
