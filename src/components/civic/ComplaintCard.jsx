"use client";

import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "@/lib/utils";

// ============================================
// ComplaintCard.jsx
// A card showing one complaint's summary.
// Has a thumbnail image, ID, status badge,
// category name, location, and date.
// The whole card is clickable (calls onClick).
// ============================================

export default function ComplaintCard({ complaint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[#E2E8F0] bg-white p-4 text-left transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
    >
      <div className="flex gap-4">
        {/* Thumbnail image (80x80) */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={complaint.imageUrl || "/images/infrastructure.png"}
            alt={complaint.category?.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        {/* Text info */}
        <div className="min-w-0 flex-1">
          {/* Top row: complaint ID on the left, status badge on the right */}
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-[#64748B]">
              {complaint.referenceCode}
            </p>
            <StatusBadge status={complaint.status} />
          </div>

          {/* Category name */}
          <p className="mb-1 font-semibold text-[#0F172A]">
            {complaint.category?.name}
          </p>

          {/* Location and date - small text with icons */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
            {/* Location - truncate if too long */}
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {complaint.location.length > 30
                ? complaint.location.substring(0, 30) + "..."
                : complaint.location}
            </span>
            {/* Date */}
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(complaint.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
