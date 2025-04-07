import React, { useState, useEffect } from 'react';
import EmailPreview from './EmailPreview';

// This is a higher-order component to add email preview functionality
export const withEmailPreview = (WrappedComponent, stageName) => {
    return function WithEmailPreviewComponent(props) {
        const [showEmailPreview, setShowEmailPreview] = useState(false);
        const [emailData, setEmailData] = useState({
            subject: '',
            from: '',
            to: '',
            body: '',
            attachments: [],
            totalSize: 0
        });

        // Lock body scroll when modal is open
        useEffect(() => {
            if (showEmailPreview) {
                // Prevent background scrolling when modal is open
                document.body.style.overflow = 'hidden';
            } else {
                // Re-enable scrolling when modal is closed
                document.body.style.overflow = 'auto';
            }

            // Cleanup effect
            return () => {
                document.body.style.overflow = 'auto';
            };
        }, [showEmailPreview]);

        // Function to handle send button click and open email preview
        const handleSendClick = (data) => {
            // Prepare email data based on stage
            let subject, from, to, body, attachments;

            switch (stageName) {
                case 'orderDetails':
                    subject = `Order Details: ${data.orderName || 'New Order'}`;
                    from = 'orders@company.com';
                    to = data.customerEmail || '';
                    body = `Hi,\n\nHere are the details for your order:\n\nOrder Name: ${data.orderName || ''}\nReference Number: ${data.referenceNumber || ''}\nLabel Type: ${data.labelType || ''}\n\n${data.orderDetails || ''}`;
                    break;

                case 'sampling':
                    subject = `Sampling Request: ${props.orderDetails?.orderName || 'New Order'}`;
                    from = 'sampling@company.com';
                    to = data.vendorEmail || '';
                    body = `Hi,\n\nWe would like to request samples for the following order:\n\nOrder Name: ${props.orderDetails?.orderName || ''}\nReference Number: ${props.orderDetails?.referenceNumber || ''}\n\nSampling Instructions:\n${data.samplingInstructions || ''}`;
                    break;

                case 'production':
                    subject = `Production Request: ${props.orderDetails?.orderName || 'New Order'}`;
                    from = 'production@company.com';
                    to = data.vendorEmail || '';
                    body = `Hi,\n\nWe would like to start production for the following order:\n\nOrder Name: ${props.orderDetails?.orderName || ''}\nReference Number: ${props.orderDetails?.referenceNumber || ''}\nQuantity: ${data.quantity || ''}\n\nProduction Notes:\n${data.notes || ''}`;
                    break;

                case 'shipment':
                    subject = `Shipping Instructions: ${data.orderName || props.orderDetails?.orderName || 'New Order'}`;
                    from = 'shipping@company.com';
                    to = data.courierEmail || '';
                    body = `Hi,\n\nPlease find the shipping details for the following order:\n\nOrder Name: ${data.orderName || props.orderDetails?.orderName || ''}\nReference Number: ${data.referenceNumber || props.orderDetails?.referenceNumber || ''}\nLabel Type: ${data.labelType || props.orderDetails?.labelType || ''}\n\n${data.orderDetails || ''}`;
                    break;

                default:
                    subject = 'Order Information';
                    from = 'noreply@company.com';
                    to = '';
                    body = '';
            }

            // Prepare attachment data
            attachments = (data.files || []).map(file => {
                // Determine file type
                const fileName = file.name || file.url.split('/').pop();
                const extension = fileName.split('.').pop().toLowerCase();
                const fileType = ['pdf'].includes(extension) ? 'pdf' :
                    ['jpg', 'jpeg', 'png'].includes(extension) ? 'image' : 'document';

                // Estimate file size if not available (1MB default)
                const fileSize = file.size || 1.0;

                return {
                    name: fileName,
                    type: fileType,
                    size: fileSize
                };
            });

            // Calculate total size
            const totalSize = attachments.reduce((sum, file) => sum + file.size, 0);

            // Set email data
            setEmailData({
                subject,
                from,
                to,
                body,
                attachments,
                totalSize
            });

            // Show email preview
            setShowEmailPreview(true);
        };

        // Function to close email preview
        const handleCloseEmailPreview = () => {
            setShowEmailPreview(false);
        };

        // Function to handle modal overlay click (close when clicking outside)
        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                handleCloseEmailPreview();
            }
        };

        return (
            <>
                <WrappedComponent
                    {...props}
                    onSendClick={handleSendClick}
                />

                {showEmailPreview && (
                    <div
                        className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 overflow-auto py-6"
                        onClick={handleOverlayClick}
                    >
                        <div className="w-full max-w-4xl max-h-full flex flex-col">
                            <div className="overflow-auto flex-grow">
                                <EmailPreview
                                    subject={emailData.subject}
                                    from={emailData.from}
                                    to={emailData.to}
                                    body={emailData.body}
                                    attachments={emailData.attachments}
                                    totalSize={emailData.totalSize}
                                />
                            </div>
                            <div className="bg-white p-4 rounded-b-2xl shadow flex justify-end space-x-4 sticky bottom-0">
                                <button
                                    onClick={handleCloseEmailPreview}
                                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Send Email
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };
};