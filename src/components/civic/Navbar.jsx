"use client";

import { useState } from "react";
import { ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useApp } from "@/lib/AppContext";
import { NAV_ITEMS } from "@/lib/data";

// ============================================
// Navbar.jsx
// The top navigation bar shown on public pages.
// Sticky at the top, responsive with a mobile drawer.
// ============================================

export default function Navbar() {
  // Get navigation and auth state from context
  const { page, navigate, isLoggedIn, user, logout } = useApp();

  // Controls whether the mobile Sheet drawer is open
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- Handle clicking a nav link ---
  // If the item has a "section" (like "How It Works"),
  // we go home first, then scroll to that section.
  const handleNavClick = (item) => {
    if (item.section) {
      // Go to the home page first
      navigate("home");
      // After a tiny delay (so the page renders), scroll to the section
      setTimeout(() => {
        const el = document.getElementById(item.section);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Just navigate normally
      navigate(item.route);
    }
    // Close mobile menu if open
    setMobileOpen(false);
  };

  // --- Logo click goes home ---
  const handleLogoClick = () => {
    navigate("home");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - clicks go to home */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 focus:outline-none"
        >
          <ShieldCheck className="h-7 w-7" style={{ color: "#2563EB" }} />
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: "#2563EB" }}
          >
            CivicTrack
          </span>
        </button>

        {/* Desktop nav links - hidden on mobile */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            // Highlight the active link (except section links)
            const isActive = page === item.route && !item.section;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                  isActive ? "text-blue-600" : "text-slate-600"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop auth buttons - Login / Logout */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn && user ? (
            // Logged in: show name and logout button
            <>
              <span className="text-sm font-medium text-slate-700">
                {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            // Logged out: show login and sign up buttons
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("login")}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("signup")}
                className="bg-blue-600 text-white hover:bg-blue-700"
                style={{ backgroundColor: "#2563EB" }}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger menu - only shown on small screens */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            {/* Hamburger icon triggers the sheet */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            {/* Slide-in drawer from the right */}
            <SheetContent side="right" className="w-72">
              {/* Sheet header with logo */}
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" style={{ color: "#2563EB" }} />
                  <span style={{ color: "#2563EB" }}>CivicTrack</span>
                </SheetTitle>
              </SheetHeader>

              {/* Nav links inside the drawer */}
              <nav className="flex flex-col gap-1 px-4 pt-4">
                {NAV_ITEMS.map((item) => {
                  const isActive = page === item.route && !item.section;
                  return (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item)}
                      className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-slate-100 ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              {/* Auth buttons inside the drawer */}
              <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 px-4 pt-4">
                {isLoggedIn && user ? (
                  <>
                    <p className="text-sm font-medium text-slate-700">
                      {user.name}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("login");
                        setMobileOpen(false);
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("signup");
                        setMobileOpen(false);
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                      style={{ backgroundColor: "#2563EB" }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
