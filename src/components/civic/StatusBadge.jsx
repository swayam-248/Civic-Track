"use client";

import { STATUS_STYLES } from "@/lib/data";

// ============================================
// StatusBadge.jsx
// A tiny colored pill that shows a complaint's status.
// Has a small colored dot + the status text.
// Used inside ComplaintCard and detail views.
// ============================================

export default function StatusBadge({ status }) {
  // Look up the color classes for this status. `status` is the DB enum
  // value (e.g. "IN_PROGRESS"); fall back gracefully for anything unknown.
  const style =
    STATUS_STYLES[status] || { label: status, bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      {/* The small colored dot */}
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
