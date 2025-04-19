import React, { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaFileImage, FaFileAlt, FaTimes } from "react-icons/fa";
import useOrderStore from "../store/orderStore";
import { uploadFiles, deleteFilesFromStorage } from "../firebase/order.js";
import { addProductionToOrder } from "../firebase/production.js";
import { addShipmentToOrder } from "../firebase/shipment.js";
import { withEmailPreview } from "./withEmailPreview";

function Production({ onSendClick }) {
    const orderDetails = useOrderStore((state) => state.orderDetails);

    const [files, setFiles] = useState([]);
    const [isDraftDisabled, setIsDraftDisabled] = useState(true);
    const [isSendEnabled, setIsSendEnabled] = useState(false);
    const [removedFiles, setRemovedFiles] = useState([]);

    // Store original data for cancel functionality
    const [originalDetails, setOriginalDetails] = useState({
        vendorEmail: "",
        quantity: "",
        notes: "",
    });
    const [originalFiles, setOriginalFiles] = useState([]);

    const [details, setDetails] = useState({
        vendorEmail: "",
        quantity: "",
        notes: "",
    });

    useEffect(() => {
        if (orderDetails?.production?.length > 0) {
            const firstProduction = orderDetails.production[0];

            const initialDetails = {
                vendorEmail: firstProduction.vendorEmail || "",
                quantity: firstProduction.quantity || "",
                notes: firstProduction.notes || "",
            };

            setDetails(initialDetails);
            // Store original details for cancel functionality
            setOriginalDetails(initialDetails);

            const uploadedFiles = firstProduction.files?.map(file => ({
                file: null,
                url: file.url,
                name: file.name,
            })) || [];

            setFiles(uploadedFiles);
            // Store original files for cancel functionality
            setOriginalFiles([...uploadedFiles]);

            // Enable send button if vendorEmail exists and either notes or files are present
            setIsSendEnabled(
                !!firstProduction.vendorEmail &&
                (uploadedFiles.length > 0 || !!firstProduction.notes || !!firstProduction.quantity)
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

    const handleChange = (e) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value,
        });
        setIsDraftDisabled(false);
        setIsSendEnabled(false);
    };

    const handleCancel = () => {
        // Reset to original values
        setDetails({ ...originalDetails });
        setFiles([...originalFiles]);
        setRemovedFiles([]);

        // Reset buttons state
        setIsDraftDisabled(true);

        // Restore send button state based on original data
        setIsSendEnabled(
            !!originalDetails.vendorEmail &&
            (originalFiles.length > 0 || !!originalDetails.notes || !!originalDetails.quantity)
        );
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
            quantity: details.quantity,
            notes: details.notes,
            files: files,
            orderId: orderDetails.id
        });
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
            let uploadedProductionFiles = [];
            let uploadedShipmentFiles = [];

            if (newFiles.length > 0) {
                uploadedProductionFiles = await uploadFiles(orderDetails.referenceNumber, "production", newFiles);
                uploadedShipmentFiles = await uploadFiles(orderDetails.referenceNumber, "shipment", newFiles);
            }

            const allProductionFiles = [
                ...existingFiles,
                ...uploadedProductionFiles.map(file => ({
                    file: null,
                    url: file.url,
                    name: file.name,
                })),
            ];

            const productionData = {
                vendorEmail: details.vendorEmail || "",
                quantity: details.quantity || "",
                notes: details.notes || "",
                files: allProductionFiles.map(({ url, name }) => ({ url, name })),
                updatedAt: new Date(),
            };

            const productionId = await addProductionToOrder(orderDetails.id, productionData, allProductionFiles);

            if (removedFiles.length > 0) {
                await deleteFilesFromStorage(removedFiles);
                setRemovedFiles([]);
            }

            const updatedProduction = {
                ...productionData,
                id: productionId,
                ...(orderDetails.production?.length > 0
                    ? { createdAt: orderDetails.production[0].createdAt }
                    : { createdAt: new Date() }),
            };

            const updatedProductionArray = orderDetails.production?.length > 0
                ? orderDetails.production.map((production, index) =>
                    index === 0 ? updatedProduction : production
                )
                : [updatedProduction];

            const existingShipment = orderDetails.shipments?.length > 0 ? orderDetails.shipments[0] : null;
            const existingShipmentFiles = existingShipment?.files || [];

            const allShipmentFiles = [
                ...existingShipmentFiles.filter(shipFile =>
                    !uploadedShipmentFiles.some(newFile => newFile.name === shipFile.name)
                ),
                ...uploadedShipmentFiles.map(file => ({
                    file: null,
                    url: file.url,
                    name: file.name,
                })),
            ];

            const shipmentData = {
                courierEmail: existingShipment?.courierEmail || "",
                referenceNumber: existingShipment?.referenceNumber || orderDetails.referenceNumber || "",
                orderName: existingShipment?.orderName || orderDetails.orderName || "",
                labelType: existingShipment?.labelType || orderDetails.labelType || "",
                orderDetails: existingShipment?.orderDetails || "",
                files: allShipmentFiles.map(({ url, name }) => ({ url, name })),
                updatedAt: new Date(),
            };

            const shipmentId = await addShipmentToOrder(orderDetails.id, shipmentData, allShipmentFiles);

            const updatedShipment = {
                ...shipmentData,
                id: shipmentId,
                ...(existingShipment
                    ? { createdAt: existingShipment.createdAt }
                    : { createdAt: new Date() }),
            };

            const updatedShipmentsArray = orderDetails.shipments?.length > 0
                ? orderDetails.shipments.map((shipment, index) =>
                    index === 0 ? updatedShipment : shipment
                )
                : [updatedShipment];

            const mergedOrderDetails = {
                ...orderDetails,
                production: updatedProductionArray,
                shipments: updatedShipmentsArray,
            };

            useOrderStore.setState({ orderDetails: mergedOrderDetails });
            setFiles(allProductionFiles);
            setIsDraftDisabled(true);

            // Update original values with new saved values
            setOriginalDetails({ ...details });
            setOriginalFiles([...allProductionFiles]);

            setIsSendEnabled(
                !!details.vendorEmail &&
                (allProductionFiles.length > 0 || !!details.notes || !!details.quantity)
            );

            alert("Draft saved successfully! Production files added to shipments.");
        } catch (error) {
            alert("Failed to save draft. Please try again.");
            setIsDraftDisabled(false);
            console.error("Error saving draft:", error);
        }
    };

    const getFileInfo = (file) => {
        const fileName = file.name || file.url.split('/').pop();
        const extension = fileName && fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "unknown";

        if (["pdf"].includes(extension)) {
            return { icon: <FaFilePdf className="text-red-600" />, bg: "bg-red-100 text-red-700" };
        }
        if (["jpg", "jpeg", "png"].includes(extension)) {
            return { icon: <FaFileImage className="text-blue-600" />, bg: "bg-blue-100 text-blue-700" };
        }
        return { icon: <FaFileAlt className="text-gray-600" />, bg: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="py-8 bg-white rounded-lg ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Design Files</label>
                <label
                    htmlFor="fileUpload"
                    className="mt-4 block border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-500 relative"
                >
                    <input
                        type="file"
                        id="fileUpload"
                        multiple
                        accept=".png,.jpg,.jpeg,.pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-gray-500 pointer-events-none">
                        <FaCloudUploadAlt size={30} className="mx-auto" />
                        <p className="text-sm">Upload a file or tap here</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </label>

            </div>

            {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                    {files.map((file, index) => {
                        const { icon, bg } = getFileInfo(file);
                        return (
                            <div
                                key={index}
                                className={`relative inline-flex items-center max-w-full px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium`}
                            >
                                <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 truncate max-w-[200px] sm:max-w-[250px]"
                                >
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

            <div className="mb-4 mt-4">
                <label className="text-sm font-medium text-gray-700">Production Notes</label>
                <textarea
                    placeholder="Enter the production notes"
                    name="notes"
                    value={details.notes}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    rows="3"
                />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                    className="px-4 py-2 border border-gray-400 text-red-600 font-semibold rounded-md hover:bg-red-50"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveDraft}
                    disabled={isDraftDisabled}
                    className={`px-4 py-2 font-medium rounded-md ${isDraftDisabled ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-600 text-white"
                        }`}
                >
                    Save Draft
                </button>
                <button
                    onClick={handleSendEmail}
                    disabled={!isSendEnabled}
                    className={`px-4 py-2 font-medium rounded-md ${isSendEnabled ? "bg-blue-600 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    Send to Production
                </button>
            </div>
        </div>

    );
}

export default withEmailPreview(Production, "production");