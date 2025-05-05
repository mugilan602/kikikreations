import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Pencil, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { logoutUser } from "../firebase/auth";
import { auth } from "../firebase/firebaseConfig"; // Assuming the Firebase auth instance is in this file

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // Get current route

    // Logout function using Firebase
    const handleLogout = async () => {
        try {
            await logoutUser(auth); // Firebase signOut method
            navigate("/"); // Redirect to login page
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    // Function to determine if a link is active
    const isActive = (path) => location.pathname === path ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent";

    return (
        <>
            {/* Desktop & Tablet Navbar */}
            <nav className="bg-white shadow-md flex justify-between items-center px-8 py-2">
                {/* Left Section - Branding */}
                <div className="flex items-end gap-10">
                    <div className="flex items-center  space-x-2">
                        <img src="/images/logo.png" alt="Kiki Kreations Ine" className="h-12" />
                    </div>

                    {/* Desktop Navigation (Hidden on Mobile) */}
                    <div className="hidden md:flex flex-end space-x-6 text-base font-medium">
                        <Link to="/orderpage" className={`hover:text-blue-600 border-b-2 pb-3 ${isActive("/orderpage")}`}>Orders</Link>
                        <Link to="/expenses" className={`hover:text-blue-600 border-b-2 pb-3 ${isActive("/expenses")}`}>Expenses</Link>
                    </div>
                </div>

                {/* Profile Pic and Logout Button (Right-aligned) */}
                <div className="flex items-center gap-4">
                    {/* Desktop Profile Pic */}
                    <div className="hidden md:flex items-center">
                        <img src="/images/profile.png" alt="Kiki Kreations Ine" className="h-10 w-10 rounded-full" />
                    </div>

                    {/* Desktop Logout Button */}
                    <button
                        className="hidden md:block bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-[#4A3B2D]" onClick={() => setIsOpen(true)}>
                        <Menu size={28} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Dark Transparent Background */}
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />

                    {/* Mobile Navigation Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-0 right-0 w-5/6 h-full bg-white shadow-lg z-100 flex flex-col items-start pt-8 px-6"
                    >
                        {/* Close Button */}
                        <button className="absolute top-5 right-5 text-[#4A3B2D]" onClick={() => setIsOpen(false)}>
                            <X size={28} />
                        </button>

                        {/* Mobile Navigation Links */}
                        <div className="flex flex-col space-y-4 mt-10 w-full font-medium text-lg">
                            <Link to="/orderpage" className={`block py-2 ${isActive("/orders")}`} onClick={() => setIsOpen(false)}>Order Tracking</Link>
                            <Link to="/expenses" className={`block py-2 ${isActive("/expenses")}`} onClick={() => setIsOpen(false)}>Expenses</Link>
                        </div>

                        {/* Mobile Logout Button */}
                        <button className="mt-8 w-full bg-black text-white py-3 rounded" onClick={handleLogout}>
                            Logout
                        </button>
                    </motion.div>
                </>
            )}
        </>
    );
}

export default Navbar;
