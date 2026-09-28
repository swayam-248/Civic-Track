"use client";

// ============================================
// EmptyState.jsx
// A simple component shown when a list is empty.
// Displays an icon, title, description, and optional action button.
// ============================================

import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        {icon || <FileX className="h-8 w-8 text-slate-400" />}
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
