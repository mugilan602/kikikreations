// functions/index.js
import { getApps, initializeApp } from 'firebase-admin/app';
import * as functions from 'firebase-functions/v1'; // Use v1 explicitly to avoid compatibility issues

import { sendEmail, sendEmailOnDocument, processEmailQueue } from './src/email.js';

// Initialize Firebase Admin only if not already initialized
if (!getApps().length) {
    initializeApp();
}

// Export Cloud Functions
export {
    sendEmail,
    sendEmailOnDocument,
    processEmailQueue
};
