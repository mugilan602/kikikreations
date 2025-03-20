import React, { useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";

export default function Sampling() {
    const [files, setFiles] = useState([]);
    const [isDraftDisabled, setIsDraftDisabled] = useState(true);
    const [isSendEnabled, setIsSendEnabled] = useState(true);

    const initialDetails = {
        vendorEmail: "client@example.com",
        instructions: "Custom woven labels with company logo, size specifications: 2x3 inches, material: high-quality polyester, color: navy blue with white text.",
    };

    const [details, setDetails] = useState(initialDetails);

    // Handle file upload
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsDraftDisabled(false); // Enable "Save Draft" after file upload
        setIsSendEnabled(false); // Reset "Send to Vendor" until draft is saved
    };

    // Handle form input changes
    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value
        });
        setIsDraftDisabled(false); // Enable "Save Draft" on change
        setIsSendEnabled(false); // Reset "Send to Vendor" until draft is saved
    };

    // Remove file from preview
    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsDraftDisabled(false); // Enable "Save Draft" if files change
        setIsSendEnabled(false); // Reset "Send to Vendor" until draft is saved
    };

    // Save draft (mock function)
    const handleSaveDraft = () => {
        console.log("Saving Draft...");
        console.log("Details:", details);
        console.log("Files:", files);
        setIsDraftDisabled(true);
        setIsSendEnabled(true); // Enable "Send to Vendor" after saving
    };

    // Get icon, color, and background based on file type
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
            {/* Vendor Email */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Vendor Email</label>
                <input
                    type="text"
                    name="vendorEmail"
                    value={details.vendorEmail}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white"
                />
            </div>

            {/* File Upload Section */}
            <div className="py-6 bg-white rounded-lg">
                <label className="text-sm font-medium text-gray-700">Attachments</label>

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
                        <p>Upload a file or drag & drop </p>
                        <p className="text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>

                {/* File Preview Badges with Remove Option */}
                {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
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
            </div>

            {/* Sampling Instructions */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Sampling Instructions</label>
                <textarea
                    name="instructions"
                    placeholder="Enter detailed instructions for sampling..."
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    rows="3"
                    value={details.instructions}
                    onChange={handleChange}
                ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-400 text-red-600 font-medium rounded-md">
                    Cancel
                </button>

                {/* Save Draft Button */}
                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isDraftDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
                        }`}
                    onClick={handleSaveDraft}
                    disabled={isDraftDisabled}
                >
                    Save Draft
                </button>

                {/* Send to Vendor Button */}
                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isSendEnabled ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                        }`}
                    disabled={!isSendEnabled}
                >
                    Send to Vendor
                </button>
            </div>
        </div>
    );
}
