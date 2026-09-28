"use client";

// ============================================
// MyComplaintsPage.jsx
// Lists all the user's complaints with filter tabs
// and a search bar. Wrapped in DashboardLayout.
//
// Features:
//   - Filter tabs: All, Submitted, In Progress, Resolved
//   - Search by category name or location
//   - Empty state when no results match
// ============================================

import { useEffect, useState, useMemo } from "react";
import { Search, FileX, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/civic/DashboardLayout.jsx";
import ComplaintCard from "@/components/civic/ComplaintCard.jsx";
import { useApp } from "@/lib/AppContext";

// The filter tab options - value matches the DB's ComplaintStatus enum
const TABS = [
  { label: "All", value: "All" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Acknowledged", value: "ACKNOWLEDGED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

// --- Simple inline empty state ---
// Used when there are no complaints or no search results.
// (We use this inline instead of importing EmptyState.jsx
//  because only a .tsx version exists.)
function InlineEmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <FileX className="h-8 w-8 text-slate-400" />
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

export default function MyComplaintsPage() {
  // Get everything we need from context
  const { isLoggedIn, navigate, complaints, loadComplaints, setSelectedId } = useApp();

  // Which filter tab is currently active
  const [activeTab, setActiveTab] = useState("All");

  // The search query typed into the search bar
  const [searchQuery, setSearchQuery] = useState("");

  // --- Auth guard: redirect to login if not logged in ---
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("login");
      return;
    }
  }, [isLoggedIn, navigate]);

  // --- Load complaints on mount ---
  useEffect(() => {
    if (!isLoggedIn) return;
    loadComplaints();
  }, [isLoggedIn, loadComplaints]);

  // --- Filter complaints based on active tab and search query ---
  // useMemo recalculates only when complaints, tab, or search change
  const filteredComplaints = useMemo(() => {
    let result = complaints;

    // Filter by status tab (e.g. only show "In Progress" complaints)
    if (activeTab !== "All") {
      result = result.filter((c) => c.status === activeTab);
    }

    // Filter by search query (match against category or location)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.category?.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.referenceCode.toLowerCase().includes(q)
      );
    }

    return result;
  }, [complaints, activeTab, searchQuery]);

  // Don't render anything while redirecting
  if (!isLoggedIn) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* ---- Header ---- */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">My Complaints</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Track every issue you&apos;ve reported.
          </p>
        </div>

        {/* ---- Filter Tabs ---- */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-[#2563EB] text-white"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---- Search Bar ---- */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            placeholder="Search by category, location, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* ---- Result count ---- */}
        <p className="text-sm text-[#64748B]">
          Showing {filteredComplaints.length} complaint
          {filteredComplaints.length !== 1 ? "s" : ""}
        </p>

        {/* ---- Complaint List ---- */}
        <div className="space-y-3">
          {filteredComplaints.length > 0 ? (
            // Show filtered complaints as clickable cards
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onClick={() => {
                  setSelectedId(complaint.id);
                  navigate("complaint-details");
                }}
              />
            ))
          ) : complaints.length === 0 ? (
            // No complaints at all — suggest reporting one
            <InlineEmptyState
              title="No complaints yet"
              description="You haven't reported any issues yet. Start by reporting one."
              actionLabel="Report an Issue"
              onAction={() => navigate("report")}
            />
          ) : (
            // Complaints exist but filter/search found nothing
            <InlineEmptyState
              title="No complaints found"
              description={
                searchQuery
                  ? `No complaints match "${searchQuery}"`
                  : `No ${TABS.find((t) => t.value === activeTab)?.label || activeTab} complaints found.`
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
