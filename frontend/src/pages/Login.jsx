import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginImage from "../assets/signup.jpeg"; // Change as per your asset name

const URL = "http://localhost:5000/api/auth/login";
const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // Used for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {  // ✅ Add async here
    e.preventDefault();
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
  
      console.log("login form", response);
  
      if (response.ok) {
        alert("Login successful");
        setUser({ email: "", password: "" });
        navigate("/");
      } else {
        alert("Invalid credentials");
        console.log("Invalid credentials");
      }
    } catch (error) {
      console.log("Error during login", error);
      alert("Something went wrong. Please try again.");
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
            <input type="email" name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-2 border rounded-md" required />

            <button type="submit" className="w-full bg-secondary text-white py-2 rounded-md hover:bg-primary transition">Login</button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            Don't have an account? 
            <a href="/register" className="text-primary font-bold hover:underline ml-1">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
