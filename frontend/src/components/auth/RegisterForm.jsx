import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "./ProgressBar";
import RegisterStepOne from "./RegisterStepOne";
import RegisterStepTwo from "./RegisterStepTwo";
import { ROUTES } from "../../constants/routes";
import { validateStepOne, validateStepTwo } from "../../utils/registerValidation";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    branch: "",
    year: "",
    careerGoal: "",
    github: "",
    leetcode: "",
    codeforces: "",
    codechef: "",
    isVerified: false,
    verificationCode: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "email" ? { isVerified: false, verificationCode: "" } : {}),
    }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleNext = () => {
    const validationErrors = validateStepOne(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (!formData.isVerified) {
      toast.error("Please verify your email with the 6-digit code before proceeding to Step 2.");
      return;
    }

    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setErrors({});
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDirectRegister = async () => {
    const validationErrors = validateStepOne(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    if (!formData.isVerified) {
      toast.error("Please verify your email with the 6-digit code before registering.");
      return;
    }

    setLoading(true);
    const response = await register(formData);

    if (response.success) {
      toast.success("Account created successfully! Welcome to SkillSync AI.");
      navigate(ROUTES.DASHBOARD);
    } else {
      toast.error(response.message || "Registration failed.");
    }

    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateStepTwo(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const response = await register(formData);

    if (response.success) {
      toast.success("Account created successfully! Welcome to SkillSync AI.");
      navigate(ROUTES.DASHBOARD);
    } else {
      toast.error(response.message || "Registration failed.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200/80">
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>
        <span className="rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
          Step {step} of 2
        </span>
      </div>

      <div className="mb-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Create Your Account</h2>
        <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500">Join SkillSync AI and begin your placement journey.</p>
      </div>
      <ProgressBar currentStep={step} totalSteps={2} />
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {step === 1 ? (
          <RegisterStepOne
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            setFormData={setFormData}
          />
        ) : (
          <RegisterStepTwo formData={formData} errors={errors} handleChange={handleChange} />
        )}

        <div className="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={handlePrevious}
              disabled={loading}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition disabled:opacity-60"
            >
              <ArrowLeft size={16} /> Previous (Step 1)
            </button>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          )}

          {step === 1 ? (
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleDirectRegister}
                disabled={loading}
                title="Register immediately without filling optional fields - can fill anytime from web profile"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
              >
                <span>Register Directly (Skip Details) ⚡</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-6 py-3 font-semibold text-white transition shadow-sm text-xs sm:text-sm"
              >
                Next Step →
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 px-7 py-3.5 font-bold text-white transition shadow-md shadow-indigo-100 disabled:opacity-60 text-sm"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
