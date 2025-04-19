import { db, storage } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    where,
    orderBy
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";
import Tesseract from "tesseract.js";
import axios from "axios";

// Replace with your Gemini API Key
const GEMINI_API_KEY = "AIzaSyCieZcVJTr2YJc7aMDEJ1PGjwt0hmWujzI";

// ✅ Upload receipt files to storage
export const uploadReceipt = async (file) => {
    try {
        if (!file) {
            throw new Error("No file provided");
        }

        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const path = `receipts/${filename}`;
        const fileRef = ref(storage, path);

        // Upload file to Firebase Storage
        await uploadBytes(fileRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(fileRef);

        return {
            url: downloadURL,
            path: path,
            filename: filename
        };
    } catch (error) {
        console.error("Error uploading receipt:", error);
        throw error;
    }
};

// ✅ Extract text from receipt using Tesseract OCR
export const extractTextFromReceipt = async (file) => {
    try {
        console.log("🔍 Extracting text from receipt...");

        // Create a URL for the file
        const imageUrl = URL.createObjectURL(file);

        // Use Tesseract to recognize text
        const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
            logger: m => console.log(`OCR Progress: ${m.status} - ${Math.floor(m.progress * 100)}%`)
        });

        // Clean up the URL object
        URL.revokeObjectURL(imageUrl);

        console.log("✅ Extracted Text:", text);
        return text;
    } catch (error) {
        console.error("❌ OCR Error:", error);
        throw error;
    }
};

// ✅ Process extracted text using Gemini API
export const analyzeReceiptWithGemini = async (receiptText) => {
    try {
        console.log("🔍 Analyzing receipt with Gemini API...");

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: `Extract and classify the following receipt text into structured JSON format with these fields:
                                - Date (in YYYY-MM-DD format)
                                - Vendor (merchant or store name)
                                - Category (choose one: Food & Dining, Office Supplies, Travel, Utilities, Entertainment, Equipment, Marketing, Software, Other)
                                - Description (brief summary of items or purpose)
                                - Amount (with currency symbol if available)
                                - Payment (payment method, e.g. Credit Card, Cash, etc.)
                                - HST (tax amount, if available)
                                
                                **Response Format:** Return a valid JSON **without extra formatting or markdown**.
                                
                                Receipt Text:
                                ${receiptText}
                                
                                Example Output:
                                {
                                    "date": "2024-03-15",
                                    "vendor": "Walmart",
                                    "category": "Food & Dining",
                                    "description": "Milk, Bread, Eggs",
                                    "amount": "25.50",
                                    "payment": "Credit Card",
                                    "hst": "3.32"
                                }
                                Strictly adhere to the example output dont include any symbol or currency metrics for amount`
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        // Extract text from response
        let geminiResponse = response.data?.candidates[0]?.content?.parts[0]?.text || "{}";

        // Clean response: Remove markdown artifacts (like ```json ... ```)
        geminiResponse = geminiResponse.replace(/```json|```/g, "").trim();

        // Parse JSON safely
        try {
            const structuredData = JSON.parse(geminiResponse);
            console.log("✅ Classified Data:", structuredData);

            // Format the date if needed
            if (structuredData.date) {
                // Try to ensure date is in YYYY-MM-DD format
                try {
                    const date = new Date(structuredData.date);
                    if (!isNaN(date.getTime())) {
                        structuredData.date = date.toISOString().split('T')[0];
                    }
                } catch (e) {
                    // Keep original format if parsing fails
                }
            }

            return structuredData;
        } catch (parseError) {
            console.error("❌ Error parsing Gemini response:", parseError);
            // Return default values if parsing fails
            return {
                date: new Date().toISOString().split('T')[0],
                vendor: "",
                category: "Uncategorized",
                description: "Receipt uploaded on " + new Date().toLocaleDateString(),
                amount: "",
                payment: "Credit Card",
                hst: ""
            };
        }
    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.data || error.message);
        // Return default values if API call fails
        return {
            date: new Date().toISOString().split('T')[0],
            vendor: "",
            category: "Uncategorized",
            description: "Receipt uploaded on " + new Date().toLocaleDateString(),
            amount: "",
            payment: "Credit Card",
            hst: ""
        };
    }
};

// ✅ Create a new expense
export const createExpense = async (expenseData, file = null) => {
    try {
        let receiptInfo = { url: null, path: null };
        let extractedData = null;

        // Upload receipt if provided
        if (file) {
            receiptInfo = await uploadReceipt(file);

            // Try OCR and Gemini analysis
            try {
                const receiptText = await extractTextFromReceipt(file);
                extractedData = await analyzeReceiptWithGemini(receiptText);

                // Merge extracted data with provided data, preferring provided data
                expenseData = {
                    // Default to extracted data
                    ...extractedData,
                    // Override with any explicitly provided data
                    ...Object.fromEntries(
                        Object.entries(expenseData).filter(([_, v]) => v !== "" && v !== null)
                    )
                };
            } catch (error) {
                console.warn("Could not extract text from receipt:", error);
                // Continue without extracted data
            }
        }

        // Add expense to Firestore
        const expenseRef = await addDoc(collection(db, "expenses"), {
            ...expenseData,
            receiptUrl: receiptInfo.url,
            receiptPath: receiptInfo.path,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return expenseRef.id;
    } catch (error) {
        console.error("Error creating expense:", error);
        throw error;
    }
};

// ✅ Update an existing expense
export const updateExpense = async (expenseId, expenseData, file = null) => {
    try {
        const expenseRef = doc(db, "expenses", expenseId);
        const expenseSnapshot = await getDoc(expenseRef);

        if (!expenseSnapshot.exists()) {
            throw new Error("Expense not found");
        }

        const currentData = expenseSnapshot.data();
        let receiptUrl = currentData.receiptUrl;
        let receiptPath = currentData.receiptPath;
        let extractedData = null;

        // Handle receipt file update
        if (file) {
            // Delete existing receipt if there is one
            if (currentData.receiptPath) {
                const oldFileRef = ref(storage, currentData.receiptPath);
                try {
                    await deleteObject(oldFileRef);
                } catch (error) {
                    console.warn("Error deleting old receipt:", error);
                    // Continue with upload even if delete fails
                }
            }

            // Upload new receipt
            const receiptInfo = await uploadReceipt(file);
            receiptUrl = receiptInfo.url;
            receiptPath = receiptInfo.path;

            // Try OCR and Gemini analysis
            try {
                const receiptText = await extractTextFromReceipt(file);
                extractedData = await analyzeReceiptWithGemini(receiptText);

                // Merge extracted data with provided data, preferring provided data
                expenseData = {
                    // Default to extracted data
                    ...extractedData,
                    // Override with any explicitly provided data
                    ...Object.fromEntries(
                        Object.entries(expenseData).filter(([_, v]) => v !== "" && v !== null)
                    )
                };
            } catch (error) {
                console.warn("Could not extract text from receipt:", error);
                // Continue without extracted data
            }
        }

        // Update expense in Firestore
        await updateDoc(expenseRef, {
            ...expenseData,
            receiptUrl,
            receiptPath,
            updatedAt: serverTimestamp()
        });

        return expenseId;
    } catch (error) {
        console.error("Error updating expense:", error);
        throw error;
    }
};

// ✅ Delete an expense
export const deleteExpense = async (expenseId) => {
    try {
        const expenseRef = doc(db, "expenses", expenseId);
        const expenseSnapshot = await getDoc(expenseRef);

        if (!expenseSnapshot.exists()) {
            throw new Error("Expense not found");
        }

        const expenseData = expenseSnapshot.data();

        // Delete receipt file if it exists
        if (expenseData.receiptPath) {
            const fileRef = ref(storage, expenseData.receiptPath);
            try {
                await deleteObject(fileRef);
            } catch (error) {
                console.warn("Error deleting receipt file:", error);
                // Continue with expense deletion even if file delete fails
            }
        }

        // Delete the expense document
        await deleteDoc(expenseRef);
        return true;
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
};

// ✅ Delete multiple expenses
export const deleteMultipleExpenses = async (expenseIds) => {
    try {
        const deletePromises = expenseIds.map(id => deleteExpense(id));
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        console.error("Error deleting multiple expenses:", error);
        throw error;
    }
};

// ✅ Get all expenses
export const getAllExpenses = async () => {
    try {
        const expensesSnapshot = await getDocs(collection(db, "expenses"));
        return expensesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting all expenses:", error);
        throw error;
    }
};

// ✅ Process multiple receipts
export const processMultipleReceipts = async (files) => {
    try {
        const results = [];

        for (const file of files) {
            try {
                // Extract text from receipt
                const receiptText = await extractTextFromReceipt(file);

                // Analyze with Gemini
                const geminiData = await analyzeReceiptWithGemini(receiptText);

                // Create expense with extracted data
                const expenseId = await createExpense(geminiData, file);

                results.push({
                    id: expenseId,
                    filename: file.name,
                    success: true,
                    data: geminiData
                });
            } catch (error) {
                console.error(`Error processing receipt ${file.name}:`, error);

                // Fall back to basic processing if advanced processing fails
                try {
                    const basicData = {
                        date: new Date().toISOString().split('T')[0],
                        vendor: file.name.split('.')[0].replace(/[_-]/g, ' '),
                        category: "Uncategorized",
                        description: `Receipt uploaded on ${new Date().toLocaleDateString()}`,
                        amount: "",
                        payment: "Credit Card",
                        hst: ""
                    };

                    const expenseId = await createExpense(basicData, file);

                    results.push({
                        id: expenseId,
                        filename: file.name,
                        success: true,
                        data: basicData,
                        basicProcessing: true
                    });
                } catch (fallbackError) {
                    console.error(`Fallback processing failed for ${file.name}:`, fallbackError);
                    results.push({
                        filename: file.name,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        return results;
    } catch (error) {
        console.error("Error processing multiple receipts:", error);
        throw error;
    }
};

// Utility functions (unchanged)
export const getExpensesByCategory = async (category) => {
    try {
        const q = query(
            collection(db, "expenses"),
            where("category", "==", category)
        );

        const expensesSnapshot = await getDocs(q);
        return expensesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting expenses by category:", error);
        throw error;
    }
};

export const getExpensesByDateRange = async (startDate, endDate) => {
    try {
        const q = query(
            collection(db, "expenses"),
            where("date", ">=", startDate),
            where("date", "<=", endDate),
            orderBy("date")
        );

        const expensesSnapshot = await getDocs(q);
        return expensesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting expenses by date range:", error);
        throw error;
    }
};

export const getExpenseById = async (expenseId) => {
    try {
        const expenseRef = doc(db, "expenses", expenseId);
        const expenseSnapshot = await getDoc(expenseRef);

        if (!expenseSnapshot.exists()) {
            throw new Error("Expense not found");
        }

        return {
            id: expenseSnapshot.id,
            ...expenseSnapshot.data()
        };
    } catch (error) {
        console.error("Error getting expense by ID:", error);
        throw error;
    }
};

export const exportExpensesToCSV = (expenses) => {
    try {
        if (!expenses || !expenses.length) {
            return '';
        }

        // Define CSV headers
        const headers = [
            'Date',
            'Vendor',
            'Category',
            'Description',
            'Amount',
            'Payment Method',
            'HST/Tax'
        ];

        // Convert expenses to CSV rows
        const rows = expenses.map(expense => [
            expense.date || '',
            expense.vendor || '',
            expense.category || '',
            expense.description || '',
            expense.amount || '',
            expense.payment || '',
            expense.hst || ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell =>
                // Escape commas in cell values
                typeof cell === 'string' && cell.includes(',')
                    ? `"${cell}"`
                    : cell
            ).join(','))
        ].join('\n');

        return csvContent;
    } catch (error) {
        console.error("Error exporting expenses to CSV:", error);
        throw error;
    }
};