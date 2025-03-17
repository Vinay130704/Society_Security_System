import { createContext, useContext, useState } from "react";

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);  // ✅ Add token state
  const [role, setRole] = useState(null); // ✅ Store user role

  const loginUser = (token, role) => {
    setToken(token);
    setRole(role);
    setIsLoggedIn(true);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  };

  const logoutUser = () => {
    setToken(null);
    setRole(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loginUser, logoutUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
