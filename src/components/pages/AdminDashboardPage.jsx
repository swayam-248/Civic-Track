"use client";

// ============================================
// AdminDashboardPage.jsx
// Admin panel for managing complaints.
// Shows summary stats, filter tabs, and a list of complaints
// with inline status updates and resolution notes.
// Only accessible to admin users.
// ============================================

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  Loader,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/lib/AppContext";
import DashboardLayout from "@/components/civic/DashboardLayout.jsx";
import StatCard from "@/components/civic/StatCard.jsx";
import EmptyState from "@/components/civic/EmptyState.jsx";

// The filter tab options - value matches the DB's ComplaintStatus enum
const TABS = [
  { label: "All", value: "All" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function AdminDashboardPage() {
  const {
    isLoggedIn,
    isAdmin,
    navigate,
    complaints,
    setSelectedId,
    updateStatus,
    loadComplaints,
    departmentStats,
    loadDepartmentStats,
  } = useApp();

  // Which filter tab is active
  const [activeTab, setActiveTab] = useState("All");

  // Tracks resolution notes being typed for each complaint
  // Key is complaint ID, value is the note text
  const [resolutionNotes, setResolutionNotes] = useState({});

  // --- Auth guard: redirect if not admin ---
  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate("dashboard");
      return;
    }
    // Load complaints + live department stats on mount
    loadComplaints();
    loadDepartmentStats();
  }, [isLoggedIn, isAdmin, navigate, loadComplaints, loadDepartmentStats]);

  // --- Calculate summary stats from complaints ---
  const summaryStats = useMemo(() => {
    const newCount = complaints.filter((c) => c.status === "SUBMITTED").length;
    const inProgressCount = complaints.filter((c) => c.status === "IN_PROGRESS").length;
    const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;
    return { newCount, inProgressCount, resolvedCount };
  }, [complaints]);

  // --- Filter complaints by active tab ---
  const filteredComplaints = useMemo(() => {
    if (activeTab === "All") return complaints;
    return complaints.filter((c) => c.status === activeTab);
  }, [complaints, activeTab]);

  // --- Handle status change from the Select dropdown ---
  const handleStatusChange = (complaintId, newStatus) => {
    const note = resolutionNotes[complaintId];
    // Call updateStatus from context (only pass note if resolving)
    updateStatus(complaintId, newStatus, newStatus === "RESOLVED" ? note : undefined);
    toast.success("Status updated successfully");
    // Clear the local note if we changed away from Resolved
    if (newStatus !== "RESOLVED") {
      setResolutionNotes((prev) => {
        const next = { ...prev };
        delete next[complaintId];
        return next;
      });
    }
  };

  // --- Auth guard: don't render if not admin ---
  if (!isLoggedIn || !isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ===== HEADER ===== */}
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Manage and resolve civic complaints.
          </p>
        </div>

        {/* ===== 4 SUMMARY STAT CARDS ===== */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={AlertCircle}
            value={summaryStats.newCount}
            label="New Complaints"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={Loader}
            value={summaryStats.inProgressCount}
            label="In Progress"
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <StatCard
            icon={CheckCircle}
            value={summaryStats.resolvedCount}
            label="Resolved"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={Clock}
            value={departmentStats ? `${departmentStats.overall.avgHours} hrs` : "—"}
            label="Avg. Resolution Time"
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
        </div>

        {/* ===== FILTER TABS ===== */}
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

        {/* ===== COMPLAINT LIST ===== */}
        <div className="space-y-3">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => {
              // Show resolution note textarea when status is Resolved
              const showResolutionNote = complaint.status === "RESOLVED";
              return (
                <div
                  key={complaint.id}
                  className="rounded-xl border border-[#E2E8F0] bg-white p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Complaint info - clickable to go to detail view */}
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onClick={() => {
                        setSelectedId(complaint.id);
                        navigate("complaint-details");
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#64748B]">
                        {complaint.referenceCode}
                      </span>
                      <span className="text-sm font-semibold text-[#0F172A]">
                          {complaint.category?.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#64748B] truncate max-w-md">
                        {complaint.location}
                      </p>
                    </button>

                    {/* Status select dropdown */}
                    <div className="flex items-center gap-3 sm:shrink-0">
                      <Select
                        value={complaint.status}
                        onValueChange={(val) =>
                          handleStatusChange(complaint.id, val)
                        }
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUBMITTED">Submitted</SelectItem>
                          <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Resolution note textarea - shown when status is Resolved
                      or when the admin is typing a note for a newly resolved complaint */}
                  {(showResolutionNote || resolutionNotes[complaint.id] !== undefined) && (
                    <div className="mt-4 space-y-2">
                      <Textarea
                        placeholder="Add a resolution note..."
                        value={resolutionNotes[complaint.id] !== undefined ? resolutionNotes[complaint.id] : (complaint.resolutionNote || "")}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({
                            ...prev,
                            [complaint.id]: e.target.value,
                          }))}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex items-center justify-between">
                        {showResolutionNote && complaint.resolutionNote && (
                          <p className="text-xs text-green-600">
                            Saved note: {complaint.resolutionNote}
                          </p>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const note = resolutionNotes[complaint.id] !== undefined ? resolutionNotes[complaint.id] : (complaint.resolutionNote || "");
                            updateStatus(complaint.id, complaint.status, note);
                            toast.success("Resolution note saved");
                          }}
                          className="ml-auto text-xs"
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Empty state when no complaints match the filter */
            <EmptyState
              title="No complaints found"
              description={
                activeTab === "All"
                  ? "There are no complaints to manage."
                  : `No ${(TABS.find((t) => t.value === activeTab)?.label || activeTab).toLowerCase()} complaints at the moment.`
              }
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
