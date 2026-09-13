import { Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { ROUTES } from "../../constants/routes";
import { APP_CONFIG } from "../../constants/app";
import { Sparkles } from "lucide-react";

const Register = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Background Ambient Accents */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 mb-6 text-center">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-white font-bold text-sm shadow-md hover:bg-indigo-700 transition"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white font-black text-xs">
            S
          </div>
          <span>{APP_CONFIG.NAME}</span>
        </Link>
        <p className="mt-2 text-xs sm:text-sm font-medium text-slate-500">
          AI-Powered Placement Preparation & Career Intelligence
        </p>
      </div>

      {/* Registration Form Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <RegisterForm />

        <div className="mt-6 text-center text-sm font-medium text-slate-600">
          Already registered?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition"
          >
            Sign in here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;