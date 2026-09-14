import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock, Mail, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import InputField from "./InputField";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import toast from "react-hot-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, forgotPasswordRequestOtp, forgotPasswordVerifyAndReset, logout, loading, currentUser, isAuthenticated } = useAuth();

  // Mode: "login" or "forgot-password"
  const [mode, setMode] = useState("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password form state
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter Code & New Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [slowServerNotice, setSlowServerNotice] = useState(false);

  // Monitor loading to show cold-start message if server takes >3.5s
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setSlowServerNotice(true), 3500);
    } else {
      setSlowServerNotice(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // Timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Direct Standard Login (No OTP needed for registered users)
  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage("Please enter both your registered email and password.");
      toast.error("Please enter email and password.");
      return;
    }

    const result = await login({
      email: cleanEmail,
      password: password.trim(),
    });

    if (result.success) {
      toast.success(`Welcome back, ${result.user?.fullName || "Student"}!`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      setErrorMessage(result.message || "Incorrect email or password.");
      toast.error(result.message || "Incorrect email or password.");
    }
  };

  // Step 1 of Forgot Password: Send OTP to email
  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      toast.error("Please enter your email address.");
      return;
    }

    const result = await forgotPasswordRequestOtp(cleanEmail);
    if (result.success) {
      setForgotStep(2);
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setResendCooldown(30);
      toast.success(`Reset code sent to ${cleanEmail}! Please check your inbox.`);
    } else {
      setErrorMessage(result.message || "Failed to send reset code.");
      toast.error(result.message || "Failed to send reset code.");
    }
  };

  // Step 2 of Forgot Password: Verify OTP and save new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanCode = resetCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      toast.error("Please enter the 6-digit code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      toast.error("Passwords do not match.");
      return;
    }

    const result = await forgotPasswordVerifyAndReset({
      email: resetEmail.trim().toLowerCase(),
      code: cleanCode,
      new_password: newPassword.trim(),
    });

    if (result.success) {
      toast.success("Password updated successfully! Logging you in...");
      // Immediately log the user in with their new password
      const loginResult = await login({
        email: resetEmail.trim().toLowerCase(),
        password: newPassword.trim(),
      });

      if (loginResult.success) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      } else {
        // Fallback: switch back to login mode with email pre-filled
        setEmail(resetEmail);
        setMode("login");
      }
    } else {
      setErrorMessage(result.message || "Failed to reset password.");
      toast.error(result.message || "Failed to reset password.");
    }
  };

  // Resend reset OTP
  const handleResendResetOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage("");
    const result = await forgotPasswordRequestOtp(resetEmail.trim().toLowerCase());
    if (result.success) {
      setResendCooldown(30);
      toast.success(`New reset code sent to ${resetEmail}.`);
    } else {
      setErrorMessage(result.message || "Failed to resend code.");
      toast.error(result.message || "Failed to resend code.");
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-10 shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Active Session Notification */}
      {isAuthenticated && (
        <div className="mb-6 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/60 p-4 border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
            Currently active session:
          </p>
          <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mt-0.5">
            {currentUser?.fullName || "Student"} ({currentUser?.email})
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to={ROUTES.DASHBOARD}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Go to Dashboard →
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs leading-relaxed animate-in fade-in">
          <ShieldAlert size={18} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900 dark:text-rose-200">There was a problem</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. STANDARD LOGIN MODE (Direct Email + Password, No OTP) */}
      {/* ========================================================= */}
      {mode === "login" && (
        <form onSubmit={handleDirectLogin} className="space-y-4 animate-in fade-in">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sign In</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Welcome back to SkillSync AI. Enter your credentials to continue.
            </p>
          </div>

          <InputField
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrorMessage("");
            }}
            required
            autoComplete="email"
          />

          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrorMessage("");
            }}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-indigo-600 rounded" />
              Remember Me
            </label>

            <button
              type="button"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              onClick={() => {
                setResetEmail(email);
                setForgotStep(1);
                setErrorMessage("");
                setMode("forgot-password");
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In →</span>
            )}
          </button>

          {slowServerNotice && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5 border border-amber-200 dark:border-amber-800 text-center animate-in fade-in">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                ⚡ Server waking up from standby (free tier)...
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                Connecting to cloud database. Please hold on a moment!
              </p>
            </div>
          )}

          <p className="pt-4 text-center text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            Don't have an account?
            <Link
              to={ROUTES.REGISTER}
              className="ml-2 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Register here
            </Link>
          </p>
        </form>
      )}

      {/* ========================================================= */}
      {/* 2. FORGOT PASSWORD MODE (OTP strictly for password reset) */}
      {/* ========================================================= */}
      {mode === "forgot-password" && (
        <div className="space-y-4 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>

          {/* Sub-step 1: Request Reset Code */}
          {forgotStep === 1 && (
            <form onSubmit={handleRequestResetOtp} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <KeyRound size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Password</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Account recovery</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Enter your registered email address and we will send you a 6-digit verification code to reset your password.
              </p>

              <InputField
                label="Registered Email Address"
                type="email"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setErrorMessage("");
                }}
                required
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Send Reset Code (OTP) →</span>
                )}
              </button>
            </form>
          )}

          {/* Sub-step 2: Enter OTP & Set New Password */}
          {forgotStep === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Lock size={22} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Password</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter code & choose new password</p>
                </div>
              </div>

              <div className="rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 p-3 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200">
                <span>Code sent to: </span>
                <span className="font-bold">{resetEmail}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setResetCode(val);
                    setErrorMessage("");
                  }}
                  placeholder="••••••"
                  autoFocus
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-center text-xl font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950"
                />
              </div>

              <InputField
                label="New Password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMessage("");
                }}
                required
              />

              <InputField
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setErrorMessage("");
                }}
                required
              />

              <button
                type="submit"
                disabled={loading || resetCode.length !== 6 || newPassword.length < 6}
                className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password & Sign In →</span>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendResetOtp}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={12} className={resendCooldown > 0 ? "animate-spin" : ""} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginForm;