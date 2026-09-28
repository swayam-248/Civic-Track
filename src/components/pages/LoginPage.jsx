"use client";

// ============================================
// LoginPage.jsx
// The login screen with a split-panel layout.
// Left side: blue gradient + background image + feature list (desktop only)
// Right side: email/password form
// On mobile, only the form shows with a logo at the top.
// ============================================

import { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/AppContext";

// The features listed on the left panel
const FEATURES = [
  "AI-powered issue classification for faster resolution",
  "Real-time tracking of your complaints",
  "Transparent department performance metrics",
  "Community-driven civic accountability",
];

export default function LoginPage() {
  // Get login function and auth state from context
  const { login, isLoggedIn, isAdmin, navigate } = useApp();

  // Form field states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard or admin based on role
  useEffect(() => {
    if (isLoggedIn) {
      navigate(isAdmin ? "admin" : "dashboard");
    }
  }, [isLoggedIn, isAdmin, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Show loading spinner
    setLoading(true);

    // Real authentication against the database via next-auth
    const success = await login(email, password);
    if (!success) {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-lg lg:grid lg:grid-cols-2">

        {/* ---- Left visual panel (desktop only) ---- */}
        <div className="hidden bg-gradient-to-br from-[#2563EB] to-[#4F46E5] p-10 lg:flex lg:flex-col justify-between relative overflow-hidden">
          {/* Background image with low opacity */}
          <div className="absolute inset-0">
            <Image
              src="/images/auth-panel.png"
              alt="Smart city illustration"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          {/* Logo + headline */}
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">CivicTrack</span>
            </div>
            <h2 className="mb-3 text-3xl font-bold leading-tight text-white">
              Making cities better, one report at a time.
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-blue-100">
              Empowering citizens to report and track civic issues with
              transparency and accountability.
            </p>
          </div>

          {/* Feature list with arrow bullets */}
          <div className="relative z-10 space-y-4">
            {FEATURES.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm text-blue-50">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- Right side: login form ---- */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm">

            {/* Mobile-only logo (hidden on desktop) */}
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <ShieldCheck className="h-8 w-8 text-[#2563EB]" />
              <span className="text-2xl font-bold text-[#0F172A]">CivicTrack</span>
            </div>

            <h1 className="mb-1 text-2xl font-bold text-[#0F172A]">Welcome back</h1>
            <p className="mb-8 text-sm text-[#64748B]">
              Sign in to your CivicTrack account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#0F172A]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                />
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                />
              </div>

              {/* Remember me + forgot password row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked === true)}
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer text-sm text-[#64748B]"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error message (shown when login fails) */}
              {error && (
                <p className="text-sm font-medium text-red-600">{error}</p>
              )}

              {/* Submit button with loading spinner */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Link to signup page */}
            <p className="mt-8 text-center text-sm text-[#64748B]">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("signup")}
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
