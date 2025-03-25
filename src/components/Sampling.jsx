import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";
import useOrderStore from "../store/orderStore";
import { uploadFiles, deleteFilesFromStorage } from "../firebase/order.js";
import { addSamplingToOrder } from "../firebase/sampling.js";

export default function Sampling() {
    const orderDetails = useOrderStore((state) => state.orderDetails);
    const [files, setFiles] = useState([]);
    const [isDraftDisabled, setIsDraftDisabled] = useState(true);
    const [isSendEnabled, setIsSendEnabled] = useState(true);
    const [removedFiles, setRemovedFiles] = useState([]);

    const [details, setDetails] = useState({
        vendorEmail: "",
        samplingInstructions: "",
    });

    useEffect(() => {
        if (orderDetails?.sampling?.length > 0) {
            const firstSampling = orderDetails.sampling[0];

            setDetails({
                vendorEmail: firstSampling.vendorEmail || "",
                samplingInstructions: firstSampling.samplingInstructions || "",
            });

            // Initialize `files` state with existing Firebase URLs
            const uploadedFiles = firstSampling.files?.map(file => ({
                file: null,  // No actual file object, only URL exists
                url: file.url,
                name: file.name,
            })) || [];

            setFiles(uploadedFiles);
        }
    }, [orderDetails]);

    // Handle new file uploads
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    // Handle input changes
    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value
        });
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    // Remove file from preview
    const handleRemoveFile = (index) => {
        const fileToRemove = files[index];

        // If it's an existing file (with a URL), add it to the removal list
        if (!fileToRemove.file && fileToRemove.url) {
            setRemovedFiles([...removedFiles, fileToRemove.url]);
        }

        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    // Save draft
    const handleSaveDraft = async () => {
        if (!orderDetails?.id || !orderDetails?.referenceNumber) {
            alert("Order details are missing.");
            return;
        }

        setIsDraftDisabled(true);
        setIsSendEnabled(false);

        try {
            // Separate new files (File objects) and existing files (URLs)
            const newFiles = files.filter(f => f.file !== null).map(f => f.file);
            const existingFiles = files.filter(f => f.file === null); // Already stored URLs

            // Upload new files if any
            let uploadedFiles = [];
            if (newFiles.length > 0) {
                uploadedFiles = await uploadFiles(orderDetails.referenceNumber, "sampling", newFiles);
            }

            // Merge previously stored files with new uploaded ones
            const allFiles = [
                ...existingFiles, // Keep old files
                ...uploadedFiles.map(file => ({ file: null, url: file.url, name: file.name })) // Add new files
            ];

            const samplingData = {
                vendorEmail: details.vendorEmail || "",
                samplingInstructions: details.samplingInstructions || "",
            };

            // Save data to Firestore
            await addSamplingToOrder(orderDetails.id, samplingData, allFiles);
            if (removedFiles.length > 0) {
                await deleteFilesFromStorage(removedFiles);
                setRemovedFiles([]);
            }
            alert("Draft saved successfully!");

            // Update files state to include both old and new files
            setFiles(allFiles);
            setIsDraftDisabled(true);
            setIsSendEnabled(true);
        } catch (error) {
            alert("Failed to save draft. Please try again.");
            setIsDraftDisabled(false);
        }
    };


    // Get file info based on name or url
    const getFileInfo = (file) => {
        const fileName = file.name || file.url.split('/').pop(); // Extract filename from URL if needed
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
                    placeholder="Enter the Vendor Email"
                    value={details.vendorEmail}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
            </div>

            {/* File Upload Section */}
            <div className="py-6 bg-white rounded-lg">
                <label className="text-sm font-medium text-gray-700">Attachments</label>
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

                {/* File Preview */}
                {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {files.map((file, index) => {
                            const { icon, bg } = getFileInfo(file);
                            return (
                                <div key={index} className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        {icon}
                                        <span className="truncate">{file.name || "Uploaded File"}</span>
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

            {/* Sampling Instructions */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Sampling Instructions</label>
                <textarea
                    name="samplingInstructions"
                    placeholder="Enter detailed instructions for sampling..."
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    rows="3"
                    value={details.samplingInstructions}
                    onChange={handleChange}
                ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-400 text-red-600 font-medium rounded-md">
                    Cancel
                </button>
                <button className={`px-4 py-2 font-medium text-white rounded-md ${isDraftDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}`} onClick={handleSaveDraft} disabled={isDraftDisabled}>
                    Save Draft
                </button>
                <button className={`px-4 py-2 font-medium text-white rounded-md ${isSendEnabled ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`} disabled={!isSendEnabled}>
                    Send to Vendor
                </button>
            </div>
        </div>
    );
}
