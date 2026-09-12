
import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Profile from "../pages/profile/Profile";
import Progress from "../pages/progress/Progress";
import Skills from "../pages/skills/Skills";
import Projects from "../pages/projects/Projects";
import Achievements from "../pages/achievements/Achievements";
import Recommendations from "../pages/recommendations/Recommendations";
import ResumeBuilder from "../pages/resume/ResumeBuilder";
import Settings from "../pages/settings/Settings";
import RecruiterCandidates from "../pages/recruiter/RecruiterCandidates";

import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

const ProtectedPage = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Student Routes */}
      <Route
        path="/"
        element={
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedPage>
            <Profile />
          </ProtectedPage>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedPage>
            <Progress />
          </ProtectedPage>
        }
      />

      <Route
        path="/skills"
        element={
          <ProtectedPage>
            <Skills />
          </ProtectedPage>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedPage>
            <Projects />
          </ProtectedPage>
        }
      />

      <Route
        path="/achievements"
        element={
          <ProtectedPage>
            <Achievements />
          </ProtectedPage>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedPage>
            <Recommendations />
          </ProtectedPage>
        }
      />

      <Route
        path="/resume"
        element={
          <ProtectedPage>
            <ResumeBuilder />
          </ProtectedPage>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedPage>
            <Settings />
          </ProtectedPage>
        }
      />

      <Route
        path="/recruiter"
        element={
          <ProtectedPage>
            <RecruiterCandidates />
          </ProtectedPage>
        }
      />

      {/* Legacy /SkillSync-AI route aliases */}
      <Route path="/SkillSync-AI/login" element={<Navigate to="/login" replace />} />
      <Route path="/SkillSync-AI/register" element={<Navigate to="/register" replace />} />
      <Route path="/SkillSync-AI/*" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;