import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileImage, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { deleteFilesFromStorage, updateOrder, uploadFiles } from "../firebase/order";
import useOrderStore from "../store/orderStore";

export default function OrderDetails() {
    const orderDetails = useOrderStore((state) => state.orderDetails);
    const [removedFiles, setRemovedFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [details, setDetails] = useState({
        customerEmail: "",
        referenceNumber: "",
        orderName: "",
        labelType: "",
        orderDetails: "",
    });
    const [isChangesDisabled, setIsChangesDisabled] = useState(true);

    useEffect(() => {
        if (orderDetails) {
            setDetails({
                customerEmail: orderDetails.customerEmail || "",
                referenceNumber: orderDetails.referenceNumber || "",
                orderName: orderDetails.orderName || "",
                labelType: orderDetails.labelType || "",
                orderDetails: orderDetails.orderDetails || "",
            });

            const uploadedFiles = orderDetails.files?.map(file => ({
                file: null,
                url: file.url,
                name: file.name,
            })) || [];
            setFiles(uploadedFiles);
        }
    }, [orderDetails]);

    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsChangesDisabled(false);
    };

    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value,
        });
        setIsChangesDisabled(false);
    };

    const handleRemoveFile = (index) => {
        const fileToRemove = files[index];
        if (!fileToRemove.file && fileToRemove.url) {
            setRemovedFiles((prev) => [...prev, fileToRemove.url]);
        }
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsChangesDisabled(false);
    };

    const handleSaveChanges = async () => {
        if (!orderDetails?.id || !orderDetails?.referenceNumber) {
            console.error("Order ID or reference number is missing.");
            return;
        }

        try {
            const newFiles = files.filter(f => f.file !== null).map(f => f.file);
            const existingFiles = files.filter(f => f.file === null);
            let uploadedFiles = [];
            if (newFiles.length > 0) {
                uploadedFiles = await uploadFiles(orderDetails.referenceNumber, "order", newFiles);
            }
            const allFiles = [
                ...existingFiles,
                ...uploadedFiles.map(file => ({ file: null, url: file.url, name: file.name })),
            ];
            const updatedDetails = { ...details, files: allFiles };

            if (removedFiles.length > 0) {
                await deleteFilesFromStorage(removedFiles);
                setRemovedFiles([]);
            }

            // Update Firestore with the new details
            await updateOrder(orderDetails.id, updatedDetails);

            // Merge updatedDetails with the existing orderDetails to preserve subcollections
            const mergedOrderDetails = {
                ...orderDetails, // Keep all existing fields, including subcollections
                ...updatedDetails, // Overwrite only the updated top-level fields
                id: orderDetails.id, // Ensure id is preserved
            };

            // Update the store with the merged object
            useOrderStore.setState({ orderDetails: mergedOrderDetails });

            setFiles(allFiles);
            setIsChangesDisabled(true);
        } catch (error) {
            console.error("Error during save:", error);
        }
    };

    const truncateFileName = (name, maxLength = 20) => {
        if (name.length > maxLength) {
            const extIndex = name.lastIndexOf(".");
            const extension = extIndex !== -1 ? name.slice(extIndex) : "";
            const baseName = extIndex !== -1 ? name.slice(0, extIndex) : name;
            return baseName.slice(0, 10) + "..." + baseName.slice(-5) + extension;
        }
        return name;
    };

    const getFileInfo = (file) => {
        const fileName = file.name || file.url.split('/').pop();
        const extension = fileName.split(".").pop().toLowerCase();

        if (["pdf"].includes(extension)) {
            return { icon: <FaFilePdf size={18} className="text-red-600" />, bg: "bg-red-100 text-red-700" };
        }
        if (["jpg", "jpeg", "png"].includes(extension)) {
            return { icon: <FaFileImage size={18} className="text-blue-600" />, bg: "bg-blue-100 text-blue-700" };
        }
        return { icon: <FaFileImage size={18} className="text-gray-600" />, bg: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="bg-white py-8 rounded-lg">
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

            <div className="mb-4">
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

                {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {files.map((file, index) => {
                            const { icon, bg } = getFileInfo(file);
                            return (
                                <div key={index} className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        {icon}
                                        <span className="truncate">{truncateFileName(file.name || "Uploaded File")}</span>
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

            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-white font-medium border border-gray-400 text-red-600 rounded-md">
                    Delete Order
                </button>
                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isChangesDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}`}
                    onClick={handleSaveChanges}
                    disabled={isChangesDisabled}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}