import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContextValue";
import { STORAGE_KEYS } from "../constants/storage";
import authService from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) && localStorage.getItem(STORAGE_KEYS.USER));
  });

  const [loading, setLoading] = useState(false);

  // Validate or restore session on mount
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      authService
        .getCurrentUser()
        .then((res) => {
          if (res && res.email) {
            setCurrentUser(res);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res));
            setIsAuthenticated(true);
          }
        })
        .catch(() => {
          // Token expired or invalid, clear stale credentials
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          setCurrentUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  const requestLoginOtp = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.loginRequestOtp(credentials);
      return {
        success: true,
        otpRequired: true,
        email: data.email,
        message: data.message,
        devOtp: data.dev_otp,
      };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Incorrect email or password. Please try again.";
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async ({ email, code }) => {
    setLoading(true);
    try {
      const data = await authService.loginVerifyOtp({ email, code });
      if (data.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      const user = data.user || {
        email,
        fullName: email.split("@")[0],
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Invalid or expired verification code. Please try again.";
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      if (data.otp_required) {
        return {
          success: true,
          otpRequired: true,
          email: data.email,
          message: data.message,
          devOtp: data.dev_otp,
        };
      }
      if (data.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      const user = data.user || {
        email: credentials.email,
        fullName: credentials.email.split("@")[0],
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Incorrect email or password. Please try again.";
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Send both snake_case and camelCase to ensure backend compatibility
      const payload = {
        ...userData,
        full_name: userData.fullName || userData.full_name,
        career_goal: userData.careerGoal || userData.career_goal,
      };

      const data = await authService.register(payload);
      if (data.access_token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      }
      const user = data.user || {
        email: userData.email,
        fullName: payload.full_name,
        role: userData.role || "student",
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true, user };
    } catch (err) {
      let errorMsg = "Registration failed. Please check your inputs.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === "string") {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((d) => d.msg || d).join(", ");
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      authService.logout().catch(() => {});
    } finally {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      currentUser,
      loading,
      login,
      requestLoginOtp,
      verifyLoginOtp,
      register,
      logout,
    }),
    [isAuthenticated, currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};