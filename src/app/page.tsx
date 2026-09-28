// ============================================
// page.tsx - Main entry point for CivicTrack
// This is the only file Next.js needs.
// It shows different pages based on which route we're on.
// ============================================

"use client";

import { useApp, AppProvider } from "@/lib/AppContext";
import HomePage from "@/components/pages/HomePage.jsx";
import LoginPage from "@/components/pages/LoginPage.jsx";
import SignupPage from "@/components/pages/SignupPage.jsx";
import DashboardPage from "@/components/pages/DashboardPage.jsx";
import ReportIssuePage from "@/components/pages/ReportIssuePage.jsx";
import MyComplaintsPage from "@/components/pages/MyComplaintsPage.jsx";
import ComplaintDetailsPage from "@/components/pages/ComplaintDetailsPage.jsx";
import PublicStatsPage from "@/components/pages/PublicStatsPage.jsx";
import AdminDashboardPage from "@/components/pages/AdminDashboardPage.jsx";

// This component reads the current page and shows the right one
function AppRouter() {
  const { page } = useApp();

  // Simple if/else to show the right page component
  if (page === "login") return <LoginPage />;
  if (page === "signup") return <SignupPage />;
  if (page === "dashboard") return <DashboardPage />;
  if (page === "report") return <ReportIssuePage />;
  if (page === "complaints") return <MyComplaintsPage />;
  if (page === "complaint-details") return <ComplaintDetailsPage />;
  if (page === "stats") return <PublicStatsPage />;
  if (page === "admin") return <AdminDashboardPage />;

  // Default: show the home page
  return <HomePage />;
}

// The main export - wraps everything in our AppProvider
export default function Page() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
