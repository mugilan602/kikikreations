import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";
import useOrderStore from "../store/orderStore";
import { uploadFiles, deleteFilesFromStorage } from "../firebase/order.js";
import { addSamplingToOrder } from "../firebase/sampling.js";
import { withEmailPreview } from "./withEmailPreview";

function Sampling({ onSendClick }) {
    const orderDetails = useOrderStore((state) => state.orderDetails);
    const [files, setFiles] = useState([]);
    const [isDraftDisabled, setIsDraftDisabled] = useState(true);
    const [isSendEnabled, setIsSendEnabled] = useState(false);
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

            const uploadedFiles = firstSampling.files?.map(file => ({
                file: null,
                url: file.url,
                name: file.name,
            })) || [];
            setFiles(uploadedFiles);

            // If we have vendor email and either instructions or files, enable send button
            setIsSendEnabled(
                !!firstSampling.vendorEmail &&
                (!!firstSampling.samplingInstructions || uploadedFiles.length > 0)
            );
        }
    }, [orderDetails]);

    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files).map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setFiles([...files, ...uploadedFiles]);
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value,
        });
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    const handleRemoveFile = (index) => {
        const fileToRemove = files[index];
        if (!fileToRemove.file && fileToRemove.url) {
            setRemovedFiles([...removedFiles, fileToRemove.url]);
        }
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    const handleSaveDraft = async () => {
        if (!orderDetails?.id || !orderDetails?.referenceNumber) {
            alert("Order details are missing.");
            return;
        }

        setIsDraftDisabled(true);
        setIsSendEnabled(false);

        try {
            const newFiles = files.filter(f => f.file !== null).map(f => f.file);
            const existingFiles = files.filter(f => f.file === null);
            let uploadedFiles = [];
            if (newFiles.length > 0) {
                uploadedFiles = await uploadFiles(orderDetails.referenceNumber, "sampling", newFiles);
            }

            const allFiles = [
                ...existingFiles,
                ...uploadedFiles.map(file => ({ file: null, url: file.url, name: file.name })),
            ];

            const samplingData = {
                vendorEmail: details.vendorEmail || "",
                samplingInstructions: details.samplingInstructions || "",
                files: allFiles.map(({ url, name }) => ({ url, name })),
                updatedAt: new Date(),
            };

            // Save to Firestore and get the sampling document ID
            const samplingId = await addSamplingToOrder(orderDetails.id, samplingData, allFiles);

            if (removedFiles.length > 0) {
                await deleteFilesFromStorage(removedFiles);
                setRemovedFiles([]);
            }

            // Construct the updated sampling object
            const updatedSampling = {
                ...samplingData,
                id: samplingId,
                ...(orderDetails.sampling?.length > 0
                    ? { createdAt: orderDetails.sampling[0].createdAt } // Preserve original createdAt if updating
                    : { createdAt: new Date() }), // Add createdAt if new
            };

            // Update the sampling array in orderDetails
            const updatedSamplingArray = orderDetails.sampling?.length > 0
                ? orderDetails.sampling.map((sampling, index) =>
                    index === 0 ? updatedSampling : sampling)
                : [updatedSampling];

            const mergedOrderDetails = {
                ...orderDetails,
                sampling: updatedSamplingArray,
            };

            // Update the store
            useOrderStore.setState({ orderDetails: mergedOrderDetails });

            // Update local files state
            setFiles(allFiles);
            setIsDraftDisabled(true);

            // Enable send button if we have vendor email and either instructions or files
            setIsSendEnabled(
                !!details.vendorEmail &&
                (!!details.samplingInstructions || allFiles.length > 0)
            );

            alert("Draft saved successfully!");
        } catch (error) {
            alert("Failed to save draft. Please try again.");
            setIsDraftDisabled(false);
            console.error("Error saving draft:", error);
        }
    };

    const handleSendEmail = () => {
        if (!onSendClick || !orderDetails?.id) return;

        // Make sure we have valid data
        if (!details.vendorEmail) {
            alert("Vendor email is required");
            return;
        }

        onSendClick({
            to: details.vendorEmail,
            samplingInstructions: details.samplingInstructions,
            files: files,
            orderId: orderDetails.id
        });
    };

    const getFileInfo = (file) => {
        const fileName = file.name || file.url.split('/').pop();
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
                    onClick={handleSendEmail}
                    disabled={!isSendEnabled}
                >
                    Send to Vendor
                </button>
            </div>
        </div>
    );
}

export default withEmailPreview(Sampling, 'sampling');