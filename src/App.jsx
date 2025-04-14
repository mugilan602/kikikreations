import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import OrderPage from "./pages/OrderPage";
import AddNewOrder from "./components/AddNewOrder";
import Expenses from "./components/Expenses";
import EmailPreview from "./components/EmailPreview";
import { ToastProvider } from "./components/ToastContext";
function App() {
  return (
    <ToastProvider >
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<OrderPage />} />
          <Route path="/add" element={<AddNewOrder />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/emailpreview" element={<EmailPreview />} />

        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
