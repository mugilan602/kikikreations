import { useState } from "react";
import { FaCloudUploadAlt, FaFilePdf, FaImage, FaSave, FaTimes } from "react-icons/fa";

const CourierPage = () => {
    const [attachments, setAttachments] = useState([
        { name: "Invoice.pdf", type: "pdf" },
        { name: "Package.jpg", type: "image" },
    ]);

    // Handle File Upload
    const handleFileUpload = (event) => {
        const files = event.target.files;
        const newAttachments = [...attachments];

        for (let file of files) {
            const fileType = file.name.endsWith(".pdf") ? "pdf" : "image";
            newAttachments.push({ name: file.name, type: fileType });
        }

        setAttachments(newAttachments);
    };

    // Remove File
    const removeAttachment = (name) => {
        setAttachments(attachments.filter((file) => file.name !== name));
    };

    return (
        <div className="max-w-7xl my-2 mx-auto bg-white p-6">
            {/* Header */}
            <h1 className="text-2xl font-semibold text-black mb-4">Courier Page</h1>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Date</label>
                    <input type="date" className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Courier’s Email</label>
                    <input type="email" placeholder="courier@example.com" className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Reference No.</label>
                    <input type="text" placeholder="REF-2024-001" className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Order Name</label>
                    <input type="text" placeholder="Order #12345" className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Carrier</label>
                    <select className="w-full border px-3 py-2 rounded text-gray-500">
                        <option>Select a carrier</option>
                        <option>FedEx</option>
                        <option>UPS</option>
                        <option>DHL</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Tracking Number</label>
                    <input type="text" placeholder="Enter tracking number" className="w-full border px-3 py-2 rounded" />
                </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Shipping Address</label>
                <textarea placeholder="Enter complete shipping address" className="w-full border px-3 py-2 rounded h-24"></textarea>
            </div>

            {/* Attachments */}
            <div className="border-dashed border-2 border-gray-300 p-6 rounded-lg mb-4 text-center">
                <label htmlFor="fileUpload" className="cursor-pointer">
                    <FaCloudUploadAlt className="text-gray-400 mx-auto text-4xl" />
                    <p className="text-gray-500">Upload files or drag and drop</p>
                    <p className="text-sm text-gray-400">JPG, PNG, PDF, AI up to 10MB</p>
                </label>
                <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                />
            </div>

            {/* Uploaded Files */}
            <div className="mb-4">
                {attachments.map((file) => (
                    <div key={file.name} className="flex justify-between items-center bg-gray-100 p-3 rounded mb-2">
                        <div className="flex items-center space-x-2">
                            {file.type === "pdf" ? <FaFilePdf className="text-red-600" /> : <FaImage className="text-blue-600" />}
                            <span>{file.name}</span>
                        </div>
                        <button onClick={() => removeAttachment(file.name)} className="text-gray-500 hover:text-red-600">
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>

            {/* Important Remarks */}
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Important Remarks</label>
                <textarea placeholder="Enter any special instructions or important notes" className="w-full border px-3 py-2 rounded h-24"></textarea>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center space-x-2 font-medium shadow hover:bg-blue-700">
                    <FaSave className="text-white text-lg" />
                    <span>Save Shipment Details</span>
                </button>
            </div>
        </div>
    );
};

export default CourierPage;
