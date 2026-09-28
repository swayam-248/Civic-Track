"use client";

// ============================================
// ComplaintDetailsPage.jsx
// Shows the full details of a single complaint.
// Has image, metadata rows, status timeline.
// Wrapped in DashboardLayout, requires auth.
// ============================================

import { useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Brain,
  FileText,
  CheckCircle,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import DashboardLayout from "@/components/civic/DashboardLayout.jsx";
import StatusBadge from "@/components/civic/StatusBadge.jsx";
import { formatDate } from "@/lib/utils";

// The status steps shown in the timeline (matches the DB's ComplaintStatus enum)
const TIMELINE_STEPS = [
  {
    key: "SUBMITTED",
    title: "Submitted",
    description: "Complaint received successfully.",
  },
  {
    key: "ACKNOWLEDGED",
    title: "Acknowledged",
    description: "Department has reviewed the complaint.",
  },
  {
    key: "IN_PROGRESS",
    title: "In Progress",
    description: "Department is currently working on the issue.",
  },
  {
    key: "RESOLVED",
    title: "Resolved",
    description: "The issue has been resolved.",
  },
];

// Figure out which step index a status maps to
function getStepIndex(status) {
  const idx = TIMELINE_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function ComplaintDetailsPage() {
  const { isLoggedIn, navigate, complaints, selectedId } = useApp();

  // Auth guard: redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("login");
      return;
    }
  }, [isLoggedIn, navigate]);

  // Find the complaint from context by selectedId
  const complaint = complaints.find((c) => c.id === selectedId);

  // Don't render if not logged in
  if (!isLoggedIn) return null;

  // --- NOT FOUND state ---
  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <FileText className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-[#0F172A]">
              Complaint not found
            </h2>
            <p className="mb-6 text-sm text-[#64748B]">
              The complaint you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button
              onClick={() => navigate("complaints")}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Complaints
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isResolved = complaint.status === "RESOLVED";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* ===== BACK BUTTON ===== */}
        <Button
          variant="ghost"
          className="-ml-2 gap-2 text-[#64748B] hover:text-[#0F172A]"
          onClick={() => navigate("complaints")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Complaints
        </Button>

        {/* ===== COMPLAINT ID + STATUS BADGE ===== */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {complaint.referenceCode}
          </h1>
          <StatusBadge status={complaint.status} />
        </div>

        {/* ===== TWO-COLUMN LAYOUT: IMAGE + DETAILS (2:3 ratio on lg) ===== */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Full complaint image */}
          <div className="lg:col-span-2">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={complaint.imageUrl || "/images/infrastructure.png"}
                alt={complaint.category?.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          </div>

          {/* Right: Detail card with metadata rows */}
          <div className="lg:col-span-3">
            <div className="space-y-5 rounded-xl border border-[#E2E8F0] bg-white p-6">
              {/* Category row */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    Issue Category
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                    {complaint.category?.name}
                  </p>
                </div>
              </div>

              {/* Department row (Building2 icon) */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    Assigned Department
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                    {complaint.department?.name}
                  </p>
                </div>
              </div>

              {/* Location row (MapPin icon) */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                    {complaint.location}
                  </p>
                </div>
              </div>

              {/* Date row (Calendar icon) */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    Submitted Date
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                    {formatDate(complaint.createdAt)}
                  </p>
                </div>
              </div>

              {/* AI Confidence row (Brain icon) */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    AI Confidence
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0F172A]">
                    {complaint.confidenceScore != null ? `${complaint.confidenceScore}% confident` : "Not available"}
                  </p>
                </div>
              </div>

              {/* Description row (FileText icon) */}
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
                    Description
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-[#334155]">
                    {complaint.description}
                  </p>
                </div>
              </div>

              {/* Resolution note box - only shown if resolved */}
              {isResolved && (
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-green-800">
                      Resolution Note
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-green-900">
                      {complaint.resolutionNote}
                    </p>
                    {complaint.resolvedAt && (
                      <p className="mt-1 text-xs text-green-700">
                        Resolved on {formatDate(complaint.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== STATUS TIMELINE ===== */}
        {/* 3 steps connected by a line: Submitted → In Progress → Resolved */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#0F172A]">
            Status Timeline
          </h2>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, idx) => {
              const currentIdx = getStepIndex(complaint.status);
              const isCompleted = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isPending = idx > currentIdx;

              return (
                <div key={step.key} className="relative flex gap-4">
                  {/* Vertical line + dot/circle/check */}
                  <div className="flex flex-col items-center">
                    {isCompleted ? (
                      /* Completed step: green checkmark */
                      <CheckCircle className="h-7 w-7 shrink-0 text-green-500" />
                    ) : isCurrent ? (
                      /* Active step: blue dot with arrow */
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    ) : (
                      /* Pending step: gray circle */
                      <Circle className="h-7 w-7 shrink-0 text-slate-300" />
                    )}
                    {/* Connecting line between steps */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 min-h-[40px] ${
                          isCompleted ? "bg-green-400" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Step text content */}
                  <div className={`pb-8 ${isPending ? "opacity-50" : ""}`}>
                    <p
                      className={`font-semibold ${
                        isCurrent
                          ? "text-[#2563EB]"
                          : isCompleted
                            ? "text-green-700"
                            : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-sm text-[#64748B]">
                      {step.description}
                    </p>
                    {/* Show resolved date when on the Resolved step */}
                    {isCurrent && step.key === "RESOLVED" && complaint.resolvedAt && (
                      <p className="mt-1 text-xs text-green-600">
                        Resolved on {formatDate(complaint.resolvedAt)}
                      </p>
                    )}
                    {isCurrent && step.key === "RESOLVED" && complaint.resolutionNote && (
                      <p className="mt-1 text-sm text-[#64748B] italic">
                        {complaint.resolutionNote}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
