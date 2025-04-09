// functions/src/email.js
import functions from 'firebase-functions/v1';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import nodemailer from 'nodemailer';
import cors from 'cors';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();
const corsHandler = cors({ origin: true });

const ALLOW_UNAUTHENTICATED = true; // Set to false for production

/**
 * HTTP Function to send email directly (with attachment support)
 */
export const sendEmail = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send({ error: 'Method not allowed' });
        }

        try {
            console.log('🔍 Incoming request headers:', JSON.stringify(req.headers, null, 2));
            console.log('📦 Incoming request body:', JSON.stringify(req.body, null, 2));

            // 🔐 API Key Authentication
            const secretKey = req.headers['x-api-key'] || req.query.apiKey;
            const configuredKey = functions.config().email.secret;

            if (!secretKey || secretKey !== configuredKey) {
                console.warn('Unauthorized access attempt');
                return res.status(403).send({ error: 'Unauthorized: Invalid or missing API key' });
            }

            const { subject, from, to, body, attachments = [] } = req.body;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: functions.config().email.user,
                    pass: functions.config().email.password
                }
            });

            const bucket = getStorage().bucket();
            const emailAttachments = [];

            for (const attachment of attachments) {
                if (attachment.url) {
                    if (attachment.url.includes('firebase') || attachment.url.startsWith('gs://')) {
                        let filePath = attachment.url;

                        if (filePath.startsWith('gs://')) {
                            const bucketName = filePath.split('/')[2];
                            filePath = filePath.substring(`gs://${bucketName}/`.length);
                        } else {
                            const urlParts = filePath.split('/');
                            const index = urlParts.findIndex(p => p === 'o') + 1;
                            filePath = decodeURIComponent(urlParts.slice(index).join('/').split('?')[0]);
                        }

                        const fileData = await bucket.file(filePath).download();
                        emailAttachments.push({
                            filename: attachment.name || 'attachment.pdf', // fallback
                            content: fileData[0]
                        });
                    } else {
                        emailAttachments.push({
                            path: attachment.url,
                            filename: attachment.name || 'attachment.pdf'
                        });
                    }
                }
            }

            const mailOptions = {
                from,
                to,
                subject,
                text: body,
                attachments: emailAttachments
            };

            const info = await transporter.sendMail(mailOptions);
            res.status(200).send({ success: true, messageId: info.messageId });
        } catch (err) {
            console.error('❌ Error sending email:', err);
            res.status(500).send({ error: err.message });
        }
    });
});


/**
 * Callable Function to queue email document in Firestore
 */
export const sendEmailOnDocument = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { emailData } = data;

    if (!emailData) {
        throw new functions.https.HttpsError('invalid-argument', 'Email data is required');
    }

    const docRef = await db.collection('emailQueue').add({
        ...emailData,
        createdBy: context.auth.uid,
        createdAt: FieldValue.serverTimestamp(),
        sent: false
    });

    return { success: true, emailId: docRef.id };
});

/**
 * Background function to process Firestore-triggered email send
 */
export const processEmailQueue = functions.firestore.document('emailQueue/{emailId}')
    .onCreate(async (snapshot, context) => {
        const emailData = snapshot.data();

        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: functions.config().email.user,
                    pass: functions.config().email.password
                }
            });

            const bucket = getStorage().bucket();
            const emailAttachments = [];

            if (emailData.attachments?.length > 0) {
                for (const attachment of emailData.attachments) {
                    if (attachment.url) {
                        if (attachment.url.includes('firebase') || attachment.url.startsWith('gs://')) {
                            let filePath = attachment.url;

                            if (filePath.startsWith('gs://')) {
                                const bucketName = filePath.split('/')[2];
                                filePath = filePath.substring(`gs://${bucketName}/`.length);
                            } else {
                                const urlParts = filePath.split('/');
                                const index = urlParts.findIndex(p => p === 'o') + 1;
                                filePath = decodeURIComponent(urlParts.slice(index).join('/').split('?')[0]);
                            }

                            const fileData = await bucket.file(filePath).download();
                            emailAttachments.push({
                                filename: attachment.name,
                                content: fileData[0]
                            });
                        } else {
                            emailAttachments.push({
                                path: attachment.url,
                                filename: attachment.name
                            });
                        }
                    }
                }
            }

            const mailOptions = {
                from: emailData.from,
                to: emailData.to,
                subject: emailData.subject,
                text: emailData.body,
                attachments: emailAttachments
            };

            const info = await transporter.sendMail(mailOptions);

            await db.collection('emailQueue').doc(context.params.emailId).update({
                sent: true,
                sentAt: FieldValue.serverTimestamp(),
                messageId: info.messageId
            });

            return info;
        } catch (err) {
            console.error('Email queue error:', err);
            await db.collection('emailQueue').doc(context.params.emailId).update({
                sent: false,
                error: err.message,
                updatedAt: FieldValue.serverTimestamp()
            });
            throw err;
        }
    });
