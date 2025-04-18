import React from "react";
import { X, FileText, FileSpreadsheet, FileImage, Send } from "lucide-react";

// Optional fallback components if you're missing your UI kit
const Card = ({ children, className }) => (
    <div className={`bg-white rounded-t-2xl shadow ${className}`}>{children}</div>
);
const CardContent = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, ...props }) => (
    <button
        onClick={onClick}
        {...props}
        className="hover:bg-gray-200 p-2 rounded-full transition-all"
        style={{ lineHeight: 0 }}
    >
        {children}
    </button>
);

const EmailPreview = ({
    subject = "Project Update and Deliverables",
    from = "jane.doe@example.com",
    to = "team@company.com",
    body = `Hi Team,

Please find attached the updated project roadmap and budget sheet.

Let me know if you have any questions.

Thanks,`,
    attachments = [
        { name: "roadmap.pdf", type: "pdf", size: 1.2 },
        { name: "budget.xlsx", type: "spreadsheet", size: 0.8 },
    ],
    totalSize = 2.0,
    onClose,
    onBodyChange, // Prop to handle body text changes
    onSend, // New prop for handling send action
    isSending = false, // New prop to indicate sending state
    sendError = null // New prop for any sending errors
}) => {

    // Handle changes to the body text
    const handleBodyChange = (e) => {
        if (onBodyChange) {
            onBodyChange(e.target.value);
        }
    };

    // Get icon based on file type
    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'pdf':
                return <FileText className="w-5 h-5 text-red-600" />;
            case 'spreadsheet':
                return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
            case 'image':
                return <FileImage className="w-5 h-5 text-blue-600" />;
            default:
                return <FileText className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <Card className="border w-full">
            <div className="flex justify-between items-center px-4 pt-4 top-0 bg-white z-10">
                <h2 className="text-lg font-semibold ml-2">Email Preview</h2>
                {onClose && (
                    <Button aria-label="Close" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <CardContent className="space-y-4">
                <div className="space-y-1 bg-white p-3 rounded-md border">
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>From:</strong> {from}</p>
                    <p><strong>To:</strong> {to}</p>
                </div>

                <div className="border rounded-md p-4 bg-white">
                    {/* Textarea for editing the body */}
                    <textarea
                        className="w-full mb-4 bg-transparent border-0 focus:ring-0 resize-none whitespace-pre-wrap min-h-[225px]"
                        value={body}
                        onChange={handleBodyChange}
                        style={{ outline: 'none' }}
                    />
                </div>

                {attachments.length > 0 && (
                    <div>
                        <p className="text-sm font-medium mb-2">Attachments ({attachments.length})</p>
                        <div className="space-y-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-md border bg-white">
                                    <div className="flex items-center space-x-2">
                                        {getFileIcon(file.type)}
                                        <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                    {/* <span className="text-xs text-gray-500">{file.size} MB</span> */}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* <p className="text-xs text-gray-500">Total size: {totalSize.toFixed(1)} MB</p> */}

                {/* Display error if present */}
                {sendError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        Error: {sendError}
                    </div>
                )}

                {/* Send button */}
                {onSend && (
                    <div className="flex justify-end">
                        <button
                            onClick={onSend}
                            disabled={isSending}
                            className={`px-4 py-2 rounded-md flex items-center ${isSending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                        >
                            {isSending ? 'Sending...' : 'Send'}
                            {!isSending && <Send className="w-4 h-4 ml-2" />}
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EmailPreview;