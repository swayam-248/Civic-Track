"use client";

// ============================================
// PublicStatsPage.jsx
// A public page (Navbar + Footer, no DashboardLayout)
// Shows department performance with stats, table, and bar chart.
// Data comes live from /api/departments/stats (computed from the database).
// ============================================

import { useEffect } from "react";
import {
  FileText,
  CheckCircle,
  TrendingUp,
  Clock,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/civic/StatCard.jsx";
import Navbar from "@/components/civic/Navbar.jsx";
import Footer from "@/components/civic/Footer.jsx";
import { useApp } from "@/lib/AppContext";

// Get the performance badge based on resolution rate percentage
function getPerformanceBadge(rate) {
  if (rate >= 85) {
    return { label: "Excellent", className: "bg-green-100 text-green-700 border-green-200" };
  }
  if (rate >= 70) {
    return { label: "Good", className: "bg-blue-100 text-blue-700 border-blue-200" };
  }
  return { label: "Needs Improvement", className: "bg-amber-100 text-amber-700 border-amber-200" };
}

export default function PublicStatsPage() {
  const { departmentStats, loadDepartmentStats } = useApp();

  // Load live stats from the API on mount
  useEffect(() => {
    loadDepartmentStats();
  }, [loadDepartmentStats]);

  const loading = !departmentStats;
  const deptStats = departmentStats?.departments || [];
  const OVERALL_STATS = departmentStats?.overall || {
    totalReported: 0,
    totalResolved: 0,
    resolutionRate: 0,
    avgHours: 0,
  };

  // Calculate the max total for the bar chart scaling
  const maxTotal = Math.max(...deptStats.map((d) => d.total), 1);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* ===== NAVBAR (public page, not dashboard) ===== */}
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* ===== HEADER ===== */}
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Department Performance
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              See how different departments are responding to civic issues.
            </p>
          </div>

          {/* ===== 4 STAT CARDS ===== */}
          {loading ? (
            // Show skeleton placeholders while loading
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                  <Skeleton className="mb-3 h-10 w-10 rounded-lg" />
                  <Skeleton className="mb-1 h-7 w-20" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          ) : (
            // Show real stat cards from OVERALL_STATS
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                icon={FileText}
                value={OVERALL_STATS.totalReported.toLocaleString()}
                label="Total Complaints"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={CheckCircle}
                value={OVERALL_STATS.totalResolved.toLocaleString()}
                label="Total Resolved"
                color="text-green-600"
                bgColor="bg-green-50"
              />
              <StatCard
                icon={TrendingUp}
                value={`${OVERALL_STATS.resolutionRate}%`}
                label="Overall Resolution Rate"
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard
                icon={Clock}
                value={`${OVERALL_STATS.avgHours} hrs`}
                label="Avg. Resolution Time"
                color="text-amber-600"
                bgColor="bg-amber-50"
              />
            </div>
          )}

          {/* ===== DEPARTMENT PERFORMANCE TABLE ===== */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white">
            {/* Table header bar */}
            <div className="border-b border-[#E2E8F0] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Department Breakdown
              </h2>
            </div>

            {loading ? (
              // Skeleton for table while loading
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="ml-auto h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Desktop table - hidden on mobile */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Department</TableHead>
                        <TableHead className="text-center">Total Issues</TableHead>
                        <TableHead className="text-center">Resolved</TableHead>
                        <TableHead className="min-w-[180px]">Resolution Rate</TableHead>
                        <TableHead className="text-center">Avg. Time</TableHead>
                        <TableHead className="text-center">Performance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deptStats.map((dept) => {
                        // Calculate resolution rate for this department
                        const rate = Math.round(
                          dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0
                        );
                        const perf = getPerformanceBadge(rate);
                        return (
                          <TableRow key={dept.name}>
                            {/* Department name with icon */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                                  <Building2 className="h-4 w-4 text-slate-500" />
                                </div>
                                <span className="font-medium text-[#0F172A]">
                                  {dept.name}
                                </span>
                              </div>
                            </TableCell>
                            {/* Total issues */}
                            <TableCell className="text-center font-medium">
                              {dept.total}
                            </TableCell>
                            {/* Resolved count (green) */}
                            <TableCell className="text-center font-medium text-green-700">
                              {dept.resolved}
                            </TableCell>
                            {/* Resolution rate with progress bar */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-[#2563EB] transition-all"
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className="w-10 text-right text-sm font-medium text-[#0F172A]">
                                  {rate}%
                                </span>
                              </div>
                            </TableCell>
                            {/* Average time */}
                            <TableCell className="text-center text-sm text-[#64748B]">
                              {dept.avgHours} hrs
                            </TableCell>
                            {/* Performance badge */}
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={perf.className}
                              >
                                {perf.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card layout - shown only on small screens */}
                <div className="space-y-4 p-4 md:hidden">
                  {deptStats.map((dept) => {
                    const rate = Math.round(
                      dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0
                    );
                    const perf = getPerformanceBadge(rate);
                    return (
                      <div
                        key={dept.name}
                        className="rounded-xl border border-[#E2E8F0] p-4 space-y-3"
                      >
                        {/* Department name + badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <Building2 className="h-4 w-4 text-slate-500" />
                            </div>
                            <span className="font-semibold text-[#0F172A]">
                              {dept.name}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={perf.className}
                          >
                            {perf.label}
                          </Badge>
                        </div>
                        {/* 3-column stats */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-lg font-bold text-[#0F172A]">
                              {dept.total}
                            </p>
                            <p className="text-xs text-[#64748B]">Total</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-700">
                              {dept.resolved}
                            </p>
                            <p className="text-xs text-[#64748B]">Resolved</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#0F172A]">
                              {dept.avgHours}h
                            </p>
                            <p className="text-xs text-[#64748B]">Avg Time</p>
                          </div>
                        </div>
                        {/* Resolution rate progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#64748B]">Resolution Rate</span>
                            <span className="font-medium text-[#0F172A]">{rate}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#2563EB] transition-all"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ===== BAR CHART: Resolved vs Total ===== */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold text-[#0F172A]">
              Resolved vs Total Issues
            </h2>
            <div className="space-y-5">
              {deptStats.map((dept) => {
                // Calculate bar widths based on the max total
                const totalWidth = (dept.total / maxTotal) * 100;
                const resolvedWidth =
                  dept.total > 0
                    ? (dept.resolved / maxTotal) * 100
                    : 0;
                return (
                  <div key={dept.name} className="space-y-1.5">
                    {/* Department name and resolved/total count */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-[#0F172A]">
                        {dept.name}
                      </span>
                      <span className="text-[#64748B]">
                        {dept.resolved}/{dept.total}
                      </span>
                    </div>
                    {/* Horizontal stacked bar: blue = resolved, blue-200 = unresolved */}
                    <div className="flex h-6 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="flex items-center rounded-l-full bg-[#2563EB] transition-all"
                        style={{ width: `${resolvedWidth}%` }}
                      />
                      <div
                        className="flex-1 rounded-r-full bg-blue-200 transition-all"
                        style={{
                          width: `${Math.max(totalWidth - resolvedWidth, 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend at the bottom */}
            <div className="mt-4 flex items-center gap-4 text-xs text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-[#2563EB]" />
                Resolved
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm bg-blue-200" />
                Unresolved
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ===== FOOTER (public page, not dashboard) ===== */}
      <Footer />
    </div>
  );
}
