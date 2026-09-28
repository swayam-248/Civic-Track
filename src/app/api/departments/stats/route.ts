import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/departments/stats
// Public endpoint (no auth) - powers the transparent performance dashboard.
// Every number here is computed from real Complaint rows, nothing is typed in.
export async function GET() {
  const departments = await db.department.findMany({
    include: { complaints: true },
  });

  const departmentStats = departments.map((dept) => {
    const complaintsList = dept.complaints || [];
    const total = complaintsList.length;
    const resolved = complaintsList.filter((c) => c.status === "RESOLVED");
    const resolvedCount = resolved.length;

    const avgHours =
      resolvedCount > 0
        ? resolved.reduce((sum, c) => {
            const hours =
              (new Date(c.resolvedAt as Date).getTime() - new Date(c.createdAt).getTime()) /
              (1000 * 60 * 60);
            return sum + hours;
          }, 0) / resolvedCount
        : 0;

    return {
      id: dept.id,
      name: dept.name,
      total,
      resolved: resolvedCount,
      avgHours: Math.round(avgHours),
    };
  });

  const totalReported = departmentStats.reduce((s, d) => s + d.total, 0);
  const totalResolved = departmentStats.reduce((s, d) => s + d.resolved, 0);
  const resolutionRate = totalReported > 0 ? Math.round((totalResolved / totalReported) * 100) : 0;
  const deptsWithResolved = departmentStats.filter((d) => d.resolved > 0);
  const overallAvgHours =
    deptsWithResolved.length > 0
      ? Math.round(
          deptsWithResolved.reduce((s, d) => s + d.avgHours, 0) / deptsWithResolved.length
        )
      : 0;

  return NextResponse.json({
    departments: departmentStats,
    overall: {
      totalReported,
      totalResolved,
      resolutionRate,
      avgHours: overallAvgHours || 0,
    },
  });
}
