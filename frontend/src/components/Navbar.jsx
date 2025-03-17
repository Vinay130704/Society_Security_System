import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../Context/AuthContext"; // ✅ Import useAuth

const Navbar = () => {
  const { isLoggedIn, LogoutUser } = useAuth(); // ✅ Now useAuth is defined
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
          <NavLink to="/" className="hover:text-secondary">Home</NavLink>
          <NavLink to="/about" className="hover:text-secondary">About Us</NavLink>
          <NavLink to="/features" className="hover:text-secondary">Features</NavLink>
          <NavLink to="/contact" className="hover:text-secondary">Contact Us</NavLink>
          {isLoggedIn ? (
            <button
              onClick={LogoutUser}
              className="py-2 px-4 bg-red-500 hover:bg-red-600 rounded-md transition"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="hover:text-secondary">Login</NavLink>
              <NavLink to="/resident/register" className="hover:text-secondary">Register</NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-secondary px-6 py-4 space-y-4">
          <NavLink to="/" className="block text-white" onClick={() => setIsOpen(false)}>Home</NavLink>
          <NavLink to="/about" className="block text-white" onClick={() => setIsOpen(false)}>About Us</NavLink>
          <NavLink to="/features" className="block text-white" onClick={() => setIsOpen(false)}>Features</NavLink>
          <NavLink to="/contact" className="block text-white" onClick={() => setIsOpen(false)}>Contact Us</NavLink>
          {isLoggedIn ? (
            <button
              onClick={() => { LogoutUser(); setIsOpen(false); }}
              className="block py-2 px-4 bg-red-500 hover:bg-red-600 rounded-md transition text-center w-full"
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" className="block text-white" onClick={() => setIsOpen(false)}>Login</NavLink>
              <NavLink to="/resident/register" className="block text-white" onClick={() => setIsOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
