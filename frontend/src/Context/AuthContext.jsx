import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { jwtDecode } from "jwt-decode"; // Use named import

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const navigate = useNavigate(); // Use React Router navigation

  // Function to check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now(); // Convert exp from seconds to milliseconds
    } catch (error) {
      return true; // If decoding fails, treat it as expired
    }
  };

  useEffect(() => {
    if (isTokenExpired(token)) {
      LogoutUser();
    } else {
      setIsLoggedIn(true);

      // Auto logout when token expires
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000 - Date.now(); // Time left in milliseconds
      const timeout = setTimeout(() => LogoutUser(), expiryTime);
      
      return () => clearTimeout(timeout); // Cleanup timer on unmount
    }
  }, [token]);

  const LogoutUser = () => {
    console.log("Logging out...");
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    
    // Redirect without page refresh
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, setToken, LogoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
