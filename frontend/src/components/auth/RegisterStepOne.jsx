import { useEffect, useState } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { BRANCH_OPTIONS, COLLEGE_OPTIONS, YEAR_OPTIONS } from "../../data/registerOptions";
import authService from "../../services/authService";
import { CheckCircle2, Mail, RefreshCw, Send, ShieldAlert, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const RegisterStepOne = ({
  formData,
  errors,
  handleChange,
  setFormData,
}) => {
  const [codeSent, setCodeSent] = useState(Boolean(formData.verificationCode));
  const [localCode, setLocalCode] = useState(formData.verificationCode || "");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendCode = async () => {
    setVerifyError("");
    const cleanEmail = (formData.email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }

    setSending(true);
    try {
      const res = await authService.sendVerificationCode(cleanEmail);
      setCodeSent(true);
      setLocalCode("");
      setResendCooldown(30);
      toast.success(`Verification code sent to ${cleanEmail}! Please check your email inbox.`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Could not send verification code. Please check your email address.";
      setVerifyError(msg);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerifyError("");
    const codeToVerify = (localCode || formData.verificationCode || "").trim();
    if (!codeToVerify || codeToVerify.length !== 6) {
      setVerifyError("Please enter the complete 6-digit verification code.");
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifying(true);
    try {
      await authService.verifyEmail(formData.email.trim().toLowerCase(), codeToVerify);
      setFormData((prev) => ({
        ...prev,
        isVerified: true,
        verificationCode: codeToVerify,
      }));
      toast.success("Email verified successfully! ✓");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Invalid or expired verification code. Please check and try again.";
      setVerifyError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-5">
      <FormInput
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="e.g. Rahul Sharma"
        required
        error={errors.fullName}
        autoComplete="name"
      />

      {/* Email + Amazon-Style OTP Verification Section */}
      <div>
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            handleChange(e);
            setCodeSent(false);
            setLocalCode("");
            setVerifyError("");
          }}
          placeholder="yourname@college.edu or gmail.com"
          required
          error={errors.email}
          autoComplete="email"
        />

        {/* Verification Status & Trigger Button */}
        <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {formData.isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 self-start">
              <CheckCircle2 size={15} /> Verified Email ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || !formData.email || resendCooldown > 0}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed self-start"
            >
              <Send size={13} />
              {sending
                ? "Sending OTP..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : codeSent
                ? "Resend Verification Code"
                : "Verify Email (Send OTP)"}
            </button>
          )}

          {!formData.isVerified && (
            <span className="text-[11px] text-slate-400">
              * Required before continuing
            </span>
          )}
        </div>

        {/* In-line verification error */}
        {verifyError && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 border border-rose-200 text-xs text-rose-800">
            <ShieldAlert size={15} className="shrink-0 text-rose-600" />
            <span>{verifyError}</span>
          </div>
        )}

        {/* Amazon-Style Dedicated OTP Verification Box */}
        {codeSent && !formData.isVerified && (
          <div className="mt-3.5 rounded-2xl bg-indigo-50/50 p-3.5 sm:p-4 border border-indigo-200 animate-in fade-in space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-950">
              <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
              <span className="break-words">Two-Step Verification: Enter 6-digit code sent to {formData.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="6-digit code"
                maxLength={6}
                value={localCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setLocalCode(val);
                  setFormData((prev) => ({ ...prev, verificationCode: val }));
                  setVerifyError("");
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 bg-white"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifying || localCode.length !== 6}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
              >
                {verifying ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Verify OTP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="At least 6 characters"
          required
          error={errors.password}
          autoComplete="new-password"
        />

        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          required
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
          College / Institution (Optional)
        </label>
        <div className="relative">
          <input
            type="text"
            name="college"
            list="college-options-list"
            value={formData.college}
            onChange={handleChange}
            placeholder="Select or type your college..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
          <datalist id="college-options-list">
            {COLLEGE_OPTIONS.map((c) => (
              <option key={c.value} value={c.label} />
            ))}
          </datalist>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Featured:</span>
          <button
            type="button"
            onClick={() => setFormData((prev) => ({ ...prev, college: "GL Bajaj Institute of Technology and Management" }))}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg px-2 py-0.5 border border-indigo-200 dark:border-indigo-800 transition"
          >
            + GL Bajaj Institute of Technology and Management
          </button>
        </div>
        {errors.college && <p className="mt-1 text-xs text-rose-500">{errors.college}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormSelect
          label="Branch (Optional)"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          options={BRANCH_OPTIONS}
          error={errors.branch}
        />

        <FormSelect
          label="Year of Study (Optional)"
          name="year"
          value={formData.year}
          onChange={handleChange}
          options={YEAR_OPTIONS}
          error={errors.year}
        />
      </div>
    </div>
  );
};

export default RegisterStepOne;