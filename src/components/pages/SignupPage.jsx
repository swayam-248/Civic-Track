"use client";

// ============================================
// SignupPage.jsx
// The sign-up screen with a split-panel layout (same as login).
// Left side: blue gradient + background image + feature list (desktop only)
// Right side: name, email, password (with strength bar), confirm password, terms
// ============================================

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ShieldCheck, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
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

// --- Password strength checker ---
// Returns "weak", "medium", or "strong" based on password rules:
//   weak   = less than 6 characters
//   medium = 6 to 8 characters
//   strong = 8+ characters with at least one special char or number
function getPasswordStrength(password) {
  if (password.length === 0) return "weak";
  const hasSpecialOrNumber = /[^a-zA-Z]/.test(password);
  if (password.length < 6) return "weak";
  if (password.length <= 8) return "medium";
  if (hasSpecialOrNumber) return "strong";
  return "medium";
}

// How each strength level looks (colors and bar width)
const strengthConfig = {
  weak: { label: "Weak", color: "text-red-600", barColor: "bg-red-500", width: "w-1/3" },
  medium: { label: "Medium", color: "text-amber-600", barColor: "bg-amber-500", width: "w-2/3" },
  strong: { label: "Strong", color: "text-green-600", barColor: "bg-green-500", width: "w-full" },
};

export default function SignupPage() {
  // Get signup function and auth state from context
  const { signup, isLoggedIn, navigate, authError } = useApp();

  // Form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isLoggedIn) {
      navigate("dashboard");
    }
  }, [isLoggedIn, navigate]);

  // Calculate password strength whenever password changes
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthInfo = strengthConfig[strength];

  // Remove a specific error when the user starts fixing that field
  const clearError = (field) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Validate all fields before submitting
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!terms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    // If no errors were added, the form is valid
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // Real registration: creates the user in the DB (bcrypt-hashed), then signs in
    const success = await signup(name, email, password);
    if (!success) {
      setErrors({ form: authError || "Something went wrong. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
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
              Join thousands of citizens who are actively improving their
              communities through transparent civic reporting.
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

        {/* ---- Right side: signup form ---- */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-sm">

            {/* Mobile-only logo (hidden on desktop) */}
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
              <ShieldCheck className="h-8 w-8 text-[#2563EB]" />
              <span className="text-2xl font-bold text-[#0F172A]">CivicTrack</span>
            </div>

            <h1 className="mb-1 text-2xl font-bold text-[#0F172A]">
              Create your account
            </h1>
            <p className="mb-8 text-sm text-[#64748B]">
              Join CivicTrack and start reporting civic issues
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-[#0F172A]">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className="h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-[#0F172A]">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className="h-11 border-[#E2E8F0] focus-visible:ring-[#2563EB]"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password field with eye toggle and strength bar */}
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-[#0F172A]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    className="h-11 border-[#E2E8F0] pr-10 focus-visible:ring-[#2563EB]"
                  />
                  {/* Eye icon to toggle password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password strength bar (only shown when user has typed something) */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${strengthInfo.barColor} ${strengthInfo.width}`}
                      />
                    </div>
                    <p className={`text-xs font-medium ${strengthInfo.color}`}>
                      {strengthInfo.label}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password field with eye toggle */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-[#0F172A]">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearError("confirmPassword");
                    }}
                    className="h-11 border-[#E2E8F0] pr-10 focus-visible:ring-[#2563EB]"
                  />
                  {/* Eye icon to toggle confirm password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={terms}
                    onCheckedChange={(checked) => {
                      setTerms(checked === true);
                      clearError("terms");
                    }}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="terms"
                    className="cursor-pointer text-sm leading-snug text-[#64748B]"
                  >
                    I agree to the{" "}
                    <span className="font-medium text-[#0F172A]">Terms of Service</span>{" "}
                    and{" "}
                    <span className="font-medium text-[#0F172A]">Privacy Policy</span>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms}</p>
                )}
              </div>

              {/* General form error (e.g. signup failed) */}
              {errors.form && (
                <p className="text-sm font-medium text-red-600">{errors.form}</p>
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            {/* Link to login page */}
            <p className="mt-8 text-center text-sm text-[#64748B]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("login")}
                className="font-semibold text-[#2563EB] hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
