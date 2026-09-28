"use client";

// ============================================
// DashboardPage.jsx
// The main dashboard after logging in.
// Shows a greeting, 4 stat cards, a list of recent
// complaints, and a "Report an Issue" button.
// Wrapped in DashboardLayout (sidebar + mobile header).
// ============================================

import { useState, useEffect } from "react";
import { FileText, Clock, Loader, CheckCircle, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import DashboardLayout from "@/components/civic/DashboardLayout.jsx";
import StatCard from "@/components/civic/StatCard.jsx";
import ComplaintCard from "@/components/civic/ComplaintCard.jsx";

// --- Helper: compute average resolution time in hours ---
// Looks at resolved complaints, parses their created/resolved dates,
// and returns the average number of hours.
function computeAvgTime(complaints) {
  const resolved = complaints.filter((c) => c.status === "RESOLVED" && c.resolvedAt);
  if (resolved.length === 0) return null;

  let totalHours = 0;
  resolved.forEach((c) => {
    const created = new Date(c.createdAt);
    const resolvedDate = new Date(c.resolvedAt);
    const diffMs = resolvedDate - created;
    // Convert milliseconds to hours (1 day = 24 hours)
    totalHours += diffMs / (1000 * 60 * 60);
  });

  // Round to the nearest whole number
  return Math.round(totalHours / resolved.length);
}

// --- Simple inline loading skeleton ---
// Shows placeholder shapes while data is loading.
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Fake heading */}
      <div>
        <div className="mb-1 h-7 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      {/* Fake stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
      {/* Fake complaint list */}
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}

// --- Simple inline empty state ---
// Shown when there are no complaints yet.
function InlineEmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <FileText className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[#64748B]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-[#2563EB] hover:bg-[#1d4ed8]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default function DashboardPage() {
  // Get everything we need from context
  const { isLoggedIn, navigate, user, complaints, loadComplaints, setSelectedId } = useApp();

  // Are we still in the initial loading state?
  const [loading, setLoading] = useState(true);

  // --- Auth guard: redirect to login if not logged in ---
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("login");
      return;
    }
  }, [isLoggedIn, navigate]);

  // --- Load complaints on mount (with 600ms skeleton delay) ---
  useEffect(() => {
    if (!isLoggedIn) return;

    // Show the skeleton for 600ms, then reveal real content
    const timer = setTimeout(() => {
      loadComplaints();
      setLoading(false);
    }, 600);

    // Clean up the timer if the component unmounts early
    return () => clearTimeout(timer);
  }, [isLoggedIn, loadComplaints]);

  // Don't render anything while redirecting
  if (!isLoggedIn) return null;

  // --- Compute stats from the complaints array ---
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
  const avgTime = computeAvgTime(complaints);

  // The 5 most recent complaints (they're already sorted newest-first)
  const recentComplaints = complaints.slice(0, 5);

  // Get user's first name for the greeting
  const firstName = user && user.name ? user.name.split(" ")[0] : "User";

  return (
    <DashboardLayout>
      {/* Show skeleton while loading, otherwise show real content */}
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          {/* ---- Header: greeting + report button ---- */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Good morning, {firstName}
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Here&apos;s what&apos;s happening with your civic reports.
              </p>
            </div>
            {/* "Report an Issue" button */}
            <Button
              onClick={() => navigate("report")}
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
            >
              <Plus className="h-4 w-4" />
              Report an Issue
            </Button>
          </div>

          {/* ---- 4 Stat Cards ---- */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Total complaints */}
            <StatCard
              icon={FileText}
              value={totalCount}
              label="Total Complaints"
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            {/* In progress */}
            <StatCard
              icon={Clock}
              value={inProgressCount}
              label="In Progress"
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            {/* Resolved */}
            <StatCard
              icon={CheckCircle}
              value={resolvedCount}
              label="Resolved"
              color="text-green-600"
              bgColor="bg-green-50"
            />
            {/* Average resolution time */}
            <StatCard
              icon={Loader}
              value={avgTime !== null ? avgTime + "h" : "N/A"}
              label="Avg Time"
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
          </div>

          {/* ---- Recent Complaints section ---- */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Recent Complaints
              </h2>
              <button
                type="button"
                onClick={() => navigate("complaints")}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:underline"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Show complaint cards or empty state */}
            {recentComplaints.length > 0 ? (
              <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
                {recentComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onClick={() => {
                      setSelectedId(complaint.id);
                      navigate("complaint-details");
                    }}
                  />
                ))}
              </div>
            ) : (
              <InlineEmptyState
                title="No complaints yet"
                description="You haven't filed any civic complaints yet. Start by reporting an issue in your area."
                actionLabel="Report an Issue"
                onAction={() => navigate("report")}
              />
            )}
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
