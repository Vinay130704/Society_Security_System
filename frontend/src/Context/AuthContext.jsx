import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const LogoutUser = () => {
    console.log("Logging out...");
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    setTimeout(() => {
      window.location.href = "/login"; // ✅ Redirect to login page
    }, 100);
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
