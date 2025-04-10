import React, { useState, useEffect } from "react";
import EmailPreview from "./EmailPreview";
import { logEmail } from "../firebase/emailLog.js"; // Import the email logging function
import useOrderStore from "../store/orderStore";
import { updateOrder } from "../firebase/order.js"; // Import the updateOrder function

export const withEmailPreview = (WrappedComponent, stageName) => {
    return function WithEmailPreviewComponent(props) {
        const orderDetails = useOrderStore((state) => state.orderDetails);
        const setOrderDetails = useOrderStore((state) => state.setOrderDetails); // Add setter from Zustand store
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

            const orderId = orderDetails?.id || data.orderId || "";
            if (!orderId) {
                console.error("Order ID is missing");
                return;
            }

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
                    isForwarded: data.isForwarded,
                });

                setSendError(null);
                setShowEmailPreview(true);
                return;
            }

            const emailTo = data.to || data.customerEmail || data.vendorEmail || data.courierEmail || "";
            if (!emailTo) {
                console.error("Recipient email is missing");
                alert("Recipient email is required");
                return;
            }

            let subject, from, body;

            switch (stageName) {
                case "orderDetails":
                    subject = `Order Confirmation: ${orderDetails?.referenceNumber || "New Order"}`;
                    from = "orders@company.com";
                    body = `Hi,\n\nThank you for your order ${orderDetails?.referenceNumber || ""}.\n\nOrder Details:\n- Order Name: ${data.orderName || orderDetails?.orderName || ""}\n- Reference Number: ${data.referenceNumber || orderDetails?.referenceNumber || ""}\n- Label Type: ${data.labelType || orderDetails?.labelType || ""}\n\n${data.orderDetails || data.notes || ""}\n\nPlease let us know if you have any questions.\n\nThank you,\nThe Team`;
                    break;
                case "sampling":
                    subject = `Sampling Request: ${orderDetails?.referenceNumber || ""}`;
                    from = "sampling@company.com";
                    body = `Hi,\n\nWe would like to request samples for the following order:\n\nOrder Details:\n- Reference Number: ${orderDetails?.referenceNumber || ""}\n- Order Name: ${orderDetails?.orderName || ""}\n\nSampling Instructions:\n${data.samplingInstructions || data.instructions || data.notes || ""}\n\nPlease review the attached files and let us know if you have any questions.\n\nThank you,\nThe Team`;
                    break;
                case "production":
                    subject = `Production Request: ${orderDetails?.referenceNumber || ""}`;
                    from = "production@company.com";
                    body = `Hi,\n\nWe would like to start production for the following order:\n\nOrder Details:\n- Reference Number: ${orderDetails?.referenceNumber || ""}\n- Order Name: ${orderDetails?.orderName || ""}\n- Quantity: ${data.quantity || ""}\n\nProduction Notes:\n${data.notes || ""}\n\nPlease review the attached files and let us know if you have any questions.\n\nThank you,\nThe Team`;
                    break;
                case "shipment":
                    subject = `Shipment Request: ${orderDetails?.referenceNumber || ""}`;
                    from = "shipping@company.com";
                    body = `Hi,\n\nPlease find the shipping details for the following order:\n\nOrder Details:\n- Reference Number: ${data.referenceNumber || orderDetails?.referenceNumber || ""}\n- Order Name: ${data.orderName || orderDetails?.orderName || ""}\n- Label Type: ${data.labelType || orderDetails?.labelType || ""}\n\nAdditional Information:\n${data.orderDetails || data.details || data.notes || ""}\n\nPlease review the attached files and proceed with the shipment.\n\nThank you,\nThe Team`;
                    break;
                case "sentMail":
                    subject = data.subject || `Information: ${orderDetails?.referenceNumber || ""}`;
                    from = data.from || "noreply@company.com";
                    body = data.body || "";
                    break;
                default:
                    subject = `Order Information: ${orderDetails?.referenceNumber || ""}`;
                    from = "noreply@company.com";
                    body = "";
            }

            const attachments = [];
            const fileSource = data.files || data.attachments || [];
            console.log("File source:", fileSource);

            if (Array.isArray(fileSource)) {
                fileSource.forEach((file) => {
                    if (!file) return;

                    const fileUrl = file.url || file;
                    if (!fileUrl) return;

                    const fileName = file.name || (typeof fileUrl === "string" ? fileUrl.split("/").pop() : "file");
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

            setEmailData({
                subject: data.subject || subject,
                from: data.from || from,
                to: emailTo,
                body: data.body || body,
                attachments,
                totalSize,
                stage: stageName,
                orderId: orderId,
                type: `Sent ${stageName.charAt(0).toUpperCase() + stageName.slice(1)}`,
            });

            setSendError(null);
            setShowEmailPreview(true);
        };

        const handleBodyChange = (newBody) => {
            setEmailData((prev) => ({
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

                const emailPayload = {
                    to: emailData.to,
                    from: emailData.from,
                    subject: emailData.subject,
                    body: emailData.body,
                    attachments: emailData.attachments.map((att) => ({
                        url: att.url,
                        name: att.name,
                        type: att.type,
                    })),
                };

                console.log("Sending email with attachments:", emailPayload.attachments);

                const result = await fetch(import.meta.env.VITE_EMAIL_API_URL || "https://api.example.com/send-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": import.meta.env.VITE_EMAIL_API_KEY || "dummy-key",
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

                // Log email to emailLog subcollection
                await logEmail(emailData.orderId, {
                    type: emailData.type,
                    stage: emailData.stage || stageName,
                    isForwarded: emailData.isForwarded || false,
                    isResend: emailData.isResend || false,
                    recipient: emailData.to,
                    from: emailData.from,
                    subject: emailData.subject,
                    body: emailData.body,
                    attachments: emailData.attachments.map((att) => att.url),
                    attachmentDetails: emailData.attachments.map((att) => ({
                        name: att.name,
                        url: att.url,
                        type: att.type,
                        size: att.size,
                    })),
                    sentAt: new Date(),
                });

                // Update order status in the database
                if (emailData.orderId) {
                    await updateOrder(emailData.orderId, {
                        status: stageName,
                    });
                    console.log(`Order ${emailData.orderId} status updated to ${stageName} in database`);
                }

                // Update local state in Zustand store
                setOrderDetails({
                    ...orderDetails,
                    status: stageName, // Update status
                    emailLog: [
                        ...(orderDetails?.emailLog || []), // Preserve existing logs
                        {
                            type: emailData.type,
                            recipient: emailData.to,
                            from: emailData.from,
                            subject: emailData.subject,
                            body: emailData.body,
                            attachments: emailData.attachments.map((att) => att.url),
                            attachmentDetails: emailData.attachments.map((att) => ({
                                name: att.name,
                                url: att.url,
                                type: att.type,
                                size: att.size,
                            })),
                            sentAt: new Date(),
                            stage: emailData.stage || stageName,
                            isForwarded: emailData.isForwarded || false,
                            isResend: emailData.isResend || false,
                        },
                    ],
                });

                handleCloseEmailPreview();
                alert(`Email has been sent successfully to ${emailData.to}`);

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
                        <div className="w-full max-w-2xl max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
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
                                    onSend={handleSendEmail} // Pass the send handler
                                    isSending={isSending}
                                    sendError={sendError}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };
};

export default withEmailPreview;