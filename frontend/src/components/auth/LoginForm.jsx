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

      {/* STEP 1: Email & Password */}
      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Sign In</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Enter your registered credentials to receive your verification code.
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
        /* STEP 2: Two-Step Verification (OTP) */
        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setErrorMessage("");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
          >
            <ArrowLeft size={14} /> Back to email & password
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Two-Step Verification</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Security checkpoint</p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              For added security, please enter the One-Time Password (OTP) that has been sent to:
            </p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <Mail size={14} className="text-indigo-600 dark:text-indigo-400" /> {email}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                className="w-full rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 px-4 py-3.5 text-center text-2xl font-mono font-bold tracking-[0.5em] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950"
              />
            </div>
            <p className="mt-1.5 text-right text-[11px] text-slate-400 dark:text-slate-500">
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

          {slowServerNotice && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5 border border-amber-200 dark:border-amber-800 text-center animate-in fade-in">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                ⚡ Server waking up from standby (free tier)...
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                Verifying your OTP with database. Please hold on!
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
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