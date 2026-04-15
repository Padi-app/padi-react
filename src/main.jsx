import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AdminDashboard from "./AdminDashboard";
import { AuthProvider } from "./lib/AuthContext";
import VendorDashboard  from "./VendorDashboard";
import RiderDashboard from "./RiderDashboard";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/rider" element={<RiderDashboard />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);