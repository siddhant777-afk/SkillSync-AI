import LoginForm from "../../components/auth/LoginForm";
import { APP_CONFIG } from "../../constants/app";

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Mobile Top Header (Visible on small & medium screens) */}
      <div className="lg:hidden bg-indigo-600 text-white p-6 sm:p-8 text-center shadow-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          {APP_CONFIG.NAME}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-indigo-100 font-medium">
          AI Powered Career Intelligence Platform
        </p>
      </div>

      {/* Desktop Left Side */}
      <div className="hidden lg:flex flex-1 bg-indigo-600 text-white flex-col justify-center px-10 xl:px-16">
        <h1 className="text-5xl xl:text-6xl font-bold tracking-tight">
          {APP_CONFIG.NAME}
        </h1>

        <p className="mt-4 text-lg xl:text-xl leading-8 text-indigo-100">
          AI Powered Career Intelligence Platform
        </p>

        <div className="mt-10 space-y-4 text-base xl:text-lg">
          <div className="flex items-center gap-2">
            <span>✅</span> <span>GitHub Integration</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span> <span>LeetCode Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span> <span>AI Skill Gap Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✅</span> <span>Placement Readiness</span>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex justify-center items-center p-4 sm:p-6 md:p-8 w-full">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;