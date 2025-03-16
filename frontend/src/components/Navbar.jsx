import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // Import icons for mobile menu

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-primary text-white fixed w-full top-0 shadow-md z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-secondary">
          Society Security System
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-background">
          <Link to="/" className="hover:text-secondary">Home</Link>
          <Link to="/about" className="hover:text-secondary">About Us</Link>
          <Link to="/features" className="hover:text-secondary">Features</Link>
          <Link to="/login" className="hover:text-secondary">Login</Link>
          <Link to="/register" className="hover:text-secondary">Register</Link>
          <Link to="/contact" className="hover:text-secondary">Contact Us</Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary px-6 py-4 space-y-4">
          <Link to="/" className="block text-white" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" className="block text-white" onClick={() => setIsOpen(false)}>About Us</Link>
          <Link to="/features" className="block text-white" onClick={() => setIsOpen(false)}>Features</Link>
          <Link to="/login" className="block text-white" onClick={() => setIsOpen(false)}>Login</Link>
          <Link to="/register" className="block text-white" onClick={() => setIsOpen(false)}>Register</Link>
          <Link to="/contact" className="block text-white" onClick={() => setIsOpen(false)}>Contact Us</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
