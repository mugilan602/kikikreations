import React, { useState } from "react";

export default function Production() {
    const [files, setFiles] = useState([]);
    const [quantity, setQuantity] = useState("100");
    const [notes, setNotes] = useState(
        "Please ensure all prints are aligned correctly according to the provided design specifications."
    );

    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        setFiles(uploadedFiles);
    };

    return (
        <div className="py-8 bg-white rounded-lg">
            {/* Vendor Email & Quantity */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Vendor Email</label>
                    <input
                        type="text"
                        value="vendor@example.com"
                        readOnly
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            {/* Design Files Upload */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Design Files</label>
                <div
                    className="mt-2 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-500"
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
                        <span className="block text-lg">📤</span>
                        <p className="mt-2 text-sm">Upload a file or drag and drop</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                    </div>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                    <div className="mt-3">
                        {files.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600">
                                📄 {file.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Production Notes */}
            <div className="mb-4">
                <label className="text-sm font-medium text-gray-700">Production Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    rows="3"
                ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md">
                    Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    Send to production
                </button>
            </div>
        </div>
    );
}
