import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Menu, X } from "lucide-react"; // Import icons
import { motion } from "framer-motion"; // Smooth animations

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate(); // Hook to navigate

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("isAdmin"); // Remove admin flag
        navigate("/"); // Redirect to home page
    };

    return (
        <>
            {/* Desktop & Tablet Navbar */}
            <nav className="bg-white shadow-md flex items-center justify-between md:justify-start gap-10 px-6">
                {/* Left Section - Branding */}
                <div className="flex items-center space-x-2">
                    <img src="/images/logo.png" alt="Kiki Kreations Ine" className="h-14" />
                </div>

                {/* Desktop Navigation (Hidden on Mobile) */}
                <div className="hidden md:flex pt-2 space-x-6 text-[#4A3B2D] text-sm font-medium">
                    <Link to="/orders" className="hover:text-black border-b-2 border-transparent hover:border-black pb-1">Orders</Link>
                    <Link to="/expenses" className="hover:text-black border-b-2 border-transparent hover:border-black pb-1">Expenses</Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-[#4A3B2D]" onClick={() => setIsOpen(true)}>
                    <Menu size={28} />
                </button>
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
                        className="fixed top-0 right-0 w-3/4 sm:w-1/2 h-full bg-white shadow-lg z-50 flex flex-col items-start pt-8 px-6"
                    >
                        {/* Close Button */}
                        <button className="absolute top-5 right-5 text-[#4A3B2D]" onClick={() => setIsOpen(false)}>
                            <X size={28} />
                        </button>

                        {/* Mobile Navigation Links */}
                        <div className="flex flex-col space-y-4 mt-10 w-full text-[#4A3B2D] font-medium text-lg">
                            <Link to="/orders" className="block py-2" onClick={() => setIsOpen(false)}>Order Tracking</Link>
                            <Link to="/expenses" className="block py-2" onClick={() => setIsOpen(false)}>Expenses</Link>
                        </div>

                        {/* Logout Button (Visible in Mobile Menu) */}
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
