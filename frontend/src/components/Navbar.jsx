import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, User, LogOut, Shield, Settings, Bell } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

const Navbar = () => {
  const { isLoggedIn, LogoutUser, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark text-white fixed w-full top-0 shadow-lg z-50 border-b border-primary-light/20">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center space-x-2 group">
          <Shield className="h-8 w-8 text-secondary group-hover:text-white transition-colors" />
          <span className="text-2xl font-bold bg-gradient-to-r from-background to-gray-300 bg-clip-text text-transparent">
            Guardian<span className="font-extrabold">Net</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <NavLink
            to="/"
            className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-primary-light/50 text-white' : 'text-gray-200 hover:text-white hover:bg-primary-light/30'}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-primary-light/50 text-white' : 'text-gray-200 hover:text-white hover:bg-primary-light/30'}`}
          >
            About
          </NavLink>
          {/* <NavLink 
            to="/alerts" 
            className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-primary-light/50 text-white' : 'text-gray-200 hover:text-white hover:bg-primary-light/30'}`}
          >
            Alerts
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-primary-light/50 text-white' : 'text-gray-200 hover:text-white hover:bg-primary-light/30'}`}
          >
            Settings
          </NavLink> */}

          {isLoggedIn ? (
            <div className="flex items-center space-x-4 ml-4">
              <button className="relative p-2 rounded-full hover:bg-primary-light/30 transition-colors">
                <Bell className="h-5 w-5 text-secondary" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-primary-light/70 flex items-center justify-center border border-secondary/30 group-hover:border-secondary/50 transition-all">
                      <User className="h-5 w-5 text-secondary" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary-dark"></span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">{user?.name || "Admin"}</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-primary-dark/95 backdrop-blur-sm rounded-lg shadow-xl py-1 z-50 border border-primary-light/50">
                    <div className="px-4 py-3 border-b border-primary-light">
                      <p className="text-sm text-gray-300">Account</p>
                      <p className="text-sm font-medium text-white truncate">GuardianNet User</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-primary-light/50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" /> Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-primary-light/50 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" /> Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        LogoutUser();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-3 text-sm text-red-300 hover:bg-primary-light/50 hover:text-red-200 transition-colors border-t border-primary-light/50"
                    >
                      <LogOut className="h-4 w-4 mr-3" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-4">
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-medium text-gray-200 hover:text-white hover:bg-primary-light/30 transition-colors"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary hover:bg-secondary-dark text-white transition-colors"
              >
                Get Started
              </NavLink>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-200 hover:text-white hover:bg-primary-light/30 focus:outline-none transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-primary-dark/95 backdrop-blur-sm border-t border-primary-light/50">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <NavLink
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </NavLink>
            {/* <NavLink 
              to="/alerts" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Alerts
            </NavLink>
            <NavLink 
              to="/settings" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Settings
            </NavLink> */}

            {isLoggedIn ? (
              <>
                <div className="border-t border-primary-light/50 pt-2 mt-2">
                  <NavLink
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" /> Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      LogoutUser();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-300 hover:text-red-200 hover:bg-primary-light/30"
                  >
                    <LogOut className="h-5 w-5 mr-3" /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-primary-light/50 pt-4 mt-2 flex flex-col space-y-3">
                <NavLink
                  to="/login"
                  className="w-full text-center px-4 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-primary-light/30"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/resident-register"
                  className="w-full text-center px-4 py-2 rounded-md text-base font-medium bg-secondary hover:bg-secondary-dark text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;