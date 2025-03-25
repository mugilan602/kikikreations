import { doc, collection, getDocs, query, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebaseConfig.js";

/**
 * Adds or updates a shipment document in the "shipment" subcollection of an order.
 * @param {string} orderId - The ID of the order.
 * @param {Object} shipmentData - The shipment details.
 * @param {Array} files - List of uploaded file URLs and names.
 * @returns {string} - The ID of the shipment document.
 */
export const addShipmentToOrder = async (orderId, shipmentData, files) => {
    try {
        // ✅ Ensure files array is valid
        const sanitizedFiles = Array.isArray(files) ? files : [];

        // ✅ Reference to "shipment" subcollection
        const shipmentRef = collection(db, "orders", orderId, "shipment");

        // ✅ Check if a shipment document already exists
        const existingQuery = query(shipmentRef);
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            // ✅ If document exists, update the first one found
            const existingDoc = existingDocs.docs[0]; // Get first document
            const shipmentDocRef = doc(db, "orders", orderId, "shipment", existingDoc.id);

            await setDoc(shipmentDocRef, {
                ...shipmentData,
                files: sanitizedFiles, // Store pre-uploaded file URLs
                updatedAt: Timestamp.now(),
            }, { merge: true }); // ✅ Merge to avoid overwriting all fields

            console.log("✅ Shipment updated successfully with ID:", existingDoc.id);
            return existingDoc.id; // Return updated document ID
        } else {
            // ✅ If no document exists, create a new one
            const newShipmentDocRef = doc(shipmentRef); // Generate document ID
            await setDoc(newShipmentDocRef, {
                ...shipmentData,
                files: sanitizedFiles, // Store pre-uploaded file URLs
                createdAt: Timestamp.now(),
            });

            console.log("✅ Shipment created successfully with ID:", newShipmentDocRef.id);
            return newShipmentDocRef.id; // Return new document ID
        }
    } catch (error) {
        console.error("❌ Error adding/updating shipment:", error);
        throw error;
    }
};
