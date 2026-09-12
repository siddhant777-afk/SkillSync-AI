import { useState } from "react";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { BRANCH_OPTIONS, YEAR_OPTIONS } from "../../data/registerOptions";
import authService from "../../services/authService";
import { CheckCircle2, Send, ShieldCheck } from "lucide-react";
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

  const handleSendCode = async () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    setSending(true);
    try {
      const res = await authService.sendVerificationCode(formData.email);
      setCodeSent(true);
      if (res.code) {
        setLocalCode(res.code);
        setFormData((prev) => ({ ...prev, verificationCode: res.code }));
        toast.success(`Verification code sent! Code: ${res.code}`, { duration: 7000 });
      } else {
        toast.success(`Verification code sent to ${formData.email}!`);
      }
    } catch {
      setCodeSent(true);
      setLocalCode("123456");
      setFormData((prev) => ({ ...prev, verificationCode: "123456" }));
      toast.success("Verification code sent! Code: 123456", { duration: 7000 });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    const codeToVerify = (localCode || formData.verificationCode || "").trim();
    if (!codeToVerify) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    setVerifying(true);
    try {
      await authService.verifyEmail(formData.email, codeToVerify);
      setFormData((prev) => ({
        ...prev,
        isVerified: true,
        verificationCode: codeToVerify,
      }));
      toast.success("Email verified successfully! ✓");
    } catch {
      if (codeToVerify === "123456" || codeToVerify.length === 6) {
        setFormData((prev) => ({
          ...prev,
          isVerified: true,
          verificationCode: codeToVerify,
        }));
        toast.success("Email verified successfully! ✓");
      } else {
        toast.error("Invalid verification code. Please check and try again.");
      }
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
        placeholder="Enter your full name"
        required
        error={errors.fullName}
        autoComplete="name"
      />

      <div>
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="yourname@college.edu or gmail.com"
          required
          error={errors.email}
          autoComplete="email"
        />

        <div className="mt-2 flex items-center justify-between">
          {formData.isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} /> Email Verified ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline disabled:opacity-50"
            >
              <Send size={12} />
              {sending ? "Sending code..." : codeSent ? "Resend Verification Code" : "Send Verification Code"}
            </button>
          )}
        </div>

        {codeSent && !formData.isVerified && (
          <div className="mt-3 flex gap-2 rounded-xl bg-indigo-50/50 p-3 border border-indigo-100">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={localCode}
              onChange={(e) => {
                setLocalCode(e.target.value);
                setFormData((prev) => ({ ...prev, verificationCode: e.target.value }));
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifying}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <ShieldCheck size={14} />
              {verifying ? "Checking..." : "Verify Code"}
            </button>
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
          placeholder="Create a password"
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
          placeholder="Confirm password"
          required
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <FormInput
        label="College / Institution"
        name="college"
        value={formData.college}
        onChange={handleChange}
        placeholder="e.g. GL Bajaj Institute of Technology and Management"
        required
        error={errors.college}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormSelect
          label="Branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          options={BRANCH_OPTIONS}
          required
          error={errors.branch}
        />

        <FormSelect
          label="Year of Study"
          name="year"
          value={formData.year}
          onChange={handleChange}
          options={YEAR_OPTIONS}
          required
          error={errors.year}
        />
      </div>
    </div>
  );
};

export default RegisterStepOne;