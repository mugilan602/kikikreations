// pages/api/sendEmail.js

// Initialize Firebase Admin
let admin;
try {
    admin = require('firebase-admin');

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
    }
} catch (error) {
    console.error('Firebase admin initialization error', error);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify authentication (optional depending on your security requirements)
        let uid = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ') && admin) {
            try {
                const token = authHeader.split('Bearer ')[1];
                const decodedToken = await admin.auth().verifyIdToken(token);
                uid = decodedToken.uid;
            } catch (authError) {
                console.warn('Auth verification failed:', authError);
                // You can choose to continue without authentication or return 401
                // return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        // Get the email data from the request body
        const { subject, from, to, body, attachments = [] } = req.body;

        // Validate required fields
        if (!subject || !from || !to || !body) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Call your Cloud Function directly through fetch
        const cloudFunctionUrl = `https://${process.env.FIREBASE_REGION}-${process.env.FIREBASE_PROJECT_ID}.cloudfunctions.net/sendEmail`;

        const cloudResponse = await fetch(cloudFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader || '',
            },
            body: JSON.stringify({
                subject,
                from,
                to,
                body,
                attachments,
                sentBy: uid // Include the user ID if available
            }),
        });

        if (!cloudResponse.ok) {
            const errorData = await cloudResponse.json();
            throw new Error(errorData.error || 'Cloud function returned an error');
        }

        const data = await cloudResponse.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: error.message || 'Failed to send email' });
    }
}