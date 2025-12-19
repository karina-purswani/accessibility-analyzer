import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Analyze from "./pages/Analyze";
import ProtectedRoute from "./components/ProtectedRoute";
import ScanHistory from "./pages/ScanHistory";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* GLOBAL NAVBAR */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<ScanHistory />} />
          <Route
            path="/analyze"
            element={
              <ProtectedRoute>
                <Analyze />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
