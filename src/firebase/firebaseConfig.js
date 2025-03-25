import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyB0TzuiykW8W5_PLGgf6lDZCWlMygPa2Ag",
    authDomain: "app-kiki-7e65d.firebaseapp.com",
    projectId: "app-kiki-7e65d",
    storageBucket: "app-kiki-7e65d.firebasestorage.app",
    messagingSenderId: "343902152021",
    appId: "1:343902152021:web:835fc518204d9bdcc27bdc"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const storage = getStorage(app);
export { db, storage }; 
