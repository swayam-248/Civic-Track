"use client";

import { ShieldCheck, Twitter, Github, Linkedin } from "lucide-react";
import { useApp } from "@/lib/AppContext";

// ============================================
// Footer.jsx
// The dark footer at the bottom of public pages.
// Has brand info, quick links, company links, and social icons.
// Uses mt-auto so it sticks to the bottom when content is short.
// ============================================

// Quick links that navigate to different pages
const quickLinks = [
  { label: "Home", route: "home" },
  { label: "Report Issue", route: "report" },
  { label: "Track Complaint", route: "complaints" },
  { label: "Department Stats", route: "stats" },
];

// Company info links (no route - just display text)
const companyLinks = [
  { label: "About Us" },
  { label: "Privacy Policy" },
  { label: "Contact" },
];

export default function Footer() {
  // Get the navigate function from context
  const { navigate } = useApp();

  return (
    <footer className="mt-auto rounded-t-3xl bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Grid layout: brand, quick links, company links */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand section - logo, description, social icons */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">CivicTrack</span>
            </div>

            {/* Tagline */}
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Empowering citizens to report civic issues and hold departments
              accountable for faster resolutions.
            </p>

            {/* Social media icons */}
            <div className="mt-5 flex gap-3">
              {/* Twitter */}
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              {/* Github */}
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Github"
              >
                <Github className="h-4 w-4" />
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => navigate(link.route)}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <span className="cursor-default text-sm text-slate-400">
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 CivicTrack. Making cities better, one report at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
