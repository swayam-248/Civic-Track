// ============================================
// data.js - UI-only reference constants.
//
// IMPORTANT: this file used to also hold fake business data
// (MOCK_COMPLAINTS, DEPARTMENTS, OVERALL_STATS, AI_RESPONSES). That data now
// lives in the real database (see prisma/schema.prisma + prisma/seed.js) and
// is served through /api/complaints, /api/departments/stats, /api/categories
// and /api/analyze. Everything left in this file is purely presentational -
// icon names, color classes, nav labels - not anything a real backend needs
// to own.
// ============================================

// --- Image paths (static illustration images in public/images/) ---
const IMAGES = {
  hero: "/images/hero.png",
  pothole: "/images/pothole.png",
  garbage: "/images/garbage.png",
  waterLeakage: "/images/water-leakage.png",
  streetlight: "/images/streetlight.png",
  electricPole: "/images/electric-pole.png",
  infrastructure: "/images/infrastructure.png",
  authPanel: "/images/auth-panel.png",
};

// Map category id (matches Category.id in the DB) to a display image.
export const CATEGORY_IMAGES = {
  pothole: IMAGES.pothole,
  garbage: IMAGES.garbage,
  "water-leakage": IMAGES.waterLeakage,
  streetlight: IMAGES.streetlight,
  "electric-pole": IMAGES.electricPole,
  other: IMAGES.infrastructure,
};

export function getCategoryImage(categoryId) {
  return CATEGORY_IMAGES[categoryId] || IMAGES.infrastructure;
}

// Map category id to a lucide icon name (icons are a UI concern, not data).
export const CATEGORY_ICONS = {
  pothole: "circle-alert",
  garbage: "trash-2",
  "water-leakage": "droplets",
  streetlight: "lamp",
  "electric-pole": "zap",
  other: "alert-triangle",
};

// Map category id to a tailwind color pairing for badges/chips.
export const CATEGORY_COLORS = {
  pothole: "bg-orange-100 text-orange-600",
  garbage: "bg-green-100 text-green-600",
  "water-leakage": "bg-blue-100 text-blue-600",
  streetlight: "bg-amber-100 text-amber-600",
  "electric-pole": "bg-purple-100 text-purple-600",
  other: "bg-slate-100 text-slate-600",
};

// --- Status colors for badges (statuses are a fixed enum, safe to keep here) ---
export const STATUS_STYLES = {
  SUBMITTED: { label: "Submitted", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  ACKNOWLEDGED: { label: "Acknowledged", bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  RESOLVED: { label: "Resolved", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

// --- Report wizard step labels ---
export const REPORT_STEPS = ["Upload Photo", "AI Analysis", "Add Location", "Details", "Review & Submit"];

// --- Nav items for the top navbar ---
export const NAV_ITEMS = [
  { label: "Home", route: "home" },
  { label: "How It Works", route: "home", section: "how-it-works" },
  { label: "Track Complaint", route: "complaints" },
  { label: "Department Stats", route: "stats" },
];

// --- Sidebar items for the dashboard ---
export const SIDEBAR_ITEMS = [
  { label: "Dashboard", route: "dashboard", icon: "layout-dashboard" },
  { label: "Report Issue", route: "report", icon: "camera" },
  { label: "My Complaints", route: "complaints", icon: "file-text" },
  { label: "Public Stats", route: "stats", icon: "bar-chart-3" },
  { label: "Profile", route: "dashboard", icon: "user" },
];

export { IMAGES };
