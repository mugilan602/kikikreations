import React, { useEffect, useState, useCallback } from "react";
import { Eye, Paperclip, RotateCw } from "lucide-react";
import { RiShareForwardFill } from "react-icons/ri";
import useOrderStore from "../store/orderStore";
import EmailPreview from "./EmailPreview";
import { withEmailPreview } from "./withEmailPreview";
import { getEmailLogs } from "../firebase/emailLog"; // Import email log fetching function

function SentMails({ onSendClick }) {
    const orderDetails = useOrderStore((state) => state.orderDetails);
    const [mails, setMails] = useState([]);
    const [selectedMail, setSelectedMail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to extract filename from URL
    const getFilenameFromUrl = (url) => {
        try {
            // Extract the filename from the URL
            const filenameWithParams = url.split('/').pop();
            // Remove query parameters if present
            const filename = filenameWithParams.split('?')[0];

            // If the filename contains an underscore with timestamp, extract the actual filename
            if (filename.includes('_')) {
                // Pattern: 1744095625366_actualfilename.pdf
                const actualFilename = filename.split('_').slice(1).join('_');
                // URL decode to handle any encoded characters
                return decodeURIComponent(actualFilename);
            }

            return decodeURIComponent(filename);
        } catch (error) {
            console.error("Error extracting filename:", error);
            return "unknown-file";
        }
    };

    // Helper function to determine file type based on extension
    const getFileTypeFromFilename = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();

        if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
            return 'pdf';
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return 'spreadsheet';
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
            return 'image';
        } else {
            return 'pdf'; // Default to pdf type
        }
    };

    // Function to format timestamp to readable date
    const formatDate = (timestamp) => {
        if (!timestamp) return '';

        try {
            // Handle both Firestore timestamp objects and JavaScript Date objects
            if (timestamp.seconds) {
                return new Date(timestamp.seconds * 1000).toLocaleString();
            } else if (timestamp instanceof Date) {
                return timestamp.toLocaleString();
            } else {
                return new Date(timestamp).toLocaleString();
            }
        } catch (error) {
            console.error("Error formatting date:", error);
            return '';
        }
    };

    // Function to fetch email logs from Firestore
    const fetchEmailLogs = useCallback(async () => {
        if (!orderDetails?.id) return;

        setIsLoading(true);
        try {
            // Use the getEmailLogs function to fetch emails directly from Firestore
            const emailLogs = await getEmailLogs(orderDetails.id);
            console.log("Fetched email logs:", emailLogs);
            setMails(emailLogs);

            // Update the store with the fetched logs
            if (emailLogs.length > 0) {
                const updatedOrderDetails = { ...orderDetails, emailLog: emailLogs };
                useOrderStore.setState({ orderDetails: updatedOrderDetails });
            }
        } catch (error) {
            console.error("Error fetching email logs:", error);
            // Fallback to local data if fetch fails
            if (orderDetails?.emailLog?.length > 0) {
                setMails(orderDetails.emailLog);
            } else {
                // Set sample data if nothing else is available
                setSampleData();
            }
        } finally {
            setIsLoading(false);
        }
    }, [orderDetails?.id]);

    // Function to set sample data when no emails exist
    const setSampleData = () => {
        setMails([
            {
                type: "Sent OrderDetails",
                recipient: orderDetails?.customerEmail || "client@example.com",
                from: "orders@company.com",
                subject: `Order Confirmation - #${orderDetails?.referenceNumber || "ORD-2024-001"}`,
                body: `Thank you for your order ${orderDetails?.referenceNumber || ""}. Please review the attached documents.`,
                attachments: orderDetails?.files || [],
                sentAt: new Date(),
                stage: "orderDetails"
            },
            {
                type: "Sent Sampling",
                recipient: orderDetails?.sampling?.[0]?.vendorEmail || "vendor@example.com",
                from: "sampling@company.com",
                subject: `Sampling Request - #${orderDetails?.referenceNumber || "ORD-2024-001"}`,
                body: `We would like to request samples for order ${orderDetails?.referenceNumber || ""}. Please review the attached requirements.`,
                attachments: orderDetails?.sampling?.[0]?.files || [],
                sentAt: new Date(Date.now() - 86400000), // 1 day ago
                stage: "sampling"
            },
            {
                type: "Sent Production",
                recipient: orderDetails?.production?.[0]?.vendorEmail || "production@example.com",
                from: "production@company.com",
                subject: `Production Order - #${orderDetails?.referenceNumber || "ORD-2024-001"}`,
                body: `Please begin production for order ${orderDetails?.referenceNumber || ""}. Production files are attached.`,
                attachments: orderDetails?.production?.[0]?.files || [],
                sentAt: new Date(Date.now() - 172800000), // 2 days ago
                stage: "production"
            },
            {
                type: "Sent Shipment",
                recipient: orderDetails?.shipments?.[0]?.courierEmail || "courier@example.com",
                from: "shipping@company.com",
                subject: `Shipment Update - #${orderDetails?.referenceNumber || "ORD-2024-001"}`,
                body: `Please arrange shipping for order ${orderDetails?.referenceNumber || ""}. Shipping documents are attached.`,
                attachments: orderDetails?.shipments?.[0]?.files || [],
                sentAt: new Date(Date.now() - 259200000), // 3 days ago
                stage: "shipment"
            },
        ]);
    };

    // Initial load and refresh
    useEffect(() => {
        fetchEmailLogs();
    }, [fetchEmailLogs]);

    // Function to handle opening all attachments
    const handleOpenAllAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) {
            console.log("No attachments to open.");
            return;
        }

        // Check if attachments is an array of URLs or objects
        const isUrlArray = typeof attachments[0] === 'string';

        if (isUrlArray) {
            // If attachments are URLs
            attachments.forEach((url) => {
                window.open(url, "_blank", "noopener,noreferrer");
            });
        } else {
            // If attachments are objects with url property
            attachments.forEach((attachment) => {
                window.open(attachment.url, "_blank", "noopener,noreferrer");
            });
        }
    };

    // Function to format attachments for EmailPreview
    const formatAttachmentsForPreview = (attachments, attachmentDetails = []) => {
        // If we have detailed attachment info, use that first
        if (attachmentDetails && attachmentDetails.length > 0) {
            return attachmentDetails.map(att => ({
                name: att.name,
                type: att.type,
                size: att.size || 1.0,
                url: att.url
            }));
        }

        if (!attachments || attachments.length === 0) return [];

        // Check if attachments is an array of URLs or objects
        const isUrlArray = typeof attachments[0] === 'string';

        if (isUrlArray) {
            // Convert URL strings to the format expected by EmailPreview
            return attachments.map(url => {
                const filename = getFilenameFromUrl(url);
                const fileType = getFileTypeFromFilename(filename);

                return {
                    name: filename,
                    type: fileType,
                    size: 1.2, // Default size since we don't have actual file sizes
                    url: url // Keep the original URL for reference
                };
            });
        } else {
            // Attachments are already objects, ensure they have the right format
            return attachments.map(att => ({
                name: att.name || getFilenameFromUrl(att.url),
                type: att.type || getFileTypeFromFilename(att.name || ''),
                size: att.size || 1.0,
                url: att.url
            }));
        }
    };

    // Function to handle opening the email preview
    const handleOpenPreview = (mail) => {
        console.log("Opening preview for mail:", mail);
        setSelectedMail(mail);
    };

    // Function to close the email preview
    const handleClosePreview = () => {
        setSelectedMail(null);
    };

    // Function to handle forwarding an email
    const handleForwardEmail = (mail) => {
        if (!onSendClick || !orderDetails?.id) return;

        // Format attachments for forwarding
        const formattedAttachments = formatAttachmentsForPreview(mail.attachments, mail.attachmentDetails);

        // Prepare the forwarding data
        const forwardData = {
            to: "", // Leave recipient blank for user to fill in
            subject: `FW: ${mail.subject}`,
            body: `\n\n---------- Forwarded message ----------\nFrom: ${mail.from || getSenderEmail(mail.type)}\nTo: ${mail.recipient}\nDate: ${formatDate(mail.sentAt)}\nSubject: ${mail.subject}\n\n${mail.body || ""}`,
            files: formattedAttachments,
            attachments: formattedAttachments,
            orderId: orderDetails.id,
            stage: mail.stage || mail.type?.replace("Sent ", "").toLowerCase(),
            isForwarded: true
        };

        // Call the send function from withEmailPreview HOC
        onSendClick(forwardData);
    };

    // Function to handle resending an email
    const handleResendEmail = (mail) => {
        if (!onSendClick || !orderDetails?.id) return;

        // Format attachments for resending
        const formattedAttachments = formatAttachmentsForPreview(mail.attachments, mail.attachmentDetails);

        // Prepare the resend data - use the original email content
        const resendData = {
            to: mail.recipient,
            subject: mail.subject,
            from: mail.from || getSenderEmail(mail.type),
            body: mail.body || "",
            files: formattedAttachments,
            attachments: formattedAttachments,
            orderId: orderDetails.id,
            stage: mail.stage || mail.type?.replace("Sent ", "").toLowerCase(),
            isResend: true
        };

        // Call the send function from withEmailPreview HOC
        onSendClick(resendData);
    };

    // Callback for when an email is sent - refresh the email list
    const handleEmailSent = useCallback(() => {
        fetchEmailLogs();
    }, [fetchEmailLogs]);

    // Determine sender email based on mail type
    const getSenderEmail = (mailType) => {
        switch (mailType) {
            case "Sent OrderDetails":
                return "orders@company.com";
            case "Sent Sampling":
                return "sampling@company.com";
            case "Sent Production":
                return "production@company.com";
            case "Sent Shipment":
                return "shipping@company.com";
            default:
                return "noreply@company.com";
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 bg-white rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h2 className="text-lg font-semibold">Email History</h2>
                <button
                    onClick={fetchEmailLogs}
                    className="text-blue-600 flex items-center gap-1 text-sm"
                    disabled={isLoading}
                >
                    <RotateCw size={14} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[600px]">
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
                        {isLoading && mails.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    Loading email history...
                                </td>
                            </tr>
                        ) : mails.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    No emails have been sent yet.
                                </td>
                            </tr>
                        ) : (
                            mails.map((mail, index) => (
                                <tr key={index} className="text-sm text-gray-700 border-b border-gray-300">
                                    <td className="py-3 px-4">{mail.type}</td>
                                    <td className="py-3 px-4">{mail.recipient}</td>
                                    <td className="py-3 px-4">{mail.subject}</td>

                                    {/* Attachments Column */}
                                    <td className="py-3 px-4 text-center">
                                        <div
                                            className="flex items-center justify-center space-x-1 cursor-pointer"
                                            onClick={() => handleOpenAllAttachments(mail.attachments)}
                                            title={mail.attachments?.length > 0 ? "Click to open all attachments" : "No attachments"}
                                        >
                                            <Paperclip
                                                size={14}
                                                className={`${mail.attachments?.length > 0
                                                        ? "text-blue-600 hover:text-blue-800"
                                                        : "text-gray-500"
                                                    }`}
                                            />
                                            <span>
                                                {mail.attachments?.length || 0}{" "}
                                                {mail.attachments?.length === 1 ? "file" : "files"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button
                                                className="text-gray-500 hover:text-gray-700"
                                                onClick={() => handleOpenPreview(mail)}
                                                title="View Email Preview"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="text-gray-500 hover:text-gray-700"
                                                onClick={() => handleResendEmail(mail)}
                                                title="Resend Email"
                                            >
                                                <RotateCw size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Email Preview Modal */}
            {selectedMail && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-100 rounded-lg w-full max-w-2xl mx-4 shadow-xl">
                        <EmailPreview
                            subject={selectedMail.subject || ""}
                            from={selectedMail.from || getSenderEmail(selectedMail.type)}
                            to={selectedMail.recipient || ""}
                            body={selectedMail.body || ""}
                            attachments={formatAttachmentsForPreview(
                                selectedMail.attachments,
                                selectedMail.attachmentDetails
                            )}
                            totalSize={(selectedMail.attachments?.length || 0) * 1.2}
                            onClose={handleClosePreview}
                        />
                    </div>
                </div>
            )}
        </div>

    );
}

// Wrap with withEmailPreview HOC to enable forwarding and resending
// Pass the onEmailSent callback to refresh the list after sending
export default withEmailPreview(SentMails, 'sentMail', { onEmailSent: (instance) => instance.handleEmailSent });