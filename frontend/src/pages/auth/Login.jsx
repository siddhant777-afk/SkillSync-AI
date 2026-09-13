import LoginForm from "../../components/auth/LoginForm";
import Auth3DCanvas from "../../components/auth/Auth3DCanvas";
import { APP_CONFIG } from "../../constants/app";
import { Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Interactive 3D Left Column (Desktop & Tablet) */}
      <div className="flex-1 relative flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-indigo-900/40 text-white min-h-[460px] lg:min-h-screen">
        {/* Top Header */}
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
                Career Intelligence Platform
              </p>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
            <ShieldCheck size={14} />
            <span>AI Verified Telemetry</span>
          </div>
        </div>

        {/* 3D Model Viewport (Center) */}
        <div className="my-auto py-4 z-10">
          <Auth3DCanvas
            title={APP_CONFIG.NAME}
            subtitle="Autonomous Multi-Platform Placement Benchmark"
          />
        </div>

        {/* Bottom Feature Badges */}
        <div className="z-20 relative pt-4 border-t border-indigo-900/40 hidden lg:flex flex-wrap items-center gap-3 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60">
            <CheckCircle2 size={14} className="text-emerald-400" /> LeetCode & Codeforces
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60">
            <CheckCircle2 size={14} className="text-emerald-400" /> Real GitHub Commits
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-950/80 px-3 py-1.5 rounded-xl border border-indigo-800/60">
            <CheckCircle2 size={14} className="text-emerald-400" /> 5-Tier Priority Placement
          </span>
        </div>
      </div>

      {/* Right Column: High-Contrast Interactive Login Form */}
      <div className="flex-1 flex justify-center items-center p-4 sm:p-8 md:p-12 w-full bg-slate-50 dark:bg-slate-950 min-w-0">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;