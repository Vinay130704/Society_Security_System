import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Mail, Lock, Key, ArrowLeft, CheckCircle } from "react-feather";
import OTPInput from "react-otp-input";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2-minute timer
  const [success, setSuccess] = useState(false);
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const requestOTP = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        axios.post("http://localhost:5000/api/auth/request-otp", { email }),
        {
          pending: "Sending OTP to your email...",
          success: "OTP sent successfully!",
          error: "Failed to send OTP. Please try again.",
        }
      );
      setStep(2);
      setTimer(120); // Reset timer
    } catch (error) {
      console.error("OTP request error:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }
    if (timer <= 0) {
      toast.error("OTP has expired. Please request a new one");
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp }),
        {
          pending: "Verifying OTP...",
          success: "OTP verified successfully!",
          error: "Invalid OTP. Please try again.",
        }
      );
      setStep(3);
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter and confirm your new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        axios.post("http://localhost:5000/api/auth/change-password", {
          email,
          otp,
          newPassword,
        }),
        {
          pending: "Updating your password...",
          success: "Password changed successfully!",
          error: "Failed to change password. Please try again.",
        }
      );
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Password change error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (timer > 60) {
      toast.info(`Please wait ${timer - 60} seconds before resending`);
      return;
    }

    setLoading(true);
    try {
      await toast.promise(
        axios.post("http://localhost:5000/api/auth/resend-otp", { email }),
        {
          pending: "Resending OTP...",
          success: "New OTP sent successfully!",
          error: "Failed to resend OTP. Please try again.",
        }
      );
      setTimer(120); // Reset timer
    } catch (error) {
      console.error("Resend OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Changed!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been updated successfully. Redirecting to login...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  step >= i ? "bg-blue-500" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  ref={emailInputRef}
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={requestOTP}
              disabled={loading || !email}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white ${
                loading || !email
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <button
              onClick={() => setStep(1)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <div className="text-center mb-4">
              <Key className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-800">
                Enter Verification Code
              </h3>
              <p className="text-gray-600">
                Sent to <span className="font-medium">{email}</span>
              </p>
              <div
                className={`text-sm mt-1 ${
                  timer < 30 ? "text-red-500" : "text-gray-500"
                }`}
              >
                Expires in: {formatTime(timer)}
              </div>
            </div>

            <div className="flex justify-center">
              <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-12 h-12 mx-1 text-center text-xl border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                shouldAutoFocus
              />
            </div>

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6 || timer <= 0}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white ${
                loading || otp.length !== 6 || timer <= 0
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={resendOTP}
              disabled={loading || timer > 60}
              className={`w-full text-sm text-center ${
                loading || timer > 60
                  ? "text-gray-400"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              Didn't receive code?{" "}
              <span className="font-medium">Resend OTP</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>

            <div className="text-center mb-4">
              <Lock className="w-10 h-10 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-800">
                Create New Password
              </h3>
              <p className="text-gray-600">
                Your new password must be different from previous ones
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 8 characters with at least one number and special character
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={changePassword}
              disabled={
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 8
              }
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white ${
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 8
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } transition-colors`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;