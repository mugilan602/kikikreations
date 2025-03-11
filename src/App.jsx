import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import OrderPage from "./components/OrderPage";
import CourierPage from "./components/CourierPage";
import OrderProcess from "./components/OrderProgess";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/courier-page" element={<CourierPage />} />
        <Route path="/stepper" element={<OrderProcess />} />

      </Routes>
    </Router>
  );
}

export default App;
