import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Mail, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import InputField from "./InputField";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import toast from "react-hot-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { requestLoginOtp, verifyLoginOtp, logout, loading, currentUser, isAuthenticated } = useAuth();

  // Step 1 = Email & Password; Step 2 = Two-Step Verification (OTP)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer for resend cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage("");
    toast.success(`Loaded credentials for ${demoEmail}`);
  };

  // Step 1: Submit email & password to request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage("Please enter both your registered email and password.");
      toast.error("Please enter email and password.");
      return;
    }

    const result = await requestLoginOtp({
      email: cleanEmail,
      password: password.trim(),
    });

    if (result.success) {
      setStep(2);
      setOtpCode("");
      setResendCooldown(30);
      toast.success(`Verification code sent to ${cleanEmail}! Please check your email inbox.`);
    } else {
      setErrorMessage(result.message || "Invalid credentials.");
      toast.error(result.message || "Invalid credentials.");
    }
  };

  // Step 2: Submit OTP to verify and start session
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    const result = await verifyLoginOtp({
      email: email.trim().toLowerCase(),
      code: cleanOtp,
    });

    if (result.success) {
      toast.success(`Welcome back, ${result.user?.fullName || "Student"}!`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      setErrorMessage(result.message || "Invalid verification code.");
      toast.error(result.message || "Invalid verification code.");
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage("");
    const result = await requestLoginOtp({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (result.success) {
      setResendCooldown(30);
      toast.success(`A new verification code was sent to ${email}. Please check your inbox.`);
    } else {
      setErrorMessage(result.message || "Failed to resend code.");
      toast.error(result.message || "Failed to resend code.");
    }
  };

  return (
    <div className="w-[450px] max-w-full rounded-3xl bg-white p-8 sm:p-10 shadow-xl border border-slate-100">
      {/* Active Session Notification */}
      {isAuthenticated && (
        <div className="mb-6 rounded-2xl bg-indigo-50/90 p-4 border border-indigo-200">
          <p className="text-xs font-semibold text-indigo-950">
            Currently active session:
          </p>
          <p className="text-sm font-bold text-indigo-700 mt-0.5">
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
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 border border-rose-200 text-rose-800 text-xs leading-relaxed animate-in fade-in">
          <ShieldAlert size={18} className="shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">There was a problem</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Email & Password */}
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sign In</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your registered credentials to receive your verification code.
            </p>
          </div>

          {/* Demo Credentials Quick-Fill */}
          <div className="rounded-2xl bg-indigo-50/60 p-3.5 border border-indigo-100">
            <p className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider mb-2">
              Registered Test Account:
            </p>
            <button
              type="button"
              onClick={() => handleQuickFill("subhi@example.com", "password123")}
              className="w-full rounded-lg bg-white border border-indigo-200 py-2 px-3 text-xs font-medium text-indigo-950 shadow-sm hover:bg-indigo-50 transition text-left flex items-center justify-between"
            >
              <div>
                <span className="font-semibold">🎓 Subhi Sharma</span>
                <span className="block text-[10px] text-indigo-500 font-mono">subhi@example.com</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded">1-Click Fill</span>
            </button>
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

          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-indigo-600 rounded" />
              Remember Me
            </label>

            <button
              type="button"
              className="text-indigo-600 hover:underline font-medium"
              onClick={() => toast("A password reset link will be sent to your registered email.")}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Checking credentials...</span>
              </>
            ) : (
              <span>Continue →</span>
            )}
          </button>

          <p className="pt-2 text-center text-xs text-slate-400">
            Protected by Amazon-style Two-Step Verification.
          </p>

          <p className="pt-4 text-center text-sm text-slate-600 border-t border-slate-100">
            Don't have an account?
            <Link
              to={ROUTES.REGISTER}
              className="ml-2 font-semibold text-indigo-600 hover:underline"
            >
              Register here
            </Link>
          </p>
        </form>
      ) : (
        /* STEP 2: Amazon-Style Two-Step Verification (OTP) */
        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeft size={14} /> Back to email & password
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Two-Step Verification</h1>
              <p className="text-xs text-slate-500">Security checkpoint</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <p>
              For added security, please enter the One-Time Password (OTP) that has been sent to:
            </p>
            <p className="mt-1 font-semibold text-slate-900 text-sm flex items-center gap-1.5">
              <Mail size={14} className="text-indigo-600" /> {email}
            </p>
          </div>


          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Enter 6-Digit OTP Code
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtpCode(val);
                  setErrorMessage("");
                }}
                placeholder="••••••"
                autoFocus
                className="w-full rounded-2xl border-2 border-indigo-200 bg-white px-4 py-3.5 text-center text-2xl font-mono font-bold tracking-[0.5em] text-slate-900 shadow-inner focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <p className="mt-1.5 text-right text-[11px] text-slate-400">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full rounded-xl bg-indigo-600 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Verifying OTP & Starting Session...</span>
              </>
            ) : (
              <span>Verify & Sign In</span>
            )}
          </button>

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
            <span className="text-slate-500">Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={resendCooldown > 0 ? "animate-spin" : ""} />
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;