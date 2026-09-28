"use client";

// ============================================
// HomePage.jsx
// The landing page for CivicTrack.
// Sections: Hero, Stats, How It Works, Categories, CTA, Footer.
// ============================================

import {
  Camera,
  Brain,
  BarChart3,
  CheckCircle,
  TrendingUp,
  Clock,
  FileText,
  Route,
  CircleAlert,
  Trash2,
  Droplets,
  Lamp,
  Zap,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import { CATEGORY_COLORS, CATEGORY_IMAGES, IMAGES } from "@/lib/data";
import Navbar from "@/components/civic/Navbar.jsx";
import Footer from "@/components/civic/Footer.jsx";

// Map icon string names to actual lucide components
const ICON_MAP = {
  "circle-alert": CircleAlert,
  "trash-2": Trash2,
  droplets: Droplets,
  lamp: Lamp,
  zap: Zap,
  "alert-triangle": AlertTriangle,
};

export default function HomePage() {
  // Get navigation and auth state from context
  const { navigate, isLoggedIn, categories, departmentStats, loadDepartmentStats } = useApp();

  // Load live platform stats from the database when the page mounts
  useEffect(() => {
    loadDepartmentStats();
  }, [loadDepartmentStats]);

  const overall = departmentStats?.overall;

  // If user is logged in, report goes to report page; otherwise login
  const handleReportClick = () => {
    navigate(isLoggedIn ? "report" : "login");
  };

  // The 4 stat items shown in the stats row
  const statItems = [
    {
      icon: FileText,
      value: overall ? overall.totalReported.toLocaleString() : "—",
      label: "Issues Reported",
    },
    {
      icon: CheckCircle,
      value: overall ? overall.totalResolved.toLocaleString() : "—",
      label: "Resolved",
    },
    {
      icon: TrendingUp,
      value: overall ? `${overall.resolutionRate}%` : "—",
      label: "Resolution Rate",
    },
    {
      icon: Clock,
      value: overall ? `${overall.avgHours} hrs` : "—",
      label: "Avg. Resolution Time",
    },
  ];

  // The 4 steps in "How It Works"
  const steps = [
    {
      number: "01",
      title: "Capture",
      description: "Upload a photo of the civic issue.",
      icon: Camera,
    },
    {
      number: "02",
      title: "AI Detects",
      description: "AI identifies the type of problem.",
      icon: Brain,
    },
    {
      number: "03",
      title: "Auto Routed",
      description: "The issue is sent to the responsible department.",
      icon: Route,
    },
    {
      number: "04",
      title: "Track Resolution",
      description: "Follow your complaint until it's resolved.",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== NAVBAR ===== */}
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Text + CTAs */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                See a Problem.{" "}
                <span className="text-blue-600">Snap a Photo.</span>{" "}
                Get It Fixed.
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-600 sm:text-xl">
                Report potholes, garbage, water leaks, broken streetlights, and
                other civic issues in minutes. CivicTrack uses AI to identify the
                problem and route it to the right department.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={handleReportClick}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  Report an Issue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("stats")}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  View Public Dashboard
                </Button>
              </div>
            </div>

            {/* Right: Hero Image with floating cards */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Main hero image (500x350) */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-blue-200/50">
                  <Image
                    src={IMAGES.hero}
                    alt="Person using smartphone to report a civic issue"
                    width={500}
                    height={350}
                    className="h-auto w-full object-cover"
                    priority
                  />
                </div>

                {/* Floating Card 1: AI Analysis */}
                <div className="absolute -left-4 top-8 z-10 flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:-left-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">AI Analysis</p>
                    <p className="text-[11px] text-slate-500">94% accurate</p>
                  </div>
                </div>

                {/* Floating Card 2: Resolved / Avg time */}
                <div className="absolute -right-4 bottom-12 z-10 flex items-center gap-2.5 rounded-xl border border-white/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:-right-8">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">82% Resolved</p>
                    <p className="text-[11px] text-slate-500">Avg. 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ROW ===== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {statItems.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 p-5 text-center sm:p-6"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Four simple steps from complaint to resolution
            </p>
          </div>

          <div className="relative mt-14">
            {/* Dashed connector line - desktop only */}
            <div className="absolute left-0 right-0 top-16 hidden h-0.5 border-t-2 border-dashed border-blue-200 lg:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="relative flex flex-col items-center text-center"
                  >
                    {/* Step number label */}
                    <span className="mb-3 text-xs font-bold tracking-widest text-blue-500 uppercase">
                      Step {step.number}
                    </span>
                    {/* Icon circle */}
                    <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-blue-600 shadow-md">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-[200px] text-sm leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ISSUE CATEGORIES ===== */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Common Civic Issues
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              CivicTrack can identify and route various types of infrastructure
              problems.
            </p>
          </div>

          {/* Category cards grid: 1 col mobile, 2 sm, 3 lg */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || AlertTriangle;
              const colorClasses = CATEGORY_COLORS[cat.id] || "bg-slate-100 text-slate-600";
              const catImage = CATEGORY_IMAGES[cat.id];
              return (
                <div
                  key={cat.id}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
                >
                  {/* Category image */}
                  <div className="relative h-40 w-full bg-slate-100">
                    {catImage && (
                      <Image
                        src={catImage}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    {/* Icon badge overlay in the bottom-left corner */}
                    <div
                      className={`absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses} shadow-sm`}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-slate-800">
                      {cat.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      {cat.description}
                    </p>
                    <p className="mt-3 text-xs font-medium text-blue-600">
                      {cat.department?.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ACCOUNTABILITY CTA ===== */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Better Reporting. Faster Action. Greater Accountability.
          </h2>
          {/* Three check points */}
          <div className="mx-auto mt-8 flex max-w-lg flex-col gap-4">
            {[
              "Resolution rate visible publicly",
              "Average resolution time tracked",
              "Total complaints handled transparently",
            ].map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 text-left"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-base text-blue-100">{point}</span>
              </div>
            ))}
          </div>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("stats")}
            className="mt-10 border-white bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800"
          >
            View Department Performance
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
