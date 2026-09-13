import { Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import Auth3DCanvas from "../../components/auth/Auth3DCanvas";
import { ROUTES } from "../../constants/routes";
import { APP_CONFIG } from "../../constants/app";
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

const Register = () => {
  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Left Column: Interactive 3D Canvas Hero (Desktop & Tablet) */}
      <div className="flex-1 relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-indigo-900/40 text-white min-h-[460px] lg:min-h-screen">
        {/* Brand Header */}
        <div className="z-20 relative flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {APP_CONFIG.NAME}
              </h1>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-300">
                AI Career Intelligence
              </p>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 px-3 py-1 text-xs font-bold text-indigo-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Fast Automated Onboarding</span>
          </div>
        </div>

        {/* 3D Model Viewport (Center) */}
        <div className="my-auto py-4 z-10">
          <Auth3DCanvas
            title="Create Verified Profile"
            subtitle="Connect your coding handles to benchmark placement readiness"
          />
        </div>

        {/* Bottom Highlights */}
        <div className="z-20 relative pt-4 border-t border-indigo-900/40 hidden lg:flex flex-wrap items-center gap-3 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60">
            <CheckCircle2 size={14} className="text-emerald-400" /> GL Bajaj Institute Supported
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60">
            <CheckCircle2 size={14} className="text-emerald-400" /> 100% Free For Engineering Students
          </span>
        </div>
      </div>

      {/* Right Column: Multi-Step Registration Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 md:p-12 w-full bg-slate-50 dark:bg-slate-950 min-w-0 overflow-y-auto">
        <div className="w-full max-w-xl my-auto">
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Student Account
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Join SkillSync AI to unlock automated multi-platform telemetry & recruiter ranking.
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to={ROUTES.LOGIN}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
            >
              Sign In to Your Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;