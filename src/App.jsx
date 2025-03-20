import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import OrderPage from "./pages/OrderPage";
import AddNewOrder from "./components/AddNewOrder";
import Expenses from "./components/Expenses";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<OrderPage />} />
        <Route path="/add" element={<AddNewOrder />} />
        <Route path="/expenses" element={<Expenses />} />

      </Routes>
    </Router>
  );
}

export default App;
