"use client";

// ============================================
// ReportIssuePage.jsx
// A 5-step wizard for reporting a civic issue.
// Steps: Upload Photo → AI Analysis → Location → Details → Review & Submit
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  X,
  MapPin,
  Building2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Camera,
  FileText,
  BarChart3,
  Brain,
  Loader2,
  CircleAlert,
  Trash2,
  Droplets,
  Lamp,
  Zap,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useApp } from "@/lib/AppContext";
import { CATEGORY_IMAGES, REPORT_STEPS } from "@/lib/data";
import DashboardLayout from "@/components/civic/DashboardLayout.jsx";

// Map icon string names to actual lucide components (for category icons)
const categoryIconMap = {
  "circle-alert": CircleAlert,
  "trash-2": Trash2,
  droplets: Droplets,
  lamp: Lamp,
  zap: Zap,
  "alert-triangle": AlertTriangle,
};

// Color classes for each category when selected
const categoryColorMap = {
  pothole: "text-orange-600 bg-orange-50 border-orange-200",
  garbage: "text-green-600 bg-green-50 border-green-200",
  "water-leakage": "text-blue-600 bg-blue-50 border-blue-200",
  streetlight: "text-amber-600 bg-amber-50 border-amber-200",
  "electric-pole": "text-purple-600 bg-purple-50 border-purple-200",
  other: "text-slate-600 bg-slate-50 border-slate-200",
};

// Map AI result icon string to a category image URL (for the review step)
const iconToImage = {
  "circle-alert": "/images/pothole.png",
  "trash-2": "/images/garbage.png",
  droplets: "/images/water-leakage.png",
  lamp: "/images/streetlight.png",
  zap: "/images/electric-pole.png",
  "alert-triangle": "/images/infrastructure.png",
};

// The 3 stages shown during AI processing animation
const processingStages = [
  "Uploading photo...",
  "AI is checking your photo...",
  "Finding the responsible department...",
];

export default function ReportIssuePage() {
  const {
    navigate,
    isLoggedIn,
    setSelectedId,
    analyzeImage,
    uploadImage,
    createComplaint,
    categories,
  } = useApp();

  // --- Wizard state ---
  const [currentStep, setCurrentStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);

  // --- Step 0: Upload state ---
  const [file, setFile] = useState(null);       // The uploaded File object
  const [imagePreview, setImagePreview] = useState(null); // Object URL for preview
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null); // Real stored URL after upload
  const [selectedCategory, setSelectedCategory] = useState(null); // Category ID if no image
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- Step 1: AI Analysis state ---
  const [aiResult, setAiResult] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);

  // --- Step 2: Location state ---
  const [location, setLocation] = useState("");

  // --- Step 3: Details state ---
  const [description, setDescription] = useState("");

  // --- Step 4: Submit state ---
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // --- Auth guard: redirect to login if not logged in ---
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("login");
    }
  }, [isLoggedIn, navigate]);

  // --- Cleanup object URL when component unmounts ---
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, []);

  // --- Handle file selection (validates type and size) ---
  const handleFile = useCallback(
    (selectedFile) => {
      const isImg =
        (selectedFile.type && selectedFile.type.startsWith("image/")) ||
        /\.(jpe?g|png|webp|jfif|gif|avif|heic|heif)$/i.test(selectedFile.name || "");

      if (!isImg) {
        toast.error("Invalid format", {
          description: "Please upload an image file (JPG, PNG, WEBP, GIF, AVIF).",
        });
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload an image under 15MB.",
        });
        return;
      }
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setUploadedImageUrl(null);
      setAiResult(null);
    },
    [imagePreview]
  );

  // --- Drag and drop handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  // --- File input change handler ---
  const handleFileInput = (e) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  // --- Remove the uploaded image ---
  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setAiResult(null);
    setSelectedCategory(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Category quick-select (used when no image is uploaded) ---
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // --- Run AI analysis when we reach step 1 ---
  useEffect(() => {
    if (currentStep !== 1 || aiResult) return;
    if (!file && !selectedCategory) return;

    let cancelled = false;

    const runAnalysis = async () => {
      setAiProcessing(true);
      setProcessingStage(0);

      // Animate through the processing stages while the real work happens
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      setProcessingStage(1);

      let imageUrl = uploadedImageUrl;
      if (file && !imageUrl) {
        try {
          imageUrl = await uploadImage(file);
          if (cancelled) return;
          setUploadedImageUrl(imageUrl);
        } catch (err) {
          if (!cancelled) {
            toast.error("Upload failed", {
              description: err?.message || "Could not upload your photo. Please try again.",
            });
            setAiProcessing(false);
          }
          return;
        }
      }

      setProcessingStage(2);

      // Real analysis: category the user picked/implied + real pixel stats
      // from the uploaded image (see /api/analyze route for what this does
      // and does not do).
      const catId = selectedCategory || null;
      if (!catId && !imageUrl) {
        setAiProcessing(false);
        return;
      }
      try {
        const result = await analyzeImage(catId, imageUrl);
        if (cancelled) return;
        setAiResult(result);
      } catch (err) {
        if (!cancelled) {
          toast.error("Analysis failed", {
            description: "Could not analyze the photo. Please try again.",
          });
        }
      }
      setAiProcessing(false);
    };

    runAnalysis();
    return () => {
      cancelled = true;
    };
  }, [currentStep, file, selectedCategory, aiResult, analyzeImage, uploadImage, uploadedImageUrl, categories]);

  // --- Step navigation with fade transition ---
  const goToStep = (step) => {
    setStepVisible(false);
    setTimeout(() => {
      setCurrentStep(step);
      setStepVisible(true);
    }, 200);
  };

  const handleNext = () => {
    if (currentStep < 4) goToStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  // --- Can the user proceed to the next step? ---
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        // Must upload an image OR select a category
        return file !== null || selectedCategory !== null;
      case 1:
        // Must have AI result and not be processing
        return aiResult !== null && !aiProcessing;
      case 2:
        // Must have a location
        return location.trim().length > 0;
      case 3:
        // Details are optional, always allowed
        return true;
      default:
        return false;
    }
  };

  // --- Submit the complaint ---
  const handleSubmit = async () => {
    if (!aiResult || !location.trim()) return;
    setSubmitting(true);
    try {
      const complaint = await createComplaint({
        categoryId: aiResult.categoryId,
        location: location.trim(),
        description: description.trim() || "No additional details provided.",
        imageUrl: uploadedImageUrl,
        confidenceScore: aiResult.confidence,
      });
      setSelectedId(complaint.id);
      setSubmittedComplaint(complaint);
      setSuccess(true);
    } catch (err) {
      toast.error("Submission failed", {
        description: "Could not submit your complaint. Please try again.",
      });
    }
    setSubmitting(false);
  };

  // --- Auth guard: don't render if not logged in ---
  if (!isLoggedIn) return null;

  // --- Helper: confidence badge color based on percentage ---
  const getConfidenceBadge = (confidence) => {
    if (confidence > 90)
      return "bg-green-100 text-green-700 border-green-200";
    if (confidence > 80)
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  // --- Helper: get the lucide icon component for an AI result icon name ---
  const getAIResultIcon = (iconName) => {
    return categoryIconMap[iconName] || AlertTriangle;
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        {/* ===== SUCCESS SCREEN ===== */}
        {success && submittedComplaint ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Big green checkmark */}
            <div className="mb-6 animate-[scale-in_0.5s_ease-out]">
              <CheckCircle className="h-20 w-20 text-green-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[#0F172A]">
              Complaint Submitted Successfully!
            </h1>
            <p className="mb-6 text-[#64748B]">
              Your issue has been assigned to:{" "}
              <span className="font-semibold text-[#0F172A]">
                {submittedComplaint.department?.name}
              </span>
            </p>
            {/* Complaint ID card */}
            <div className="mb-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-4">
              <p className="text-sm text-[#64748B]">Complaint ID</p>
              <p className="text-xl font-bold text-[#2563EB]">
                {submittedComplaint.referenceCode}
              </p>
            </div>
            <div className="mb-8">
              <Badge className="border-blue-200 bg-blue-100 px-3 py-1 text-blue-700">
                Status: Submitted
              </Badge>
            </div>
            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => navigate("complaint-details")}
                className="min-w-[160px]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Track Complaint
              </Button>
              <Button
                onClick={() => navigate("dashboard")}
                className="min-w-[160px] bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ===== PAGE HEADER ===== */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">
                Report an Issue
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                Use AI to identify and report civic issues in your area
              </p>
            </div>

            {/* ===== STEP INDICATOR ===== */}
            {/* 5 circles connected by lines. Completed ones are blue with checkmark. */}
            <div className="mb-8 flex items-center justify-center">
              {REPORT_STEPS.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                const isFuture = index > currentStep;

                return (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                          isCompleted
                            ? "border-[#2563EB] bg-[#2563EB] text-white"
                            : isCurrent
                              ? "border-[#2563EB] bg-white text-[#2563EB]"
                              : "border-slate-300 bg-white text-slate-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      {/* Step label - hidden on very small screens */}
                      <span
                        className={`mt-1.5 hidden text-[10px] font-medium sm:block ${
                          isCurrent
                            ? "text-[#2563EB]"
                            : isCompleted
                              ? "text-slate-700"
                              : "text-slate-400"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {/* Connector line between circles */}
                    {index < REPORT_STEPS.length - 1 && (
                      <div
                        className={`mx-1 h-0.5 w-6 sm:mx-2 sm:w-10 lg:w-14 ${
                          index < currentStep ? "bg-[#2563EB]" : "bg-slate-200"
                        } transition-colors duration-300`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* ===== STEP CONTENT (with fade animation) ===== */}
            <div
              className={`rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-opacity duration-200 sm:p-8 ${
                stepVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* ----- STEP 0: UPLOAD PHOTO ----- */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  {/* Drag-and-drop zone (shown when no image preview) */}
                  {!imagePreview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 ${
                        isDragging
                          ? "border-[#2563EB] bg-blue-50/50"
                          : "border-slate-300 bg-slate-50/50 hover:border-[#2563EB]/50 hover:bg-blue-50/30"
                      }`}
                    >
                      <Upload className="mb-3 h-12 w-12 text-slate-400" />
                      <p className="text-base font-semibold text-[#0F172A]">
                        Upload a photo of the issue
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Take a clear photo so our AI can identify the problem
                        accurately.
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        JPG, PNG, WEBP, GIF up to 15MB
                      </p>
                    </div>
                  ) : (
                    /* Show uploaded image preview with remove button */
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Uploaded issue photo"
                        className="h-64 w-full rounded-2xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {/* Category quick-select grid (shown when no image) */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-[#64748B]">
                      Or select a category
                    </p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {categories.map((cat) => {
                        const IconComp = categoryIconMap[cat.icon];
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all ${
                              isSelected
                                ? categoryColorMap[cat.id] ||
                                  "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                                : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {IconComp && <IconComp className="h-5 w-5" />}
                            <span className="text-[11px] font-medium leading-tight">
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ----- STEP 1: AI ANALYSIS ----- */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {aiProcessing ? (
                    /* Show 3 animated processing stages with spinner */
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                      {/* Image thumbnail or camera placeholder */}
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Analyzing"
                          className="h-28 w-28 flex-shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Camera className="h-8 w-8 text-slate-400" />
                        </div>
                      )}

                      {/* Processing stages list */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-[#2563EB]" />
                          <span className="text-sm font-semibold text-[#0F172A]">
                            AI Analysis in Progress
                          </span>
                        </div>

                        {[0, 1, 2].map((stage) => (
                          <div
                            key={stage}
                            className={`flex items-center gap-3 transition-all duration-300 ${
                              stage <= processingStage
                                ? "opacity-100"
                                : "opacity-30"
                            }`}
                          >
                            {/* Show checkmark for completed, spinner for current, empty circle for future */}
                            {stage < processingStage ? (
                              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                            ) : stage === processingStage ? (
                              <Loader2 className="h-5 w-5 animate-spin flex-shrink-0 text-[#2563EB]" />
                            ) : (
                              <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-300" />
                            )}
                            <span
                              className={`text-sm ${
                                stage <= processingStage
                                  ? "text-[#0F172A]"
                                  : "text-slate-400"
                              }`}
                            >
                              {processingStages[stage]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : aiResult ? (
                    /* Show AI analysis result */
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="text-base font-bold text-[#0F172A]">
                          AI Analysis Complete
                        </h3>
                      </div>

                      <div className="rounded-xl border border-[#E2E8F0] bg-slate-50/50 p-5">
                        <div className="space-y-4">
                          {/* Detected issue row */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#64748B]">
                              Detected Issue
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB]/10">
                                {(() => {
                                  const IconComp = getAIResultIcon(aiResult.icon);
                                  return (
                                    <IconComp className="h-4 w-4 text-[#2563EB]" />
                                  );
                                })()}
                              </div>
                              <span className="text-sm font-semibold text-[#0F172A]">
                                {aiResult.category}
                              </span>
                            </div>
                          </div>

                          {/* Confidence row */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#64748B]">
                              Confidence
                            </span>
                            <Badge
                              className={`border ${getConfidenceBadge(aiResult.confidence)}`}
                            >
                              {aiResult.confidence}%
                            </Badge>
                          </div>

                          {/* Assigned department row */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#64748B]">
                              Assigned To
                            </span>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-[#0F172A]">
                              <Building2 className="h-4 w-4 text-[#64748B]" />
                              {aiResult.department}
                            </div>
                          </div>

                          {/* AI Model row */}
                          {aiResult.model && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#64748B]">
                                AI Model
                              </span>
                              <Badge className="border border-purple-200 bg-purple-50 text-purple-700 text-[11px]">
                                {aiResult.model}
                              </Badge>
                            </div>
                          )}

                          {/* AI Reasoning box */}
                          {aiResult.reasoning && (
                            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-slate-700 space-y-1">
                              <p className="font-semibold text-[#2563EB] flex items-center gap-1.5">
                                <Brain className="h-3.5 w-3.5" />
                                Visual Reasoning Analysis
                              </p>
                              <p className="leading-relaxed text-slate-600">{aiResult.reasoning}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">
                        AI suggestions can be reviewed by the responsible
                        department.
                      </p>
                    </div>
                  ) : (
                    /* Fallback when no image and no category selected */
                    <div className="flex flex-col items-center py-8 text-center">
                      <Brain className="mb-3 h-10 w-10 text-slate-300" />
                      <p className="text-sm text-[#64748B]">
                        No image uploaded. Selecting a category will use a
                        default analysis.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ----- STEP 2: LOCATION ----- */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Where is the issue located?
                  </h3>

                  {/* Text input for the address */}
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sector 14 Main Road, near City Mall"
                    className="h-11"
                  />

                  {/* Current location button (shows toast) */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast.info("Coming soon", {
                        description:
                          "Location detection will be available in a future update.",
                      })
                    }
                    className="gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Use Current Location
                  </Button>

                  {/* Map placeholder */}
                  <div className="flex h-44 flex-col items-center justify-center rounded-xl bg-slate-100">
                    <MapPin className="mb-2 h-8 w-8 text-slate-400" />
                    <p className="text-sm text-slate-500">
                      Map integration coming soon
                    </p>
                  </div>
                </div>
              )}

              {/* ----- STEP 3: DETAILS ----- */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Add more details (optional)
                  </h3>

                  {/* Textarea with 500 char limit */}
                  <Textarea
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setDescription(e.target.value);
                      }
                    }}
                    placeholder="Example: Large pothole near the main road, causing traffic problems."
                    className="min-h-[100px] resize-none"
                    rows={4}
                  />

                  {/* Character counter */}
                  <p className="text-right text-xs text-[#64748B]">
                    {description.length}/500 characters
                  </p>
                </div>
              )}

              {/* ----- STEP 4: REVIEW & SUBMIT ----- */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-base font-semibold text-[#0F172A]">
                    Review your complaint before submitting
                  </h3>

                  <div className="space-y-4">
                    {/* Photo / Category image row */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 flex-shrink-0">
                        {imagePreview || uploadedImageUrl ? (
                          <img
                            src={imagePreview || uploadedImageUrl}
                            alt="Issue photo"
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : aiResult ? (
                          <Image
                            src={iconToImage[aiResult.icon] || "/images/infrastructure.png"}
                            alt={aiResult.category}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100">
                            <Camera className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#0F172A]">
                          {aiResult?.category || "Unknown Issue"}
                        </p>
                        <p className="mt-0.5 text-sm text-[#64748B]">
                          {imagePreview ? "Uploaded photo" : "Category selected"}
                        </p>
                      </div>
                    </div>

                    <div className="h-px bg-[#E2E8F0]" />

                    {/* Department row */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">
                        Responsible Department
                      </span>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-[#0F172A]">
                        <Building2 className="h-4 w-4 text-[#64748B]" />
                        {aiResult?.department || "—"}
                      </div>
                    </div>

                    <div className="h-px bg-[#E2E8F0]" />

                    {/* Location row */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-[#64748B]">
                        Location
                      </span>
                      <span className="max-w-[60%] text-right text-sm font-medium text-[#0F172A]">
                        {location || "—"}
                      </span>
                    </div>

                    <div className="h-px bg-[#E2E8F0]" />

                    {/* Description row */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex-shrink-0 text-sm text-[#64748B]">
                        Description
                      </span>
                      <span className="max-w-[60%] text-right text-sm text-[#0F172A]">
                        {description.trim()
                          ? description.trim()
                          : "No description provided"}
                      </span>
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="h-12 w-full bg-[#2563EB] text-base font-semibold hover:bg-[#1D4ED8]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* ===== BACK / NEXT NAVIGATION BUTTONS ===== */}
            {!success && (
              <div className="mt-6 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? "invisible" : "gap-2"}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                {/* Next button (hidden on the last step, disabled if can't proceed) */}
                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="gap-2 bg-[#2563EB] hover:bg-[#1D4ED8]"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
