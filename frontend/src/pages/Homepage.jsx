import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import HowItWorks from "./HowItWorks";
import FeaturesSection from "./FeaturesSection";
import UserRoles from "./UserRoles";

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-screen bg-background flex flex-col items-center">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/signup.jpeg')] bg-cover bg-center opacity-40"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-text px-6 md:px-12 flex flex-col items-center justify-center h-screen">
        <motion.h1
          className="text-3xl md:text-5xl font-bold text-primary"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Smart & Secure Society Management System
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mt-4 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Ensuring safety and convenience with digital verification & QR-based security.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-8 flex flex-col md:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          <Link to="/resident-register" className="bg-secondary text-white px-6 py-3 rounded-lg shadow-md hover:bg-primary transition">
            Register as Resident
          </Link>

          <Link to="/login" className="bg-secondary text-white px-6 py-3 rounded-lg shadow-md hover:bg-primary transition">
            Register as Security Guard
          </Link>
          <Link to="/login" className="bg-primary text-white px-6 py-3 rounded-lg shadow-md hover:bg-secondary transition">
            Admin Login
          </Link>
        </motion.div>
      </div>

      {/* Additional Sections */}
      <FeaturesSection />
      <HowItWorks />
      <UserRoles />
    </div>
  );
};

export default HeroSection;
