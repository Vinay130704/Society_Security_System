import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoginImage from "../assets/signup.jpeg";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";
import { Shield, Lock, Mail, Eye, EyeOff } from "lucide-react";

const URL = "http://localhost:5000/api/auth/login";

const Login = () => {
  const { setToken } = useAuth() || {};
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        if (setToken) setToken(data.token);

        if (data.isTempPassword) {
          toast.info("You must reset your password before proceeding.");
          navigate("/reset-password");
          return;
        }

        const roleRedirects = {
          admin: "/admin/admin-dashboard",
          resident: "/resident/resident-dashboard",
          security: "/security/security-dashboard",
        };

        const redirectPath = roleRedirects[data.role];
        navigate(redirectPath || "/");
      } else {
        toast.error(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Image */}
          <div className="md:w-1/2 bg-primary hidden md:flex items-center justify-center p-8">
            <div className="text-center text-white">
              <Shield className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Welcome to GuardianNet</h1>
              <p className="text-blue-100">Your community's security is our top priority</p>
              <div className="mt-8">
                <img 
                  src={LoginImage} 
                  alt="Security System" 
                  className="rounded-lg shadow-lg border-4 border-blue-300/30 object-cover h-64 w-full"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-8 md:p-12">
            <div className="text-center mb-8">
              <Shield className="h-10 w-10 text-secondary mx-auto" />
              <h2 className="text-2xl font-bold text-primary mt-4">Sign In</h2>
              <p className="text-gray-600 mt-2">Secure access to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-primary">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-primary">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/reset-password"
                    className="font-medium text-secondary hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  to="/resident-register"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                >
                  Create new account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;