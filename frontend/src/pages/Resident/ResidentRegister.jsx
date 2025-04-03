import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Shield, User, Mail, Lock, Phone, Home, LogIn, Key, ArrowLeft } from "lucide-react";
import SignupImage from "../../assets/signup.jpeg";
import OTPInput from "react-otp-input";

const ResidentSignup = () => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUserData, setTempUserData] = useState(null);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    flat_no: "",
    role: "resident",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  // Step 1: Submit basic info and request OTP
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Sending OTP to your email...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register-step1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          flat_no: user.flat_no.toString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.update(toastId, {
          render: "OTP sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setTempUserData(data.tempUserData);
        setStep(2);
      } else {
        toast.update(toastId, {
          render: data.message || "Registration failed!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Network error. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Registration Error!", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Verifying OTP and creating your account...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/register-step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          otp,
          tempUserData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.update(toastId, {
          render: "Registration successful! Pending admin approval.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        navigate("/login");
      } else {
        toast.update(toastId, {
          render: data.message || "OTP verification failed!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Network error. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("OTP Verification Error!", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Resending OTP...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.update(toastId, {
          render: "New OTP sent successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        toast.update(toastId, {
          render: data.message || "Failed to resend OTP",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Network error. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-24 pb-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Image */}
          <div className="md:w-1/2 bg-gradient-to-b from-primary to-primary-dark hidden md:flex items-center justify-center p-8">
            <div className="text-center text-white">
              <Shield className="h-16 w-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">
                {step === 1 ? "Welcome Resident" : "Verify Your Email"}
              </h1>
              <p className="text-gray-300">
                {step === 1
                  ? "Join your community's security network"
                  : "Enter the 6-digit code sent to your email"}
              </p>
              <div className="mt-8">
                <img 
                  src={SignupImage} 
                  alt="Security System" 
                  className="rounded-lg shadow-lg border-4 border-secondary/30 object-cover h-64 w-full"
                />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-8 md:p-12">
            {step === 1 ? (
              <>
                <div className="text-center mb-8">
                  <Shield className="h-10 w-10 text-secondary mx-auto" />
                  <h2 className="text-2xl font-bold text-primary mt-4">Resident Registration</h2>
                  <p className="text-gray-600 mt-2">Secure access to your community</p>
                </div>

                <form onSubmit={handleSubmitStep1} className="space-y-5">
                  <div className="space-y-1">
                    <label htmlFor="name" className="block text-sm font-medium text-primary">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={user.name}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      />
                    </div>
                  </div>

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
                        value={user.email}
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
                        type="password"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={user.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-primary">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+1 (123) 456-7890"
                        value={user.phone}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="flat_no" className="block text-sm font-medium text-primary">
                      Flat Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="flat_no"
                        name="flat_no"
                        placeholder="A-101"
                        value={user.flat_no}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Sending OTP...' : 'Continue'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-gray-600 hover:text-primary mb-6 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-1" />
                  Back
                </button>

                <div className="text-center mb-8">
                  <Key className="h-10 w-10 text-secondary mx-auto" />
                  <h2 className="text-2xl font-bold text-primary mt-4">Verify Your Email</h2>
                  <p className="text-gray-600 mt-2">
                    Enter the 6-digit code sent to <span className="font-medium">{user.email}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmitStep2} className="space-y-6">
                  <div className="flex justify-center">
                    <OTPInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      renderInput={(props) => (
                        <input
                          {...props}
                          className="w-12 h-12 mx-1 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                      )}
                      shouldAutoFocus
                    />
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors ${isLoading || otp.length !== 6 ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Verifying...' : 'Complete Registration'}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="w-full text-sm text-gray-600 hover:text-primary transition-colors"
                    >
                      Didn't receive code? <span className="font-medium">Resend OTP</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Login Section */}
            {step === 1 && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Already registered?
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in to your account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentSignup;