import React from "react";
import { X, FileText, FileSpreadsheet } from "lucide-react";

// Optional fallback components if you're missing your UI kit
const Card = ({ children, className }) => (
    <div className={`bg-white rounded-2xl shadow p-4 ${className}`}>{children}</div>
);
const CardContent = ({ children, className }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);
const Button = ({ children, ...props }) => (
    <button
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
}) => {
    return (
        <div className="max-w-2xl mx-auto p-4 bg-gray-100 min-h-screen">
            <Card className="border">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Preview</h2>
                    <Button aria-label="Close">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p><strong>Subject:</strong> {subject}</p>
                        <p><strong>From:</strong> {from}</p>
                        <p><strong>To:</strong> {to}</p>
                    </div>

                    <div className="border rounded-md p-4 bg-gray-50">
                        <p className="mb-4 whitespace-pre-wrap">{body}</p>
                        <p>Best regards,</p>
                        <p>John</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium mb-2">Attachments ({attachments.length})</p>
                        <div className="space-y-2">
                            {attachments.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded-md border bg-white">
                                    <div className="flex items-center space-x-2">
                                        {file.type === "pdf" ? (
                                            <FileText className="w-5 h-5 text-red-600" />
                                        ) : (
                                            <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                        )}
                                        <span className="text-sm font-medium">{file.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{file.size} MB</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">Total size: {totalSize} MB</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmailPreview;
