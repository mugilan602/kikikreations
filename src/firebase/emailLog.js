// emailLog.js
import { db } from "./firebaseConfig"; // Adjust path based on your project structure
import { collection, addDoc, Timestamp, getDocs, query, orderBy } from "firebase/firestore";

/**
 * Logs an email to the emailLog subcollection of a given order.
 * @param {string} orderId - The ID of the order.
 * @param {Object} emailData - Email details to log.
 * @param {string} emailData.type - The type of email (e.g., "Sent OrderDetails", "Sent Sampling").
 * @param {string} emailData.stage - The stage (e.g., "orderDetails", "sampling", "production", "shipment").
 * @param {string} emailData.recipient - The email recipient.
 * @param {string} emailData.from - The sender email address.
 * @param {string} emailData.subject - The email subject.
 * @param {string} emailData.body - The email body content.
 * @param {string[]} emailData.attachments - Array of attachment URLs.
 * @param {Object[]} emailData.attachmentDetails - Detailed information about attachments.
 * @returns {Promise<string>} - The ID of the logged email document.
 */
export const logEmail = async (orderId, emailData) => {
    try {
        if (!orderId) {
            throw new Error("Order ID is required to log email.");
        }

        const emailLogRef = collection(db, "orders", orderId, "emailLog");

        // Prepare the log entry with all the expanded data
        const logEntry = {
            // Type of email (e.g., "Sent OrderDetails", "Sent Sampling", "Forwarded Shipment")
            type: emailData.type || `Sent ${emailData.stage.charAt(0).toUpperCase() + emailData.stage.slice(1)}`,

            // Basic email information
            recipient: emailData.recipient || "Unknown",
            from: emailData.from || "noreply@company.com",
            subject: emailData.subject || "No subject",
            body: emailData.body || "", // Store the exact email body

            // Attachment information
            attachments: emailData.attachments || [], // Array of URLs (for backward compatibility)
            attachmentDetails: emailData.attachmentDetails || [], // Detailed attachment info

            // Activity description for UI display
            actions: `${emailData.attachments?.length || 0} file${emailData.attachments?.length === 1 ? "" : "s"} attached`,

            // Metadata
            sentAt: Timestamp.now(),
            stage: emailData.stage || "", // Store which stage this email belongs to
            isForwarded: emailData.isForwarded || false,
            isResend: emailData.isResend || false
        };

        const docRef = await addDoc(emailLogRef, logEntry);
        console.log(`Email logged successfully for ${emailData.stage} with ID:`, docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error logging email:", error);
        throw error;
    }
};

/**
 * Fetches all email logs for a given order.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<Object[]>} - Array of email log entries.
 */
export const getEmailLogs = async (orderId) => {
    try {
        const emailLogRef = collection(db, "orders", orderId, "emailLog");
        // Order by sentAt in descending order (newest first)
        const q = query(emailLogRef, orderBy("sentAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching email logs:", error);
        throw error;
    }
};

/**
 * Gets the total count of emails sent for a specific order.
 * @param {string} orderId - The ID of the order.
 * @returns {Promise<number>} - Count of emails sent.
 */
export const getEmailCount = async (orderId) => {
    try {
        const emailLogRef = collection(db, "orders", orderId, "emailLog");
        const snapshot = await getDocs(emailLogRef);
        return snapshot.size;
    } catch (error) {
        console.error("Error getting email count:", error);
        throw error;
    }
};