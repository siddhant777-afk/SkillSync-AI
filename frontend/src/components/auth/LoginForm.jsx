import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "./InputField";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../constants/routes";
import toast from "react-hot-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, logout, loading, currentUser, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.success(`Loaded credentials for ${demoEmail}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password.");
      return;
    }

    const result = await login({
      email: email.trim(),
      password: password.trim(),
    });

    if (result.success) {
      toast.success("Welcome to SkillSync AI!");
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      toast.error(result.message || "Invalid credentials.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[450px] max-w-full rounded-3xl bg-white p-10 shadow-xl"
    >
      {isAuthenticated && (
        <div className="mb-6 rounded-2xl bg-indigo-50/90 p-4 border border-indigo-200">
          <p className="text-xs font-semibold text-indigo-950">
            Currently logged in as:
          </p>
          <p className="text-sm font-bold text-indigo-700 mt-0.5">
            {currentUser?.fullName || "Student"} ({currentUser?.email})
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              to={ROUTES.DASHBOARD}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Go to Dashboard →
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold">Welcome Back 👋</h1>

      <p className="mb-6 mt-2 text-gray-500">
        Login to your Career Intelligence Dashboard
      </p>

      {/* Demo Credentials Quick-Fill */}
      <div className="mb-6 rounded-2xl bg-indigo-50/60 p-3 border border-indigo-100/80">
        <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider mb-2">
          Demo Logins (1-Click Fill):
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill("subhi@example.com", "password123")}
            className="flex-1 rounded-lg bg-white border border-indigo-200 py-1.5 px-2 text-xs font-medium text-indigo-900 shadow-sm hover:bg-indigo-50"
          >
            🎓 Demo Student
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill("recruiter@techhire.com", "password123")}
            className="flex-1 rounded-lg bg-white border border-indigo-200 py-1.5 px-2 text-xs font-medium text-indigo-900 shadow-sm hover:bg-indigo-50"
          >
            💼 Demo Recruiter
          </button>
        </div>
      </div>

      <InputField
        label="Email"
        type="email"
        placeholder="Enter your registered email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <InputField
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <div className="mb-6 flex justify-between text-xs text-slate-500">
        <label className="flex items-center gap-2">
          <input type="checkbox" defaultChecked className="accent-indigo-600" />
          Remember Me
        </label>

        <button
          type="button"
          className="text-indigo-600 hover:underline"
          onClick={() => toast("Password reset link sent to your registered email.")}
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Login"}
      </button>

      <p className="mt-8 text-center text-sm text-slate-600">
        Don't have an account?
        <Link
          to={ROUTES.REGISTER}
          className="ml-2 font-semibold text-indigo-600 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;