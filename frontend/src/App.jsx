import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Homepage";
import FeaturesSection from "./pages/FeaturesSection";
import HowItWorks from "./pages/HowItWorks";
import UserRoles from "./pages/UserRoles";
import Testimonials from "./pages/Testimonials";
import ContactUs from "./pages/ContactUs";
import Register from "./pages/Signup"; // Ensure Register component exists
import Login from "./pages/Login"; 
import ResidentRoutes from "./router/ResidentRoutes";
import AboutUs from "./pages/About";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<FeaturesSection />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/user-roles" element={<UserRoles />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} /> 

        {/* Include resident-related routes */}
        <Route path="/resident/*" element={<ResidentRoutes />} />
        </Routes>
      <Footer />
    </>
  );
}

export default App;
