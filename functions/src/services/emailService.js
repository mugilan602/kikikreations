// src/services/emailService.js
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../src/firebase/firebaseConfig.js'; // Your Firebase config

/**
 * Service class for handling email operations
 */
class EmailService {
    constructor() {
        this.firestore = getFirestore(app);
        this.auth = getAuth(app);
    }

    /**
     * Send email using Firebase Cloud Function via API endpoint
     * @param {Object} emailData - Email data
     * @param {string} emailData.subject - Email subject
     * @param {string} emailData.from - Sender email address
     * @param {string} emailData.to - Recipient email address
     * @param {string} emailData.body - Email body content
     * @param {Array} emailData.attachments - Array of attachment objects
     * @returns {Promise} - Promise with the result
     */
    async sendEmail(emailData) {
        try {
            // Make sure user is authenticated
            const currentUser = this.auth.currentUser;
            if (!currentUser) {
                throw new Error('User must be authenticated to send emails');
            }

            // Get token for authorization
            const token = await currentUser.getIdToken();

            // Use the API endpoint
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Queue an email in Firestore to be sent by the background function
     * @param {Object} emailData - Email data object
     * @returns {Promise} - Promise with the document reference
     */
    async queueEmail(emailData) {
        try {
            // Make sure user is authenticated
            const currentUser = this.auth.currentUser;
            if (!currentUser) {
                throw new Error('User must be authenticated to queue emails');
            }

            // Add a document to the emailQueue collection
            const emailQueueRef = collection(this.firestore, 'emailQueue');

            const docRef = await addDoc(emailQueueRef, {
                ...emailData,
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
                sent: false
            });

            return docRef;
        } catch (error) {
            console.error('Error queuing email:', error);
            throw error;
        }
    }

    /**
     * Get the status of a queued email
     * @param {string} emailId - The ID of the queued email
     * @returns {Promise} - Promise with the email data
     */
    async getEmailStatus(emailId) {
        try {
            const docRef = doc(this.firestore, 'emailQueue', emailId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() };
            } else {
                throw new Error('Email not found');
            }
        } catch (error) {
            console.error('Error getting email status:', error);
            throw error;
        }
    }
}

export default new EmailService();