import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import OrderPage from "./pages/OrderPage";
import AddNewOrder from "./components/AddNewOrder";
import Expenses from "./components/Expenses";
import EmailPreview from "./components/EmailPreview";
import { ToastProvider } from "./components/ToastContext";
import Login from "./components/Login";
import { auth } from "./firebase/firebaseConfig";

// ProtectedRoute to prevent unauthorized access
const ProtectedRoute = ({ element, redirectTo }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser); // Listen for auth state changes
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  if (user === null) {
    return null; // Loading state while checking auth status
  }

  // If user is authenticated, show the page, else redirect to login
  return user ? element : <Navigate to={redirectTo} />;
};

function AppContent() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser); // Listen for auth state changes
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Hide Navbar when on the Login page or when user is not authenticated
  const hideNavbar = location.pathname === "/" || user === null;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/orderpage" element={<ProtectedRoute element={<OrderPage />} redirectTo="/" />} />
        <Route path="/add" element={<ProtectedRoute element={<AddNewOrder />} redirectTo="/" />} />
        <Route path="/expenses" element={<ProtectedRoute element={<Expenses />} redirectTo="/" />} />
        <Route path="/emailpreview" element={<ProtectedRoute element={<EmailPreview />} redirectTo="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
