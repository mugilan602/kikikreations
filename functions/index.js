import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";

// ✅ Example HTTP Function (Can be called via browser/Postman)
export const helloWorld = onRequest((req, res) => {
    logger.info("Hello logs!", { structuredData: true });
    res.send("Hello from Firebase Functions!");
});

