import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL ,deleteObject} from "firebase/storage";

const storage = getStorage();
export const uploadFiles = async (referenceNumber, section, files) => {
    try {
        if (!referenceNumber || !section || !files.length) {
            throw new Error("Missing reference number, section, or files");
        }

        const uploadPromises = files.map(async (file) => {
            const filePath = `orders/${referenceNumber}/${section}/${Date.now()}_${file.name}`;
            const fileRef = ref(storage, filePath);

            // Upload the file
            await uploadBytes(fileRef, file);

            // Get the download URL
            const fileURL = await getDownloadURL(fileRef);

            return { name: file.name, url: fileURL };
        });

        return await Promise.all(uploadPromises); // Returns array of { name, url }
    } catch (error) {
        console.error("Error uploading files:", error);
        throw error;
    }
};
// ✅ Create a new order
export const createOrder = async (orderData) => {
    try {
        const newOrder = await addDoc(collection(db, "orders"), {
            ...orderData,
            createdAt: Timestamp.now(),
        });
        return newOrder.id;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

// ✅ Fetch all orders
export const getOrders = async () => {
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    return ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Get order with subcollections
export const getOrderWithDetails = async (orderId) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error("Order not found");
        }

        const orderData = { id: orderId, ...orderSnap.data() };

        // Fetch related subcollections (emails, shipments, etc.)
        const subcollections = ["sampling", "production", "shipments"];
        for (const subcollection of subcollections) {
            const subSnap = await getDocs(collection(db, "orders", orderId, subcollection));
            orderData[subcollection] = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        return orderData;
    } catch (error) {
        console.error("Error fetching order:", error);
        throw error;
    }
};

export const deleteFilesFromStorage = async (fileUrls) => {
    try {
        const deletePromises = fileUrls.map((fileUrl) => {
            const fileRef = ref(storage, fileUrl);
            return deleteObject(fileRef);
        });

        await Promise.all(deletePromises);
        console.log("All selected files deleted successfully.");
    } catch (error) {
        console.error("Error deleting files:", error);
        throw error;
    }
};
export const updateOrder = async (orderId, updatedData) => {
    try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
            ...updatedData,
            updatedAt: new Date(),
        });
        console.log("Order updated successfully: ", orderId);
        return true;
    } catch (error) {
        console.error("Error updating order:", error);
        throw error;

    }
}