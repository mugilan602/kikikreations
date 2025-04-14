import { db } from "./firebaseConfig";
import { collection, addDoc, Timestamp, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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

        return await Promise.all(uploadPromises);
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
            status: "",
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
        const subcollections = ["sampling", "production", "shipments", "emailLog"];
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
};

// Add delete order functionality
export const deleteOrder = async (orderId) => {
    try {
        // First, get the order to see if there are files to delete
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            throw new Error("Order not found");
        }

        const orderData = orderSnap.data();

        // Collect all file URLs that need to be deleted
        let allFileUrls = [];

        // Add files from the main order document
        if (orderData.files && orderData.files.length > 0) {
            allFileUrls = [...allFileUrls, ...orderData.files.map(file => file.url)];
        }

        // Check subcollections for files
        const subcollections = ["sampling", "production", "shipments", "emailLog"];
        for (const subcollection of subcollections) {
            const subSnap = await getDocs(collection(db, "orders", orderId, subcollection));

            // Inspect each document in the subcollection for files
            subSnap.docs.forEach(docSnapshot => {
                const docData = docSnapshot.data();

                // Check for files array
                if (docData.files && docData.files.length > 0) {
                    allFileUrls = [...allFileUrls, ...docData.files.map(file => file.url || file)];
                }

                // Check for attachments array (some subcollections might use different field names)
                if (docData.attachments && docData.attachments.length > 0) {
                    allFileUrls = [...allFileUrls, ...docData.attachments.map(attachment =>
                        typeof attachment === 'string' ? attachment : attachment.url
                    )];
                }

                // Check for individual file fields
                if (docData.fileUrl) allFileUrls.push(docData.fileUrl);
                if (docData.imageUrl) allFileUrls.push(docData.imageUrl);
                if (docData.documentUrl) allFileUrls.push(docData.documentUrl);
            });

            // Delete all documents in the subcollection
            const deleteDocs = subSnap.docs.map(async (docSnapshot) => {
                await deleteDoc(doc(db, "orders", orderId, subcollection, docSnapshot.id));
            });

            await Promise.all(deleteDocs);
        }

        // Filter out any duplicate URLs and non-storage URLs
        const uniqueFileUrls = [...new Set(allFileUrls)].filter(url =>
            typeof url === 'string' &&
            url.startsWith('https://firebasestorage.googleapis.com/')
        );

        // Delete all files from storage
        if (uniqueFileUrls.length > 0) {
            console.log(`Deleting ${uniqueFileUrls.length} files from storage`);
            await deleteFilesFromStorage(uniqueFileUrls);
        }

        // Delete the main order document
        await deleteDoc(orderRef);
        console.log("Order deleted successfully: ", orderId);
        return true;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
};