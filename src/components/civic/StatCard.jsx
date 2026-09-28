"use client";

// ============================================
// StatCard.jsx
// A small card that shows a single statistic.
// Has an icon on the left, a big number, and a label.
// Used on the dashboard to show totals.
// ============================================

export default function StatCard({
  icon: Icon,   // A Lucide icon component (e.g. <FileText />)
  value,        // The number or string to display (e.g. "10,200")
  label,        // The description below the number (e.g. "Total Reported")
  color = "text-blue-600",       // Color for the icon
  bgColor = "bg-blue-50",        // Background color for the icon container
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex items-center gap-3">
        {/* Icon in a colored circle */}
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>

        {/* Value and label */}
        <div>
          <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
          <p className="text-sm text-[#64748B]">{label}</p>
        </div>
      </div>
    </div>
  );
}
