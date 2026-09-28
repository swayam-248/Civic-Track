// ============================================
// AppContext.jsx
// Global state for the app, now backed by real API calls instead of
// in-memory mock arrays. Auth is handled by next-auth (see /api/auth);
// complaints, categories and department stats are fetched from the
// /api/* routes backed by Prisma + SQLite.
// ============================================

"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { data: session, status } = useSession();

  const [page, setPage] = useState("home");
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [selectedId, setSelectedIdState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("civictrack_selected_id") || null;
    }
    return null;
  });

  const setSelectedId = useCallback((id) => {
    setSelectedIdState(id);
    if (typeof window !== "undefined") {
      if (id) localStorage.setItem("civictrack_selected_id", id);
      else localStorage.removeItem("civictrack_selected_id");
    }
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState(null);

  const user = session?.user || null;
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";

  const navigate = useCallback((route) => {
    setPage(route);
    setSidebarOpen(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  // --- Categories: fetched once, used across the report wizard + stats ---
  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // --- Public department stats (no auth required) ---
  const loadDepartmentStats = useCallback(async () => {
    try {
      const res = await fetch("/api/departments/stats");
      const data = await res.json();
      if (res.ok) setDepartmentStats(data);
    } catch (err) {
      console.error("Failed to load department stats:", err);
    }
  }, []);

  // --- Complaints: real fetch, scoped to the logged-in user (or all, for admins) ---
  const loadComplaints = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (res.ok) setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Failed to load complaints:", err);
    }
  }, [isLoggedIn]);

  // --- Complaints & Stats Polling ---
  useEffect(() => {
    if (isLoggedIn) {
      loadComplaints();
      loadDepartmentStats();
      const interval = setInterval(() => {
        loadComplaints();
        loadDepartmentStats();
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setComplaints([]);
    }
  }, [isLoggedIn, loadComplaints, loadDepartmentStats]);

  // --- Auto-route on login based on user role ---
  useEffect(() => {
    if (user && (page === "login" || page === "signup")) {
      if (user.role === "ADMIN") {
        setPage("admin");
      } else {
        setPage("dashboard");
      }
    }
  }, [user, page]);

  // --- Auth ---
  const login = useCallback(async (email, password) => {
    setAuthError(null);
    const result = await signIn("credentials", { redirect: false, email, password });
    if (result?.error) {
      setAuthError("Invalid email or password");
      return false;
    }
    return true;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Could not create account");
        return false;
      }
      return login(email, password);
    } catch (err) {
      setAuthError("Something went wrong. Please try again.");
      return false;
    }
  }, [login]);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    setComplaints([]);
    setSelectedId(null);
    setPage("home");
  }, []);

  // --- Upload the report photo, get back a real stored URL ---
  const uploadImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  }, []);

  // --- Real (heuristic, non-random) confidence scoring on the actual image ---
  const analyzeImage = useCallback(async (categoryId, imageUrl) => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Analysis failed");
    return data;
  }, []);

  // --- Create a complaint for real ---
  const createComplaint = useCallback(async (payload) => {
    const res = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not submit complaint");
    setComplaints((prev) => [data.complaint, ...prev]);
    return data.complaint;
  }, []);

  // --- Admin: update a complaint's status ---
  const updateStatus = useCallback(async (id, newStatus, note) => {
    const res = await fetch(`/api/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not update status");
    setComplaints((prev) => prev.map((c) => (c.id === id ? data.complaint : c)));
    return data.complaint;
  }, []);

  const value = {
    page,
    navigate,
    user,
    isLoggedIn,
    isAdmin,
    authLoading: status === "loading",
    authError,
    login,
    signup,
    logout,
    complaints,
    loadComplaints,
    createComplaint,
    updateStatus,
    uploadImage,
    analyzeImage,
    categories,
    loadCategories,
    departmentStats,
    loadDepartmentStats,
    selectedId,
    setSelectedId,
    sidebarOpen,
    setSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
