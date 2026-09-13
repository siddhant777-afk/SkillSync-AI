import LoginForm from "../../components/auth/LoginForm";
import { APP_CONFIG } from "../../constants/app";
const Login = () => {

  return (

    <div className="min-h-screen bg-slate-100 flex">

      {/* Left Side */}

      <div className="flex-1 bg-indigo-600 text-white flex flex-col justify-center px-16">

        <h1 className="text-6xl font-bold">

          {APP_CONFIG.NAME}

        </h1>

        <p className="mt-6 text-xl leading-8">

          AI Powered Career Intelligence Platform

        </p>

        <div className="mt-12">

          <div className="mb-4">

            ✅ GitHub Integration

          </div>

          <div className="mb-4">

            ✅ LeetCode Analytics

          </div>

          <div className="mb-4">

            ✅ AI Skill Gap Analysis

          </div>

          <div className="mb-4">

            ✅ Placement Readiness

          </div>

        </div>

      </div>

      {/* Right Side */}

      <div className="flex-1 flex justify-center items-center">

        <LoginForm/>

      </div>

    </div>

  );

};

export default Login;