import { doc, collection, getDocs, query, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

export const addProductionToOrder = async (orderId, productionData, files) => {
    try {
        // ✅ Ensure files array is valid
        const sanitizedFiles = Array.isArray(files) ? files : [];

        // ✅ Reference to "production" subcollection
        const productionRef = collection(db, "orders", orderId, "production");

        // ✅ Check if a production document already exists
        const existingQuery = query(productionRef);
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            // ✅ If document exists, update the first one found
            const existingDoc = existingDocs.docs[0]; // Get first document
            const productionDocRef = doc(db, "orders", orderId, "production", existingDoc.id);

            await setDoc(productionDocRef, {
                ...productionData,
                files: sanitizedFiles, // Store pre-uploaded file URLs
                updatedAt: Timestamp.now(),
            }, { merge: true }); // ✅ Merge to avoid overwriting all fields

            console.log("✅ Production updated successfully with ID:", existingDoc.id);
            return existingDoc.id; // Return updated document ID
        } else {
            // ✅ If no document exists, create a new one
            const newProductionDocRef = doc(productionRef); // Generate document ID
            await setDoc(newProductionDocRef, {
                ...productionData,
                files: sanitizedFiles, // Store pre-uploaded file URLs
                createdAt: Timestamp.now(),
            });

            console.log("✅ Production created successfully with ID:", newProductionDocRef.id);
            return newProductionDocRef.id; // Return new document ID
        }
    } catch (error) {
        console.error("❌ Error adding/updating production:", error);
        throw error;
    }
};
