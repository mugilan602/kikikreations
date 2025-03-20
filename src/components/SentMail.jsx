import React from "react";
import { Eye, RefreshCw, Paperclip } from "lucide-react";
import { RiShareForwardFill } from "react-icons/ri";

export default function SentMails() {
    const mails = [
        {
            type: "Sent Order",
            recipient: "client@example.com",
            subject: "Order Confirmation - #ORD-2024-001",
            attachments: 2,
        },
        {
            type: "Sent Production",
            recipient: "supplier@example.com",
            subject: "Production Update - #ORD-2024-001",
            attachments: 1,
        },
    ];

    return (
        <div className="py-8 bg-white rounded-lg">
            <table className="w-full border-collapse">
                {/* Table Head */}
                <thead>
                    <tr className="text-left text-gray-600 text-sm border-b border-t border-gray-400">
                        <th className="py-2 px-4">Type</th>
                        <th className="py-2 px-4">Recipient</th>
                        <th className="py-2 px-4">Subject</th>
                        <th className="py-2 px-4 text-center">Attachments</th>
                        <th className="py-2 px-4 text-center">Actions</th>
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {mails.map((mail, index) => (
                        <tr key={index} className="text-sm text-gray-700 border-b border-gray-400">
                            <td className="py-3 px-4">{mail.type}</td>
                            <td className="py-3 px-4">{mail.recipient}</td>
                            <td className="py-3 px-4">{mail.subject}</td>

                            {/* Attachments Column - Centered */}
                            <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    <Paperclip size={14} className="text-gray-500" />
                                    <span>{mail.attachments} {mail.attachments > 1 ? "files" : "file"}</span>
                                </div>
                            </td>

                            {/* Actions Column - Centered */}
                            <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center space-x-3">
                                    <button className="text-gray-500 hover:text-gray-700">
                                        <Eye size={18} />
                                    </button>
                                    <button className="text-gray-500 hover:text-gray-700">
                                        <RiShareForwardFill size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
