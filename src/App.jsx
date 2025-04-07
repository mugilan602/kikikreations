import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import OrderPage from "./pages/OrderPage";
import AddNewOrder from "./components/AddNewOrder";
import Expenses from "./components/Expenses";
import EmailPreview from "./components/EmailPreview";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<OrderPage />} />
        <Route path="/add" element={<AddNewOrder />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/emailpreview" element={<EmailPreview />} />

      </Routes>
    </Router>
  );
}

export default App;
