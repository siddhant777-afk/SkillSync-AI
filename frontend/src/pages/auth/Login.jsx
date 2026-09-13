import LoginForm from "../../components/auth/LoginForm";
import { APP_CONFIG } from "../../constants/app";
import { BarChart3, Code2, ShieldCheck, Sparkles, Target } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Branding Showcase (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 text-white flex-col justify-between p-12 xl:p-16">
        {/* Background glow accents */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-md border border-white/15 text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500 text-white font-black text-sm shadow-sm">
              S
            </div>
            <span className="font-bold tracking-tight text-base">{APP_CONFIG.NAME}</span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30 mb-6 backdrop-blur-xs">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Campus to Corporate Intelligence</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            Accelerate your career with AI-driven insights.
          </h1>

          <p className="mt-4 text-slate-300 text-base xl:text-lg leading-relaxed max-w-lg">
            Connect your developer profiles, discover critical skill gaps, and prepare for top tier software engineering interviews.
          </p>

          {/* Feature Highlights Grid */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                <FaGithub size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">GitHub Integration</p>
                <p className="text-[11px] text-slate-400 truncate">Real-world code commit metrics</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/30 text-amber-300 border border-amber-400/20">
                <Code2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">LeetCode Analytics</p>
                <p className="text-[11px] text-slate-400 truncate">Live algorithmic problem tracking</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/30 text-emerald-300 border border-emerald-400/20">
                <BarChart3 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Skill Gap Analysis</p>
                <p className="text-[11px] text-slate-400 truncate">Targeted role readiness scoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3.5 border border-white/10 backdrop-blur-xs hover:bg-white/10 transition">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/30 text-purple-300 border border-purple-400/20">
                <Target size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Placement Readiness</p>
                <p className="text-[11px] text-slate-400 truncate">Curated roadmaps & verified badges</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Protected with secure Two-Step Verification</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14">
        {/* Mobile Header (Hidden on large screens) */}
        <div className="lg:hidden mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2 text-white font-bold text-sm shadow-md mb-2">
            <span>{APP_CONFIG.NAME}</span>
          </div>
          <p className="text-xs text-slate-500">AI-Powered Placement Preparation Platform</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
};

export default Login;