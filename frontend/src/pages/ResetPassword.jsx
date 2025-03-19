import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const otpInputRef = useRef(null);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const requestOTP = async () => {
  if (!email) {
    toast.error("Please enter your email.");
    return;
  }
  if (!isValidEmail(email)) {
    toast.error("Please enter a valid email.");
    return;
  }
  setLoading(true);

  // Using toast.promise correctly
  const otpPromise = axios.post("http://localhost:5000/api/auth/request-otp", { email });

  toast.promise(otpPromise, {
    pending: "Sending OTP...",
    success: "OTP sent successfully!",
    error: "Failed to send OTP. Please try again.",
  });

  try {
    const response = await otpPromise; // Await the request here
    setStep(2);
    setTimeout(() => otpInputRef.current?.focus(), 500);
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to send OTP.");
  } finally {
    setLoading(false);
  }
};


  const changePassword = async () => {
    if (!otp) {
      toast.error("Please enter OTP.");
      return;
    }
    if (!newPassword || !confirmNewPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/api/auth/change-password", {
        email,
        otp,
        newPassword,
      });
      toast.success(response.data.message);
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4">Reset Password</h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <button
              onClick={requestOTP}
              className="w-full py-2 rounded mt-4 bg-blue-500 text-white"
              disabled={loading}
            >
              {loading ? "Sending OTP" : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded mt-2"
              ref={otpInputRef}
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <button
              onClick={changePassword}
              className="w-full py-2 rounded mt-4 bg-green-500 text-white"
            >
              Change Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
