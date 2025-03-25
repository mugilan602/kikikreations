import { doc, collection, getDocs, query, where, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

export const addSamplingToOrder = async (orderId, samplingData, files) => {
    try {
        // ✅ Ensure files array is valid
        const sanitizedFiles = Array.isArray(files) ? files : [];

        // ✅ Reference to "sampling" subcollection
        const samplingRef = collection(db, "orders", orderId, "sampling");

        // ✅ Check if a sampling document already exists
        const existingQuery = query(samplingRef);
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            // ✅ If document exists, update the first one found
            const existingDoc = existingDocs.docs[0]; // Get first document
            const samplingDocRef = doc(db, "orders", orderId, "sampling", existingDoc.id);

            await setDoc(samplingDocRef, {
                ...samplingData,
                files: sanitizedFiles, // Store pre-uploaded file URLs
                updatedAt: Timestamp.now(),
            }, { merge: true }); // ✅ Merge to avoid overwriting all fields

            console.log("✅ Sampling updated successfully with ID:", existingDoc.id);
            return existingDoc.id; // Return updated document ID
        } else {
            // ✅ If no document exists, create a new one
            const newSamplingDocRef = doc(samplingRef); // Generate document ID
            await setDoc(newSamplingDocRef, {
                ...samplingData,
                files: sanitizedFiles, // Store pre-uploaded file URLs
                createdAt: Timestamp.now(),
            });

            console.log("✅ Sampling created successfully with ID:", newSamplingDocRef.id);
            return newSamplingDocRef.id; // Return new document ID
        }
    } catch (error) {
        console.error("❌ Error adding/updating sampling:", error);
        throw error;
    }
};
