// withEmailPreview.jsx
import React, { useState, useEffect } from "react";
import EmailPreview from "./EmailPreview";
import { logEmail } from "../firebase/emailLog.js"; // Import the email logging function
import useOrderStore from "../store/orderStore";

export const withEmailPreview = (WrappedComponent, stageName) => {
    return function WithEmailPreviewComponent(props) {
        const orderDetails = useOrderStore((state) => state.orderDetails);
        const [showEmailPreview, setShowEmailPreview] = useState(false);
        const [emailData, setEmailData] = useState({
            subject: "",
            from: "",
            to: "",
            body: "",
            attachments: [],
            totalSize: 0,
            stage: stageName,
            orderId: "",
        });
        const [isSending, setIsSending] = useState(false);
        const [sendError, setSendError] = useState(null);

        useEffect(() => {
            if (showEmailPreview) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "auto";
            }
            return () => {
                document.body.style.overflow = "auto";
            };
        }, [showEmailPreview]);

        const handleSendClick = (data) => {
            console.log("Raw data received from component:", data);

            // Make sure we have the order ID
            const orderId = orderDetails?.id || data.orderId || "";
            if (!orderId) {
                console.error("Order ID is missing");
                return;
            }

            // If this is a resend or forward, use the provided data with minimal processing
            if (data.isResend || data.isForwarded) {
                const totalSize = (data.attachments || data.files || []).reduce((sum, file) => sum + (file.size || 1.0), 0);

                setEmailData({
                    subject: data.subject,
                    from: data.from,
                    to: data.to,
                    body: data.body,
                    attachments: data.attachments || data.files || [],
                    totalSize,
                    stage: data.stage || stageName,
                    orderId: orderId,
                    type: data.isResend
                        ? data.type || `Sent ${(data.stage || stageName).charAt(0).toUpperCase() + (data.stage || stageName).slice(1)}`
                        : `Forwarded ${(data.stage || stageName).charAt(0).toUpperCase() + (data.stage || stageName).slice(1)}`,
                    isResend: data.isResend,
                    isForwarded: data.isForwarded
                });

                setSendError(null);
                setShowEmailPreview(true);
                return;
            }

            // Get data based on component type
            const emailTo = data.to || data.customerEmail || data.vendorEmail || data.courierEmail || "";
            if (!emailTo) {
                console.error("Recipient email is missing");
                alert("Recipient email is required");
                return;
            }

            let subject, from, body;

            // Create standardized email content based on stage
            switch (stageName) {
                case "orderDetails":
                    subject = `Order Confirmation: ${orderDetails?.referenceNumber || "New Order"}`;
                    from = "orders@company.com";
                    body = `Hi,

Thank you for your order ${orderDetails?.referenceNumber || ""}.

Order Details:
- Order Name: ${data.orderName || orderDetails?.orderName || ""}
- Reference Number: ${data.referenceNumber || orderDetails?.referenceNumber || ""}
- Label Type: ${data.labelType || orderDetails?.labelType || ""}

${data.orderDetails || data.notes || ""}

Please let us know if you have any questions.

Thank you,
The Team`;
                    break;

                case "sampling":
                    subject = `Sampling Request: ${orderDetails?.referenceNumber || ""}`;
                    from = "sampling@company.com";
                    body = `Hi,

We would like to request samples for the following order:

Order Details:
- Reference Number: ${orderDetails?.referenceNumber || ""}
- Order Name: ${orderDetails?.orderName || ""}

Sampling Instructions:
${data.samplingInstructions || data.instructions || data.notes || ""}

Please review the attached files and let us know if you have any questions.

Thank you,
The Team`;
                    break;

                case "production":
                    subject = `Production Request: ${orderDetails?.referenceNumber || ""}`;
                    from = "production@company.com";
                    body = `Hi,

We would like to start production for the following order:

Order Details:
- Reference Number: ${orderDetails?.referenceNumber || ""}
- Order Name: ${orderDetails?.orderName || ""}
- Quantity: ${data.quantity || ""}

Production Notes:
${data.notes || ""}

Please review the attached files and let us know if you have any questions.

Thank you,
The Team`;
                    break;

                case "shipment":
                    subject = `Shipment Request: ${orderDetails?.referenceNumber || ""}`;
                    from = "shipping@company.com";
                    body = `Hi,

Please find the shipping details for the following order:

Order Details:
- Reference Number: ${data.referenceNumber || orderDetails?.referenceNumber || ""}
- Order Name: ${data.orderName || orderDetails?.orderName || ""}
- Label Type: ${data.labelType || orderDetails?.labelType || ""}

Additional Information:
${data.orderDetails || data.details || data.notes || ""}

Please review the attached files and proceed with the shipment.

Thank you,
The Team`;
                    break;

                case "sentMail":
                    // Special case for sent mail forwarding
                    subject = data.subject || `Information: ${orderDetails?.referenceNumber || ""}`;
                    from = data.from || "noreply@company.com";
                    body = data.body || "";
                    break;

                default:
                    subject = `Order Information: ${orderDetails?.referenceNumber || ""}`;
                    from = "noreply@company.com";
                    body = "";
            }

            // Process attachments - handle various formats of incoming file data
            const attachments = [];

            // Handle different ways files might be passed
            const fileSource = data.files || data.attachments || [];
            console.log("File source:", fileSource);

            if (Array.isArray(fileSource)) {
                fileSource.forEach(file => {
                    if (!file) return;

                    const fileUrl = file.url || file;
                    if (!fileUrl) return;

                    const fileName = file.name || (typeof fileUrl === 'string' ? fileUrl.split("/").pop() : "file");
                    const extension = fileName.split(".").pop().toLowerCase();
                    const fileType =
                        ["pdf", "doc", "docx"].includes(extension) ? "pdf" :
                            ["xlsx", "xls", "csv"].includes(extension) ? "spreadsheet" :
                                ["jpg", "jpeg", "png", "gif"].includes(extension) ? "image" : "pdf";
                    const fileSize = file.size || 1.0;

                    attachments.push({
                        name: fileName,
                        type: fileType,
                        size: fileSize,
                        url: fileUrl,
                    });
                });
            }

            console.log("Processed attachments:", attachments);

            const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);

            // Override with any explicitly provided values
            setEmailData({
                subject: data.subject || subject,
                from: data.from || from,
                to: emailTo,
                body: data.body || body,
                attachments,
                totalSize,
                stage: stageName,
                orderId: orderId,
                type: `Sent ${stageName.charAt(0).toUpperCase() + stageName.slice(1)}`
            });

            setSendError(null);
            setShowEmailPreview(true);
        };

        const handleBodyChange = (newBody) => {
            setEmailData(prev => ({
                ...prev,
                body: newBody,
            }));
        };

        const handleCloseEmailPreview = () => {
            setShowEmailPreview(false);
            setSendError(null);
        };

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                handleCloseEmailPreview();
            }
        };

        const handleSendEmail = async () => {
            if (!emailData.to) {
                setSendError("Recipient email is required");
                return;
            }

            try {
                setIsSending(true);
                setSendError(null);

                // Prepare the email data with proper attachments
                const emailPayload = {
                    to: emailData.to,
                    from: emailData.from,
                    subject: emailData.subject,
                    body: emailData.body,
                    attachments: emailData.attachments.map(att => ({
                        url: att.url,
                        name: att.name,
                        type: att.type
                    })),
                };

                console.log("Sending email with attachments:", emailPayload.attachments);

                // Simulate API call (replace with your actual API call)
                const result = await fetch(import.meta.env.VITE_EMAIL_API_URL || 'https://api.example.com/send-email', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": import.meta.env.VITE_EMAIL_API_KEY || 'dummy-key',
                    },
                    body: JSON.stringify(emailPayload),
                });

                let responseData;
                try {
                    responseData = await result.json();
                } catch (jsonErr) {
                    console.warn("Response is not valid JSON:", jsonErr);
                }

                if (!result.ok) {
                    throw new Error(responseData?.error || `Failed to send email: ${result.status}`);
                }

                // Log email to emailLog subcollection with comprehensive attachment info and body
                await logEmail(emailData.orderId, {
                    // Basic email classification
                    type: emailData.type,
                    stage: emailData.stage || stageName,
                    isForwarded: emailData.isForwarded || false,
                    isResend: emailData.isResend || false,

                    // Email content
                    recipient: emailData.to,
                    from: emailData.from,
                    subject: emailData.subject,
                    body: emailData.body, // Store the exact body that was sent

                    // Attachment information
                    attachments: emailData.attachments.map(att => att.url), // Keep URL format for backward compatibility
                    attachmentDetails: emailData.attachments.map(att => ({
                        name: att.name,
                        url: att.url,
                        type: att.type,
                        size: att.size
                    })),

                    // Metadata
                    sentAt: new Date()
                });

                // Update the order store by adding the new email to the emailLog array
                if (orderDetails && orderDetails.id === emailData.orderId) {
                    const updatedOrderDetails = { ...orderDetails };

                    // Create emailLog array if it doesn't exist
                    if (!updatedOrderDetails.emailLog) {
                        updatedOrderDetails.emailLog = [];
                    }

                    // Add the new email to the emailLog array
                    updatedOrderDetails.emailLog.unshift({
                        type: emailData.type,
                        recipient: emailData.to,
                        from: emailData.from,
                        subject: emailData.subject,
                        body: emailData.body,
                        attachments: emailData.attachments.map(att => att.url),
                        attachmentDetails: emailData.attachments.map(att => ({
                            name: att.name,
                            url: att.url,
                            type: att.type,
                            size: att.size
                        })),
                        sentAt: new Date(),
                        stage: emailData.stage || stageName,
                        isForwarded: emailData.isForwarded || false,
                        isResend: emailData.isResend || false
                    });

                    // Update the order store
                    useOrderStore.setState({ orderDetails: updatedOrderDetails });
                }

                handleCloseEmailPreview();
                alert(`Email has been sent successfully to ${emailData.to}`);

                // If there's an onEmailSent callback, call it
                if (props.onEmailSent) {
                    props.onEmailSent();
                }
            } catch (error) {
                console.error("Error sending email:", error);
                setSendError(error.message || "Failed to send email. Please try again.");
            } finally {
                setIsSending(false);
            }
        };

        return (
            <>
                <WrappedComponent {...props} onSendClick={handleSendClick} />

                {showEmailPreview && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-auto py-6 px-4"
                        onClick={handleOverlayClick}
                    >
                        <div className="w-full max-w-2xl max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="overflow-auto bg-gray-100">
                                <EmailPreview
                                    subject={emailData.subject}
                                    from={emailData.from}
                                    to={emailData.to}
                                    body={emailData.body}
                                    attachments={emailData.attachments}
                                    totalSize={emailData.totalSize}
                                    onClose={handleCloseEmailPreview}
                                    onBodyChange={handleBodyChange}
                                    isSending={isSending}
                                    sendError={sendError}
                                />
                            </div>
                            <div className="bg-white p-4 rounded-b-2xl shadow flex flex-col space-y-2">
                                {sendError && (
                                    <div className="text-red-500 text-sm mb-2 p-2 bg-red-50 rounded">
                                        Error: {sendError}
                                    </div>
                                )}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={handleCloseEmailPreview}
                                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                                        disabled={isSending}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendEmail}
                                        className={`px-4 py-2 ${isSending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md font-medium flex items-center justify-center`}
                                        disabled={isSending}
                                    >
                                        {isSending ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Sending...
                                            </>
                                        ) : (
                                            emailData.isResend ? "Resend Email" : "Send Email"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };
};

export default withEmailPreview;