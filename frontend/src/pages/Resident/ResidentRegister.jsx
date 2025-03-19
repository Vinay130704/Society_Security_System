import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignupImage from "../../assets/signup.jpeg";

const ResidentSignup = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    flat_no: "",
    role: "resident",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure flat_no is always a string
    const userData = {
      ...user,
      flat_no: user.flat_no.toString(),
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration Successful!");
        navigate("/");
      } else {
        // Handle validation errors from the backend
        if (data.extraDetails) {
          toast.info(data.extraDetails); // Show backend validation message
        } else {
          toast.error(data.message || "Registration failed!");
        }
      }
    } catch (error) {
      toast.error("Failed to register. Please try again.");
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
          <h2 className="text-2xl font-bold text-center text-primary mb-4">Resident Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" placeholder="Full Name" value={user.name} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="text" name="phone" placeholder="Phone Number" value={user.phone} onChange={handleChange} className="w-full p-2 border rounded-md" required />
            <input type="text" name="flat_no" placeholder="Flat No." value={user.flat_no} onChange={handleChange} className="w-full p-2 border rounded-md" required />

            <button type="submit" className="w-full bg-secondary text-white py-2 rounded-md hover:bg-primary transition">
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResidentSignup;
