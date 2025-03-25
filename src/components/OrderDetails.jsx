import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileImage } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import {deleteFilesFromStorage,updateOrder} from "../firebase/order"
import useOrderStore from "../store/orderStore";

export default function OrderDetails() {
    const orderDetails = useOrderStore((state) => state.orderDetails); 
    const [removedFiles, setRemovedFiles] = useState([]);
    const [details, setDetails] = useState({
        customerEmail: "",
        referenceNumber: "",
        orderName: "",
        labelType: "",
        orderDetails: "",
        files: [],
    });

    const [isChangesDisabled, setIsChangesDisabled] = useState(true);
    const handleRemoveFile = (index) => {
        console.log("Removing file at index:", index);

        const fileToRemove = details.files[index];
        console.log("Files to remove: ", fileToRemove);

        // Update removedFiles state using a functional update
        setRemovedFiles((prev) => {
            const updatedRemovedFiles = [...prev, fileToRemove.url];
            console.log("Updated REMOVED FILES:", updatedRemovedFiles); 
            return updatedRemovedFiles;
        });

        // Immediately update UI by removing the file from state
        setDetails((prevDetails) => ({
            ...prevDetails,
            files: prevDetails.files.filter((_, i) => i !== index),
        }));

        setIsChangesDisabled(false);
    };

    // Sync state with store data
    useEffect(() => {
        if (orderDetails) {
            setDetails({
                customerEmail: orderDetails.customerEmail || "",
                referenceNumber: orderDetails.referenceNumber || "",
                orderName: orderDetails.orderName || "",
                labelType: orderDetails.labelType || "",
                orderDetails: orderDetails.orderDetails || "",
                files: orderDetails.files || [],
            });
        }
    }, [orderDetails]);

    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value,
        });
        setIsChangesDisabled(false);
    };

    const handleSaveChanges = async () => {
        console.log(details,orderDetails);
        try {
            if (removedFiles.length > 0) {
                console.log("Deleting selected files from Firebase Storage...");
                await deleteFilesFromStorage(removedFiles);
            }

            console.log("Updating Firestore with new file list...",orderDetails.id);
            await updateOrder(orderDetails.id, details);

            console.log("Firestore update successful.");
            useOrderStore.setState({ orderDetails: {id: orderDetails.id,...details}})
            setRemovedFiles([]);
        } catch (error) {
            console.error("Error during save:", error);
        } finally {
            setIsChangesDisabled(true);
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
    const getFileInfo = (fileName) => ({
        icon: fileName.endsWith(".pdf") ? <FaFilePdf size={18} className="text-red-600" /> : <FaFileImage size={18} className="text-blue-600" />,
        bg: fileName.endsWith(".pdf") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700",
    });

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
                    {details.files.map((file, index) => {
                        const { icon, bg } = getFileInfo(file.name);

                        return (
                            <div key={index} className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    {icon}
                                    <span className="truncate">{truncateFileName(file.name)}</span>
                                </a>

                                {/* Close Button */}
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
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 bg-white font-medium border border-gray-400 text-red-600 rounded-md">
                    Delete Order
                </button>

                <button
                    className={`px-4 py-2 font-medium text-white rounded-md ${isChangesDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
                        }`}
                    onClick={handleSaveChanges}
                    disabled={isChangesDisabled}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}
