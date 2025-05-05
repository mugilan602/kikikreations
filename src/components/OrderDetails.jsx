import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileImage, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { deleteFilesFromStorage, updateOrder, uploadFiles, deleteOrder } from "../firebase/order";
import useOrderStore from "../store/orderStore";
import { withEmailPreview } from "./withEmailPreview"; // Import the HOC
import DeleteConfirmationModal from "./DeleteConfirmationModal"; // Import the modal
import { useToast } from "./ToastContext"; // Import the toast context

function OrderDetails({ onSendClick }) {
    const orderDetails = useOrderStore((state) => state.orderDetails);
    const setOrderDetails = useOrderStore((state) => state.setOrderDetails);
    const orders = useOrderStore((state) => state.orders); // Get orders array
    const setOrders = useOrderStore((state) => state.setOrders); // Get setter for orders
    const { showToast } = useToast(); // Use the toast context
    const [changes, setChanges] = useState(false);
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
    const [canSendEmail, setCanSendEmail] = useState(false);

    // Delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

            // Enable send button if we have customer email
            setCanSendEmail(!!orderDetails.customerEmail);

            // Ensure the status is set if not already present
            if (!orderDetails.status) {
                const updatedOrderDetails = {
                    ...orderDetails,
                    status: "order-details" // Default status for new orders
                };

                // Update both orderDetails and the orders array
                setOrderDetails(updatedOrderDetails);

                // Also update the status in Firestore if it doesn't exist
                updateOrder(orderDetails.id, { status: "order-details" })
                    .catch(error => console.error("Error updating order status:", error));
            }
        }
    }, [orderDetails, setOrderDetails]);

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
            setChanges(true);
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
            const updatedDetails = { ...details, files: allFiles.map(file => ({ url: file.url, name: file.name })) };

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

            // Update the order in the orders array
            const updatedOrders = orders.map(order =>
                order.id === orderDetails.id
                    ? {
                        ...order,
                        ...updatedDetails,
                        id: orderDetails.id,
                    }
                    : order
            );
            setOrders(updatedOrders);

            setFiles(allFiles);
            setIsChangesDisabled(true);
            setCanSendEmail(!!details.customerEmail); // Enable send button if we have customer email

            // Show success toast
            showToast("Changes saved successfully", "success");
        } catch (error) {
            console.error("Error during save:", error);
            showToast(`Failed to save changes: ${error.message}`, "error");
        } finally {
            setChanges(false);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!orderDetails?.id) return;

        setIsDeleting(true);
        try {
            // Delete the order from Firestore
            await deleteOrder(orderDetails.id);

            // Remove the order from the local orders array
            const updatedOrders = orders.filter(order => order.id !== orderDetails.id);
            setOrders(updatedOrders);

            // Clear the order details from the store
            setOrderDetails(null);

            // Show success toast
            showToast(`Order ${orderDetails.referenceNumber || orderDetails.id} deleted successfully`, "success");

            // Close the modal
            setIsDeleteModalOpen(false);

        } catch (error) {
            console.error("Error deleting order:", error);
            showToast(`Failed to delete order: ${error.message}`, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSendEmail = () => {
        if (!onSendClick || !orderDetails?.id) return;

        // Make sure we have valid data
        if (!details.customerEmail) {
            alert("Customer email is required");
            return;
        }

        onSendClick({
            to: details.customerEmail,
            referenceNumber: details.referenceNumber,
            orderName: details.orderName,
            labelType: details.labelType,
            orderDetails: details.orderDetails,
            files: files,
            orderId: orderDetails.id
        });
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                        <p>Upload a file or tap here</p>
                        <p className="text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </label>


                {files.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {files.map((file, index) => {
                            const { icon, bg } = getFileInfo(file);
                            return (
                                <div
                                    key={index}
                                    className={`relative flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm ${bg} text-sm font-medium max-w-full`}
                                >
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 truncate max-w-[200px]"
                                    >
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

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button
                    className="px-4 py-2 bg-white font-medium border border-gray-400 text-red-600 rounded-md hover:bg-red-50 w-full sm:w-auto"
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                >
                    {isDeleting ? "Deleting..." : "Delete Order"}
                </button>
                <button
                    className={`px-4 py-2 font-medium text-white rounded-md flex items-center justify-center gap-2 w-full sm:w-auto ${(isChangesDisabled || changes)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    onClick={handleSaveChanges}
                    disabled={isChangesDisabled || changes}
                >
                    {changes && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )
                    }
                    {changes ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                isDeleting={isDeleting}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Order"
                message={`Are you sure you want to delete order ${orderDetails?.referenceNumber || ""}? This action cannot be undone.`}
            />
        </div>


    );
}

// Export with the HOC wrapper
export default withEmailPreview(OrderDetails, 'orderDetails');