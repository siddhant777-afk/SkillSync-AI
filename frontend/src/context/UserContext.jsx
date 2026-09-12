import { useCallback, useEffect, useMemo, useState } from "react";
import { UserContext } from "./UserContextValue";
import { useAuth } from "../hooks/useAuth";
import dashboardService from "../services/dashboardService";
import userService from "../services/userService";
import toast from "react-hot-toast";

export const UserProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token && !currentUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await dashboardService.getDashboard();
      if (data && data.email) {
        setUser(data);
      }
    } catch {
      if (currentUser) {
        setUser({
          name: currentUser.fullName || currentUser.email?.split("@")[0] || "Student",
          email: currentUser.email,
          initials: (currentUser.fullName ? currentUser.fullName[0] : "S").toUpperCase(),
          year: currentUser.year || "3rd Year",
          branch: currentUser.branch || "AIML",
          college: currentUser.college || "Engineering College",
          careerGoal: currentUser.careerGoal || "AI / ML Engineer",
          placementReadiness: 70,
          profileCompletion: 80,
          skills: [],
          skillGaps: [],
          achievements: [],
          recommendations: [],
          github: { username: "", contributions: 0, repositories: 0 },
          leetcode: { username: "", solved: 0, rank: "Unranked" },
          codeforces: { username: "", rating: 0, title: "Unrated" },
          codechef: { username: "", rating: 0, title: "Unrated" },
          kaggle: { username: "", notebooks: 0 },
          progress: {
            months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
            leetcode: [0, 10, 25, 30, 40, 50],
            github: [0, 20, 50, 80, 120, 150],
            projects: [0, 1, 1, 2, 2, 3],
          },
          upcomingEvents: [],
        });
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, isAuthenticated, currentUser?.email]);

  // Live reactivity: Automatically re-sync and update whenever any part of the app updates or tab refocuses
  useEffect(() => {
    const handleGlobalUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener("skillsync:update", handleGlobalUpdate);
    window.addEventListener("focus", handleGlobalUpdate);
    return () => {
      window.removeEventListener("skillsync:update", handleGlobalUpdate);
      window.removeEventListener("focus", handleGlobalUpdate);
    };
  }, [fetchDashboardData]);

  const notifyGlobalUpdate = useCallback(() => {
    fetchDashboardData();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("skillsync:update"));
    }
  }, [fetchDashboardData]);

  const syncAccounts = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing GitHub, LeetCode & Codeforces...");
    try {
      const res = await userService.syncAccounts();
      toast.success(res.message || "All profiles synchronized successfully!", { id: toastId });
      await fetchDashboardData();
      notifyGlobalUpdate();
      return res;
    } catch {
      toast.error("Could not complete live sync. Using cached profile stats.", { id: toastId });
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      await userService.updateProfile(profileData);
      toast.success("Profile updated successfully!");
      await fetchDashboardData();
      notifyGlobalUpdate();
      return true;
    } catch {
      toast.error("Failed to update profile.");
      return false;
    }
  };

  const updateCodingProfiles = async (accountHandles) => {
    try {
      await userService.updateCodingProfiles(accountHandles);
      toast.success("Platform handles saved!");
      await syncAccounts();
      notifyGlobalUpdate();
      return true;
    } catch {
      toast.error("Failed to update platform handles.");
      return false;
    }
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      isSyncing,
      isLoading,
      syncAccounts,
      updateProfile,
      updateCodingProfiles,
      refreshUser: fetchDashboardData,
      refetch: fetchDashboardData,
      notifyGlobalUpdate,
    }),
    [user, isSyncing, isLoading, fetchDashboardData, notifyGlobalUpdate],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
