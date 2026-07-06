import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoginForm, setIsLoginForm] = useState(
    location.pathname !== "/signup" && searchParams.get("mode") !== "signup"
  );
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const resetSignupOtpState = () => {
    setOtp("");
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setSuccessMessage("");
  };

  const handleEmailChange = (value) => {
    setEmailId(value);

    if (!isLoginForm) {
      resetSignupOtpState();
      setPassword("");
    }
  };

  const handleSendOtp = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setOtpLoading(true);

      const res = await axios.post(BASE_URL + "/signup/send-otp", { emailId });

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
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setOtpLoading(true);

      await axios.post(BASE_URL + "/signup/verify-otp", { emailId, otp });

      setIsOtpVerified(true);
      setSuccessMessage("Email verified. Please create your password.");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setError("");
      setSuccessMessage("");
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailId,
          password,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      return navigate("/feed");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  const handleSignUp = async () => {
    try {
      setError("");
      setSuccessMessage("");
      const res = await axios.post(
        BASE_URL + "/signup",
        { firstName, lastName, emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data.data));
      return navigate("/profile");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07090f] px-4 py-10 text-slate-100">
      <Link
        to="/"
        className="absolute left-5 top-5 text-2xl font-black text-white md:left-8 md:top-8"
      >
        DevCircle
      </Link>
      <div className="surface-card w-full max-w-md rounded-lg">
        <div className="p-7 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-black text-slate-50">
              {isLoginForm ? "Login" : "Sign Up"}
            </h2>
            <p className="page-subtitle">
              {isLoginForm
                ? "Welcome back to your builder circle."
                : "Create your profile and start meeting builders."}
            </p>
          </div>
          <div>
            {!isLoginForm && (
              <>
                <label className="form-control my-2 w-full">
                  <div className="label">
                    <span className="field-label">First Name</span>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    className="field-input"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>
                <label className="form-control my-2 w-full">
                  <div className="label">
                    <span className="field-label">Last Name</span>
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    className="field-input"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </label>
              </>
            )}
            <label className="form-control my-2 w-full">
              <div className="label">
                <span className="field-label">Email ID</span>
              </div>
              <input
                type="text"
                value={emailId}
                className="field-input"
                onChange={(e) => handleEmailChange(e.target.value)}
              />
            </label>
            {!isLoginForm && (
              <div className="my-4 w-full">
                {!isOtpVerified && (
                  <button
                    type="button"
                    className="secondary-action w-full"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !emailId}
                  >
                    {isOtpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                )}

                {isOtpSent && !isOtpVerified && (
                  <div className="mt-3">
                    <label className="form-control w-full">
                      <div className="label">
                        <span className="field-label">Enter OTP</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength="6"
                        value={otp}
                        className="field-input"
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      className="primary-action mt-3 w-full"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.length !== 6}
                    >
                      Verify OTP
                    </button>
                  </div>
                )}
              </div>
            )}
            {(isLoginForm || isOtpVerified) && (
              <label className="form-control my-2 w-full">
                <div className="label">
                  <span className="field-label">Password</span>
                </div>
                <input
                  type="password"
                  value={password}
                  className="field-input"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            )}
            {isLoginForm && (
              <div className="w-full text-right">
                <Link to="/forgot-password" className="text-sm font-semibold text-cyan-200">
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>
          <p className="mt-3 text-sm font-semibold text-rose-300">{error}</p>
          {successMessage && (
            <p className="mt-3 text-sm font-semibold text-emerald-300">
              {successMessage}
            </p>
          )}
          <div className="mt-6">
            <button
              className="primary-action w-full"
              onClick={isLoginForm ? handleLogin : handleSignUp}
              disabled={!isLoginForm && !isOtpVerified}
            >
              {isLoginForm ? "Login" : "Sign Up"}
            </button>
          </div>

          <p
            className="mt-5 cursor-pointer text-center text-sm font-semibold text-slate-300 hover:text-cyan-200"
            onClick={() => {
              setIsLoginForm((value) => !value);
              setError("");
              setSuccessMessage("");
              resetSignupOtpState();
            }}
          >
            {isLoginForm
              ? "New User? Signup Here"
              : "Existing User? Login Here"}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
