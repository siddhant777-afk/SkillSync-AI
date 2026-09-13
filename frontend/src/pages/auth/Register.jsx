import { Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { ROUTES } from "../../constants/routes";

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-indigo-700">
            SkillSync AI
          </h1>

          <p className="mt-2 text-gray-600">
            Create your account to start your AI-powered placement journey.
          </p>
        </div>

        <RegisterForm />

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;