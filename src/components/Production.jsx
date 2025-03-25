import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";
import useOrderStore from "../store/orderStore";
import { uploadFiles, deleteFilesFromStorage } from "../firebase/order.js";
import { addProductionToOrder } from "../firebase/production.js";
export default function Production() {
    const orderDetails = useOrderStore((state) => state.orderDetails);

    const [files, setFiles] = useState([]);
    const [isSaved, setIsSaved] = useState(true); // Track if changes exist

    const [removedFiles, setRemovedFiles] = useState([]);

    const [details, setDetails] = useState({
        vendorEmail: "",
        quantity: "",
        notes: "",
    });
    useEffect(() => {
        if (orderDetails?.production?.length > 0) {
            const firstProduction = orderDetails.production[0];
            setDetails({
                vendorEmail: firstProduction.vendorEmail || "",
                quantity: firstProduction.quantity || "",
                notes: firstProduction.notes || "",
            })
            const uploadedFiles = firstProduction.files?.map(file => ({
                file: null,  // No actual file object, only URL exists
                url: file.url,
                name: file.name,
            })) || [];

            setFiles(uploadedFiles);
        }
    }, [])
    // Handle file upload
    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsSaved(false);
    };

    // Remove file from list
    const handleRemoveFile = (index) => {
        const fileToRemove = files[index];

        // If it's an existing file (with a URL), add it to the removal list
        if (!fileToRemove.file && fileToRemove.url) {
            setRemovedFiles([...removedFiles, fileToRemove.url]);
        }

        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsSaved(false);
    };

    // Handle input changes
    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value
        });
        setIsSaved(false);
    };

    // Save Draft action
    const handleSaveDraft = async () => {
        if (!orderDetails?.id) {
            alert("Order details are missing.");
            return;
        }

        setIsSaved(true);

        try {
            // Separate new files (File objects) and existing files (URLs)
            const newFiles = files.filter(f => f.file !== null).map(f => f.file);
            const existingFiles = files.filter(f => f.file === null); // Already stored URLs

            // Upload new files if any
            let uploadedFiles = [];
            if (newFiles.length > 0) {
                uploadedFiles = await uploadFiles(orderDetails.referenceNumber, "production", newFiles);
            }

            // Merge previously stored files with new uploaded ones
            const allFiles = [
                ...existingFiles, // Keep old files
                ...uploadedFiles.map(file => ({ file: null, url: file.url, name: file.name })) // Add new files
            ];

            const productionData = {
                vendorEmail: details.vendorEmail || "",
                quantity: details.quantity || "",
                notes: details.notes || "",
            };

            // Save data to Firestore
            await addProductionToOrder(orderDetails.id, productionData, allFiles);
            if (removedFiles.length > 0) {
                await deleteFilesFromStorage(removedFiles);
                setRemovedFiles([]);
            }
            alert("Draft saved successfully!");

            // Update files state to include both old and new files
            setFiles(allFiles);
            setIsSaved(true);
        } catch (error) {
            alert("Failed to save draft. Please try again.");
            setIsSaved(false);
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
            {/* Vendor Email & Quantity */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Vendor Email</label>
                    <input
                        placeholder="Enter the Vendor Email"
                        type="email"
                        name="vendorEmail"
                        value={details.vendorEmail}
                        onChange={handleChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        placeholder="Quantity"
                        type="number"
                        name="quantity"
                        value={details.quantity}
                        onChange={handleChange}
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
                    {files.map((file, index) => {
                        const { icon, bg } = getFileInfo(file);
                        return (
                            <div key={index} className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
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
                    placeholder="Enter the production notes"
                    name="notes"
                    value={details.notes}
                    onChange={handleChange}
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
