import { useEffect, useState } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { BRANCH_OPTIONS, YEAR_OPTIONS } from "../../data/registerOptions";
import authService from "../../services/authService";
import { CheckCircle2, Mail, RefreshCw, Send, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const RegisterStepOne = ({
  formData,
  errors,
  handleChange,
  setFormData,
}) => {
  const [codeSent, setCodeSent] = useState(Boolean(formData.verificationCode));
  const [localCode, setLocalCode] = useState(formData.verificationCode || "");
  const [hostNoticeCode, setHostNoticeCode] = useState("");
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
      if (res?.code) {
        setHostNoticeCode(res.code);
        toast.success(`Verification code generated: ${res.code}`, { duration: 6000 });
      } else {
        setHostNoticeCode("");
        toast.success(`Verification code sent to ${cleanEmail}! Please check your email inbox.`);
      }
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
        <div className="mt-2.5 flex items-center justify-between">
          {formData.isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={15} /> Verified Email ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || !formData.email || resendCooldown > 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Dedicated OTP Verification Box */}
        {codeSent && !formData.isVerified && (
          <div className="mt-3.5 rounded-2xl bg-indigo-50/70 p-4 border border-indigo-200 animate-in fade-in space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <ShieldCheck size={16} className="text-indigo-600" />
              <span>Two-Step Verification: Enter 6-digit code for {formData.email}</span>
            </div>

            {hostNoticeCode && (
              <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600 shrink-0" />
                    Host Verification Code:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalCode(hostNoticeCode);
                      setFormData((prev) => ({ ...prev, verificationCode: hostNoticeCode }));
                      toast.success("Code inserted!");
                    }}
                    className="text-[11px] font-semibold text-indigo-700 bg-white border border-amber-300 px-2 py-0.5 rounded-md hover:bg-amber-100 transition"
                  >
                    Insert Code ⚡
                  </button>
                </div>
                <div className="font-mono text-sm font-extrabold tracking-widest text-amber-950">
                  {hostNoticeCode}
                </div>
                <p className="text-[10px] text-amber-700">
                  Outbound email ports are firewalled on Render free tier. Enter the code above to verify.
                </p>
              </div>
            )}

            <div className="flex gap-2">
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
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 shadow-xs"
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifying || localCode.length !== 6}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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

      <FormInput
        label="College / Institution (Optional)"
        name="college"
        value={formData.college}
        onChange={handleChange}
        placeholder="e.g. GL Bajaj Institute of Technology (can fill later from web)"
        error={errors.college}
      />

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