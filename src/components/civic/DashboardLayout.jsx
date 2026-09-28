"use client";

import {
  ShieldCheck,
  LayoutDashboard,
  Camera,
  FileText,
  BarChart3,
  User,
  LogOut,
  Shield,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/AppContext";
import { SIDEBAR_ITEMS } from "@/lib/data";

// ============================================
// DashboardLayout.jsx
// Wraps dashboard pages with a fixed sidebar (desktop)
// and a hamburger header (mobile).
// Children are rendered in the main content area.
// ============================================

// Map the icon string from data.js to the actual Lucide component
const iconMap = {
  "layout-dashboard": LayoutDashboard,
  camera: Camera,
  "file-text": FileText,
  "bar-chart-3": BarChart3,
  user: User,
  shield: Shield,
};

// --- SidebarContent ---
// The actual sidebar nav, reused in both desktop and mobile drawer.
// onNavigate is called after clicking a link (to close the mobile drawer).
function SidebarContent({ onNavigate }) {
  const { page, navigate, logout, user } = useApp();

  return (
    <div className="flex h-full flex-col">
      {/* Logo at the top of the sidebar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] px-6 py-5">
        <ShieldCheck className="h-7 w-7 text-[#2563EB]" />
        <span className="text-xl font-bold text-[#0F172A]">CivicTrack</span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {SIDEBAR_ITEMS.map((item) => {
          // Look up the icon component from our map
          const IconComponent = iconMap[item.icon];
          // Highlight the current page
          const isActive = page === item.route;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                navigate(item.route);
                // Close the mobile drawer after navigating
                if (onNavigate) onNavigate();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
              }`}
            >
              {IconComponent && <IconComponent className="h-5 w-5" />}
              {item.label}
            </button>
          );
        })}

        {/* Admin Panel link - only shown for admin users */}
        {user && user.role === "ADMIN" && (
          <button
            type="button"
            onClick={() => {
              navigate("admin");
              if (onNavigate) onNavigate();
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              page === "admin"
                ? "bg-[#2563EB]/10 text-[#2563EB]"
                : "text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]"
            }`}
          >
            <Shield className="h-5 w-5" />
            Admin Panel
          </button>
        )}
      </nav>

      {/* Logout button pinned to the bottom */}
      <div className="border-t border-[#E2E8F0] px-3 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

// --- Main DashboardLayout ---
// Renders the sidebar + main content area.
export default function DashboardLayout({ children }) {
  const { sidebarOpen, setSidebarOpen, user } = useApp();

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar - fixed on the left, hidden on small screens */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-shrink-0 border-r border-[#E2E8F0] bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Main content area - pushed right on desktop to make room for sidebar */}
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        {/* Mobile header - only shown on small screens */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
          {/* Hamburger menu opens the sidebar drawer */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5 text-[#0F172A]" />
              </Button>
            </SheetTrigger>

            {/* Drawer slides in from the left */}
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* App name in the mobile header */}
          <span className="text-base font-bold text-[#0F172A]">CivicTrack</span>

          {/* User avatar in the mobile header */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#2563EB]/10 text-xs font-semibold text-[#2563EB]">
              {user && user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* The page content goes here */}
        <main className="flex-1 bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
