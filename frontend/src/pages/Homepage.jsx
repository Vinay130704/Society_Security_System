import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Home, User, Lock } from "lucide-react";
import HowItWorks from "../components/HowItWorks";
import FeaturesSection from "../components/FeaturesSection";
import UserRoles from "../components/UserRoles";

const HeroSection = () => {
  return (
    <div className="relative w-full min-h-screen bg-background overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-secondary opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-primary opacity-10 blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-secondary-dark opacity-5 blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 py-24">
        {/* Animated Icons */}
        <motion.div 
          className="mb-8 flex gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <Shield className="h-8 w-8 text-secondary" />
          </div>
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <Home className="h-8 w-8 text-secondary" />
          </div>
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <User className="h-8 w-8 text-secondary" />
          </div>
          <div className="p-4 bg-white rounded-xl shadow-lg">
            <Lock className="h-8 w-8 text-secondary" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-primary mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-secondary to-secondary-dark bg-clip-text text-transparent">
            Guardian
          </span> 
          <span className="text-primary">Net</span>
        </motion.h1>

        <motion.h2
          className="text-2xl md:text-4xl font-semibold text-primary mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Smart Society Security System
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-text max-w-3xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Advanced digital verification and QR-based security for modern residential communities
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 justify-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Link 
            to="/resident-register" 
            className="px-8 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Register as Resident
          </Link>

          <Link 
            to="/login" 
            className="px-8 py-3 bg-white text-primary border-2 border-secondary font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Security Login
          </Link>

          <Link 
            to="/login" 
            className="px-8 py-3 bg-primary text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Admin Login
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {[
            { value: "100%", label: "Secure" },
            { value: "24/7", label: "Monitoring" },
            { value: "QR", label: "Verified" },
            { value: "Instant", label: "Alerts" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div className="text-2xl font-bold text-secondary">{stat.value}</div>
              <div className="text-sm text-text">{stat.label}</div>
            </div>
          ))}
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