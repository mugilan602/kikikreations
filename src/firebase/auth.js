// auth.js
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Login function (accepts email & password as parameters)
const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ Logged in successfully:", user.email);
        return user;
    } catch (error) {
        console.error("❌ Login error:", error.message);
        return null;
    }
};

// Logout function
const logoutUser = async () => {
    try {
        await signOut(auth);
        console.log("✅ Logged out successfully");
    } catch (error) {
        console.error("❌ Logout error:", error.message);
    }
};

export { loginUser, logoutUser };
