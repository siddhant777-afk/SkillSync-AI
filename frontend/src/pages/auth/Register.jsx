import { Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { ROUTES } from "../../constants/routes";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-3 py-6 sm:px-6 sm:py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            SkillSync AI
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create your account to start your AI-powered placement journey.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;