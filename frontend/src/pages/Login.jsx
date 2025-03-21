import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginImage from "../assets/signup.jpeg"; // Ensure the image path is correct
import { useAuth } from "../Context/AuthContext"; // Corrected import path
import { toast } from "react-toastify";

const URL = "http://localhost:5000/api/auth/login";

const Login = () => {
  const { setToken } = useAuth() || {}; // Prevent errors if context is not available
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData),
        });

        const data = await response.json();
        console.log("Server Response:", data); // ✅ Debugging

        if (response.ok) {
            toast.success("Login successful!");

            // ✅ Store JWT token and user role
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            // ✅ Update AuthContext if available
            if (setToken) setToken(data.token);

            // ✅ Check if it's a first-time login with a temporary password
            if (data.isTempPassword) {
                toast.info("You must reset your password before proceeding.");
                navigate("/reset-password");
                return;
            }

            // ✅ Navigate based on user role
            const roleRedirects = {
                admin: "/admin/admin-dashboard",
                resident: "/resident/resident-dashboard",
                security: "/security/security-dashboard",
            };

            const redirectPath = roleRedirects[data.role];

            if (redirectPath) {
                console.log("Navigating to:", redirectPath); // ✅ Debugging
                navigate(redirectPath);
            } else {
                console.warn("Invalid role received:", data.role);
                toast.error("Invalid role detected. Please contact support.");
            }
        } else {
            if (data.extraDetails) {
                toast.info(data.extraDetails);
            } else {
                toast.error(data.message || "Login failed!");
            }
        }
    } catch (error) {
        console.error("Error during login:", error);
        toast.error("Something went wrong. Please try again.");
    }
};

  

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-[800px]">
        {/* Left Side Image */}
        <div className="w-1/2 hidden md:flex items-center justify-center bg-primary">
          <img src={LoginImage} alt="Login" className="w-full h-full object-cover" />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center text-primary mb-4">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleChange} className="w-full p-2 border rounded-md"  />
            <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleChange} className="w-full p-2 border rounded-md"  />

            <button type="submit" className="w-full bg-secondary text-white py-2 rounded-md hover:bg-primary transition">Login</button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            Don't have an account? 
            <a href="/resident-register" className="text-primary font-bold hover:underline ml-1">Sign Up</a>
          </p>
          <p className="text-center mt-4 text-gray-600">
            Reset Password 
            <a href="/reset-password" className="text-primary font-bold hover:underline ml-1">Reset Password</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
