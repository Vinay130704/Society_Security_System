import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignupImage from "../assets/signup.jpeg";

const URL = "http://localhost:5000/api/auth/register";

const Signup = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "security", // Default to Security
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure flat_no is only sent for residents
    const userData =
      user.role === "resident"
        ? user
        : { name: user.name, email: user.email, password: user.password, phone: user.phone, role: user.role };

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      console.log("Server Response:", responseData);

      if (response.ok) {
        alert("Registration Successful. Awaiting Admin Approval.");
        setUser({
          name: "",
          email: "",
          password: "",
          phone: "",
          role: "security",
         
        });
        navigate("/");
      } else {
        alert(responseData.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Registration Error!", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden w-[800px]">

        {/* Left Side Image */}
        <div className="w-1/2 hidden md:flex items-center justify-center bg-primary">
          <img src={SignupImage} alt="Signup" className="w-full h-full object-cover" />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center text-primary mb-4">Registration Form</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Full Name" value={user.name}
              onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="text" name="phone" placeholder="Phone Number" value={user.phone} onChange={handleChange} className="w-full p-2 border rounded-md" required />

            <select name="role" value={user.role} onChange={handleChange} className="w-full p-2 border rounded-md" required>
              <option value="admin">Admin</option>
              <option value="security">Security</option>
            </select>

            <button type="submit" className="w-full bg-secondary text-white py-2 rounded-md hover:bg-primary transition">Sign Up</button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            Already registered?
            <Link to="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
