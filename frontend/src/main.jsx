import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./Context/AuthContext"; // ✅ Fix Import Path
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  </BrowserRouter>
);
