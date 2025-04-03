import functions from "firebase-functions";
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK
initializeApp();

// Configure Nodemailer with Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().gmail.user, // Set in Firebase config
        pass: functions.config().gmail.app_password, // Set in Firebase config
    },
});

// Function to send email based on type
const processOrderEmail = async (type, data) => {
    let subject, text, attachments;

    switch (type) {
        case "sampling":
            subject = `Sample Request - Ref. ${data.refNumber} - ${data.orderName}`;
            text = `Hi! Good Day!\n\nPlease make a sample on ref. ${data.refNumber} - ${data.orderName} - ${data.labelType}. Attached is the artwork.\n\n${data.additionalMessage || ""}\n\nThank you.`;
            attachments = data.files.map(file => ({
                filename: file.name,
                path: file.url, // Firebase Storage URL
            }));
            break;

        case "production":
            subject = `Production Request - Ref. ${data.refNumber} - ${data.orderName}`;
            text = `Hi! Good Day!\n\nPlease run production on ref. ${data.refNumber} - ${data.orderName} - ${data.labelType} (${data.quantity}).\nAttached is the approved sample image.\n\n${data.additionalMessage || ""}\n\nThank you.`;
            attachments = data.files.map(file => ({
                filename: file.name,
                path: file.url,
            }));
            break;

        case "shipping":
            subject = `Shipping Request - Ref. ${data.refNumber} - ${data.orderName}`;
            text = `Hi! Good Day!\n\nPlease ship the attached to:\n\n${data.clientAddress || "Client's address not provided"}\n\nRef. ${data.refNumber} - ${data.orderName} - ${data.labelType} (${data.quantity}).\nAttached is the approved sample image.\n\n${data.additionalMessage || ""}\n\nThank you.`;
            attachments = data.files.map(file => ({
                filename: file.name,
                path: file.url,
            }));
            break;

        default:
            throw new Error("Invalid email type");
    }

    const mailOptions = {
        from: functions.config().gmail.user,
        to: data.toEmail,
        subject: subject,
        text: text,
        attachments: attachments,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email (${type}) sent successfully:`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error sending ${type} email:`, error);
        throw new Error(`Failed to send ${type} email`);
    }
};

// Cloud Function HTTPS endpoint (ES module export)
export const sendOrderEmail = functions.https.onCall(async (data, context) => {
    try {
        const result = await processOrderEmail(data.type, data);
        return result;
    } catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
