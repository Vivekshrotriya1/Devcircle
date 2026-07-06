import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const ForgotPassword = () => {
  const [emailId, setEmailId] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (value) => {
    setEmailId(value);
    setOtp("");
    setPassword("");
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setError("");
    setSuccessMessage("");
  };

  const handleSendOtp = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setIsLoading(true);

      const res = await axios.post(BASE_URL + "/forgot-password/send-otp", {
        emailId,
      });

      setIsOtpSent(true);
      setIsOtpVerified(false);
      setOtp("");
      setSuccessMessage(
        res.data?.devOtp
          ? `Email is not configured locally. Your test OTP is ${res.data.devOtp}.`
          : "OTP sent to your email."
      );
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setIsLoading(true);

      await axios.post(BASE_URL + "/forgot-password/verify-otp", {
        emailId,
        otp,
      });

      setIsOtpVerified(true);
      setSuccessMessage("OTP verified. Please create your new password.");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setIsLoading(true);

      await axios.post(BASE_URL + "/forgot-password/reset", {
        emailId,
        password,
      });

      setSuccessMessage("Password reset successfully. Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090f] px-4 py-10">
      <Link
        to="/"
        className="absolute left-5 top-5 text-2xl font-black text-white md:left-8 md:top-8"
      >
        DevCircle
      </Link>
      <div className="card w-full max-w-md bg-base-300 shadow-2xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Forgot Password</h2>

          <label className="form-control w-full max-w-xs my-2">
            <div className="label">
              <span className="label-text">Email ID:</span>
            </div>
            <input
              type="text"
              value={emailId}
              className="input input-bordered w-full max-w-xs"
              onChange={(e) => handleEmailChange(e.target.value)}
            />
          </label>

          {!isOtpVerified && (
            <div className="w-full max-w-xs my-4">
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={handleSendOtp}
                disabled={isLoading || !emailId}
              >
                {isOtpSent ? "Resend OTP" : "Send OTP"}
              </button>

              {isOtpSent && (
                <div className="mt-3">
                  <label className="form-control w-full">
                    <div className="label">
                      <span className="label-text">Enter OTP</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="6"
                      value={otp}
                      className="input input-bordered w-full"
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-primary mt-3 w-full"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otp.length !== 6}
                  >
                    Verify OTP
                  </button>
                </div>
              )}
            </div>
          )}

          {isOtpVerified && (
            <label className="form-control w-full max-w-xs my-2">
              <div className="label">
                <span className="label-text">New Password</span>
              </div>
              <input
                type="password"
                value={password}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}

          <p className="text-red-500">{error}</p>
          {successMessage && (
            <p className="text-green-400">{successMessage}</p>
          )}

          {isOtpVerified && (
            <div className="card-actions justify-center m-2">
              <button
                className="btn btn-primary"
                onClick={handleResetPassword}
                disabled={isLoading || !password}
              >
                Save Password
              </button>
            </div>
          )}

          <Link to="/login" className="m-auto cursor-pointer py-2">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
