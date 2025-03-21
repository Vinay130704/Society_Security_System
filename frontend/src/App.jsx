import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage";
import FeaturesSection from "./pages/FeaturesSection";
import HowItWorks from "./pages/HowItWorks";
import UserRoles from "./pages/UserRoles";
import Testimonials from "./pages/Testimonials";
import ContactUs from "./pages/ContactUs";
import Register from "./pages/Signup";
import Login from "./pages/Login";
import AboutUs from "./pages/About";
import ResidentRoutes from "./router/ResidentRoutes";
import SecurityRoutes from "./router/SecurityRoutes";
import ChangePassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ResidentSignup from "./pages/Resident/ResidentRegister";
import UserManagement from "./pages/Admin/UsersManagement";
import ManageResidents from "./pages/Admin/ManageResidents";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<FeaturesSection />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/user-roles" element={<UserRoles />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ChangePassword />} />
        <Route path="/resident-register" element={<ResidentSignup />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/security/*" element={<SecurityRoutes />} />
          <Route path="/resident/*" element={<ResidentRoutes />} />

          {/* Admin Routes */}
          <Route path="/admin/*">
            <Route path="user-management" element={<UserManagement />} /> {/* ✅ Fixed */}
            <Route path="manage-residents" element={<ManageResidents />} />
            </Route>
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
