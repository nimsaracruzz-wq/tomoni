"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import {
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Building2,
  Calendar,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Printer,
  RotateCcw,
  Clock,
  ArrowRight,
} from "lucide-react";

interface PublicConfig {
  institute?: {
    name?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    privacyText?: string;
  };
  courses: Array<{ id: string; name: string }>;
  intakes: Array<{ id: string; name: string; year?: string; month?: string }>;
  categories: Array<{ id: string; name: string }>;
  schedules?: Array<{ id: string; name: string }>;
  formToken: string;
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function RegistrationFormInner() {
  const [requestedCourse, setRequestedCourse] = useState("");
  const [requestedCategory, setRequestedCategory] = useState("");

  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState("");
  const [tokenTime, setTokenTime] = useState<number>(0);

  // Form state for the single public registration flow.
  const [formData, setFormData] = useState({
    full_name: "",
    preferred_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    address_city: "",
    course_id: "",
    current_level: "Beginner / No experience",
    category: "general",
    intake_id: "",
    guardian_name: "",
    guardian_email: "",
    guardian_phone: "",
    contact_recipient: "",
    message: "",
    privacy_acknowledged: false,
    promotional_consent: false,
    website: "", // Anti-bot honeypot
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  const [submittedData, setSubmittedData] = useState<{
    reference: string;
    id: string;
    fullName: string;
    email: string;
    courseName: string;
    categoryName: string;
    intakeName: string;
  } | null>(null);

  // Load public configuration from backend
  const fetchConfig = (course = requestedCourse, category = requestedCategory) => {
    setLoadingConfig(true);
    setConfigError("");

    fetch("/api/public/config")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load registration options.");
        }
        setConfig(data);
        setTokenTime(Date.now());

        // Generate client idempotency key
        setIdempotencyKey(generateUUID());

        // Pre-select initial category & course
        let defaultCategory = "general";
        if (category && data.categories.some((c: { id: string }) => c.id === category)) {
          defaultCategory = category;
        } else if (course && data.categories.some((c: { id: string }) => c.id === course)) {
          defaultCategory = course;
        }

        const defaultIntake = data.intakes?.[0]?.id || "";

        setFormData((prev) => {
          const effectiveCat = prev.category || defaultCategory;
          return {
            ...prev,
            category: effectiveCat,
            course_id: effectiveCat,
            intake_id: effectiveCat === "visa" ? (prev.intake_id || defaultIntake) : "",
          };
        });

        setLoadingConfig(false);
      })
      .catch((err) => {
        setConfigError(err instanceof Error ? err.message : "Unable to load form.");
        setLoadingConfig(false);
      });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const course = searchParams.get("course") || "";
    const category = searchParams.get("category") || "";
    setRequestedCourse(course);
    setRequestedCategory(category);
    fetchConfig(course, category);
  }, []);

  const isVisa = formData.category === "visa";
  const isKids = formData.category === "kids";
  const isGuardianRecipient = isKids && formData.contact_recipient === "guardian";

  // Keep course and category selections synchronized.
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setFormData((prev) => {
      const nextIntake =
        newCategory === "visa"
          ? prev.intake_id || config?.intakes?.[0]?.id || ""
          : "";
      return {
        ...prev,
        category: newCategory,
        course_id: newCategory,
        intake_id: nextIntake,
        contact_recipient: newCategory === "kids" ? prev.contact_recipient : "",
      };
    });

    if (fieldErrors.category) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.category;
        delete next.intake_id;
        delete next.course_id;
        return next;
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !config) return;

    setGeneralError("");
    setFieldErrors({});

    // Honeypot anti-spam check
    if (formData.website) {
      console.warn("Spam detected via honeypot trap.");
      return;
    }

    // Client-side quick validation matching backend expectations
    const clientErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      clientErrors.full_name = "Full name is required.";
    }

    if (!isGuardianRecipient) {
      if (!formData.email.trim()) {
        clientErrors.email = "Student email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        clientErrors.email = "Enter a valid student email address.";
      }

      if (!formData.phone.trim()) {
        clientErrors.phone = "Student phone number is required.";
      } else {
        const norm = formData.phone.trim().replace(/^\+94\s*/, "0").replace(/[ -]/g, "");
        if (!/^0[1-9]\d{8}$/.test(norm) && !/^\+?[1-9]\d{7,14}$/.test(norm)) {
          clientErrors.phone = "Enter a valid phone number (e.g. 077 123 4567).";
        }
      }
    }

    if (!formData.address_line1.trim()) {
      clientErrors.address_line1 = "Address Line 1 is required.";
    }

    if (!formData.address_city.trim()) {
      clientErrors.address_city = "City or town is required.";
    }

    if (!formData.category) {
      clientErrors.category = "Registration category is required.";
    }

    if (isVisa && !formData.intake_id) {
      clientErrors.intake_id = "Select an available visa intake.";
    }

    if (isKids) {
      if (!formData.contact_recipient) {
        clientErrors.contact_recipient = "Choose whether student or guardian receives communications.";
      }
      if (isGuardianRecipient) {
        if (!formData.guardian_name.trim()) {
          clientErrors.guardian_name = "Guardian name is required.";
        }
        if (!formData.guardian_email.trim()) {
          clientErrors.guardian_email = "Guardian email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardian_email.trim())) {
          clientErrors.guardian_email = "Enter a valid guardian email address.";
        }
        if (!formData.guardian_phone.trim()) {
          clientErrors.guardian_phone = "Guardian phone number is required.";
        } else {
          const norm = formData.guardian_phone.trim().replace(/^\+94\s*/, "0").replace(/[ -]/g, "");
          if (!/^0[1-9]\d{8}$/.test(norm) && !/^\+?[1-9]\d{7,14}$/.test(norm)) {
            clientErrors.guardian_phone = "Enter a valid guardian phone number (e.g. 077 123 4567).";
          }
        }
      }
    }

    if (!formData.privacy_acknowledged) {
      clientErrors.privacy_acknowledged = "You must read and acknowledge the privacy notice.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setGeneralError("Please complete the required fields highlighted below.");
      const firstErrorField = Object.keys(clientErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Delay check: backend requires at least 1500ms since token challenge was issued
    const elapsed = Date.now() - tokenTime;
    if (elapsed < 1600) {
      await new Promise((resolve) => setTimeout(resolve, 1600 - elapsed));
    }

    setIsSubmitting(true);

    try {
      const activeKey = /^[a-f0-9-]{36}$/.test(idempotencyKey)
        ? idempotencyKey
        : generateUUID();

      const selectedCourse =
        config.courses.find((c) => c.id === formData.current_level)?.id ||
        config.courses[0]?.id ||
        "N5";

      const payload = {
        full_name: formData.full_name.trim(),
        preferred_name: formData.preferred_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address_line1: formData.address_line1.trim(),
        address_line2: formData.address_line2.trim(),
        address_city: formData.address_city.trim(),
        course_id: selectedCourse,
        current_level: formData.current_level,
        category: formData.category,
        intake_id: isVisa ? formData.intake_id : "",
        guardian_name: isKids ? formData.guardian_name.trim() : "",
        guardian_email: isKids ? formData.guardian_email.trim() : "",
        guardian_phone: isKids ? formData.guardian_phone.trim() : "",
        contact_recipient: isKids ? formData.contact_recipient : "",
        message: formData.message.trim(),
        privacy_acknowledged: !!formData.privacy_acknowledged,
        promotional_consent: !!formData.promotional_consent,
        formToken: config.formToken,
        website: formData.website,
      };

      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": activeKey,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.fields && typeof result.fields === "object") {
          setFieldErrors(result.fields);
          const firstKey = Object.keys(result.fields)[0];
          const elem = document.getElementsByName(firstKey)[0];
          if (elem) elem.focus();
          const detailMessages = Object.entries(result.fields)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" | ");
          if (detailMessages) {
            setGeneralError(`Please correct: ${detailMessages}`);
          }
        }
        throw new Error(result.error || "Unable to submit your registration.");
      }

      const courseObj = config.courses.find((c) => c.id === formData.course_id);
      const categoryObj = config.categories.find((c) => c.id === formData.category);
      const intakeObj = config.intakes.find((i) => i.id === formData.intake_id);

      setSubmittedData({
        reference: result.reference || "TOM-REGISTRATION-CONFIRMED",
        id: result.id || "",
        fullName: formData.full_name.trim(),
        email: formData.email.trim() || formData.guardian_email.trim(),
        courseName: courseObj?.name || formData.course_id,
        categoryName: categoryObj?.name || formData.category,
        intakeName: intakeObj?.name || "Immediate / Regular Batch",
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setGeneralError(
        err instanceof Error
          ? err.message
          : "Unable to connect. Your details are still here; please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFieldErrors({});
    setGeneralError("");
    fetchConfig();
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 lg:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-foreground">Student Registration</span>
      </nav>

      {/* Header Banner */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          Student Registration
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Choose one registration category and one course. Each student and contact email can register once. Our admissions team will review your application and confirm enrollment.
        </p>
      </div>

      {/* Loading Skeleton */}
      {loadingConfig && (
        <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-sm space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-foreground">Loading study options & intakes...</p>
        </div>
      )}

      {/* Config Error Banner */}
      {configError && !loadingConfig && (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/10 p-8 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="font-serif text-xl font-bold text-foreground">Unable to Load Options</h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">{configError}</p>
          <button
            onClick={() => fetchConfig()}
            className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success State */}
      {submittedData && !loadingConfig && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-lg space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto border border-green-500/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Registration Successfully Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Thank you. Your registration has been saved to the TOMONI student registry. Keep your application reference number for all future correspondence.
            </p>
          </div>

          {/* Reference Pill */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-1.5 max-w-md mx-auto">
            <div className="text-xs font-bold text-primary">
              Application Reference Number
            </div>
            <div className="font-sans text-xl sm:text-2xl font-bold text-foreground select-all">
              {submittedData.reference}
            </div>
            <div className="text-[11px] text-muted-foreground">
              A confirmation email has been prepared for {submittedData.email}
            </div>
          </div>

          {/* Details Summary Table */}
          <div className="rounded-2xl border border-border bg-background p-6 max-w-lg mx-auto space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-semibold text-foreground">{submittedData.fullName}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Registration Category:</span>
              <span className="font-semibold text-foreground">{submittedData.categoryName}</span>
            </div>
            {isVisa && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Visa Intake:</span>
                <span className="font-semibold text-foreground">{submittedData.intakeName}</span>
              </div>
            )}
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Admissions Office:</span>
              <span className="font-semibold text-foreground">Kuliyapitiya Institute</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-2.5 text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              <Printer className="h-4 w-4 text-primary" />
              <span>Print Confirmation</span>
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Register Another Student</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      {!submittedData && !loadingConfig && config && (
        <form onSubmit={handleSubmit} noValidate className="space-y-8 animate-fade-in">
          {/* General Error Banner */}
          {generalError && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 flex items-center gap-3 text-xs sm:text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Card 1: Student Personal Details */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  Student Personal & Contact Information
                </h2>
                <p className="text-xs text-muted-foreground">
                  Provide identification and contact details for official registration records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex justify-between">
                  <span>
                    Full Name <span className="text-primary">*</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground">As on National ID or Passport</span>
                </label>
                <input
                  type="text"
                  name="full_name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Kasun Chamara Fernando"
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.full_name
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                />
                {fieldErrors.full_name && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Preferred Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Preferred Name <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="preferred_name"
                  maxLength={120}
                  autoComplete="nickname"
                  value={formData.preferred_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Kasun"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Student Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Student Email Address {!isGuardianRecipient && <span className="text-primary">*</span>}
                  {isGuardianRecipient && <span className="text-muted-foreground font-normal"> (optional for kids)</span>}
                </label>
                <input
                  type="email"
                  name="email"
                  required={!isGuardianRecipient}
                  maxLength={254}
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. student@example.com"
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.email
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              {/* Student Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Student Phone / WhatsApp {!isGuardianRecipient && <span className="text-primary">*</span>}
                  {isGuardianRecipient && <span className="text-muted-foreground font-normal"> (optional for kids)</span>}
                </label>
                <input
                  type="tel"
                  name="phone"
                  required={!isGuardianRecipient}
                  maxLength={20}
                  autoComplete="tel"
                  placeholder="077 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.phone
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.phone}</p>
                )}
              </div>

              {/* City / Town */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  City / Town <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  name="address_city"
                  required
                  maxLength={500}
                  autoComplete="address-level2"
                  value={formData.address_city}
                  onChange={handleInputChange}
                  placeholder="e.g. Colombo, Kandy, Galle"
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.address_city
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                />
                {fieldErrors.address_city && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.address_city}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Address Line 1 , House number / name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  name="address_line1"
                  required
                  maxLength={500}
                  autoComplete="address-line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  placeholder="e.g. No. 42 / Temple Road"
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.address_line1
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                />
                {fieldErrors.address_line1 && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.address_line1}</p>
                )}
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Address Line 2 , Street / village <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="address_line2"
                  maxLength={500}
                  autoComplete="address-line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  placeholder="e.g. Bambalapitiya"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Course & Program Selection */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  Program Category & Academic Level
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select your desired registration category, current language proficiency, and target intake.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Registration Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Registration Category <span className="text-primary">*</span>
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.category
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                >
                  <option value="">Choose a registration category</option>
                  {config.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.category}</p>
                )}
              </div>

              {/* Current Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Current Japanese Level <span className="text-primary">*</span>
                </label>
                <select
                  name="current_level"
                  required
                  value={formData.current_level}
                  onChange={handleInputChange}
                  className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                    fieldErrors.current_level
                      ? "border-destructive focus:border-destructive"
                      : "border-border focus:border-primary"
                  }`}
                >
                  <option value="Beginner / No experience">Beginner / No experience</option>
                  <option value="N5">JLPT N5 (Basic)</option>
                  <option value="N4">JLPT N4 (Elementary)</option>
                  <option value="N3">JLPT N3 (Intermediate)</option>
                  <option value="N2">JLPT N2 (Pre-Advanced)</option>
                  <option value="N1">JLPT N1 (Advanced)</option>
                </select>
                {fieldErrors.current_level && (
                  <p className="text-[11px] font-medium text-destructive">{fieldErrors.current_level}</p>
                )}
              </div>

              {/* Visa Intake (Conditional) */}
              {isVisa && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-semibold text-foreground">
                    Visa Intake Year & Month <span className="text-primary">*</span>
                  </label>
                  <select
                    name="intake_id"
                    required={isVisa}
                    value={formData.intake_id}
                    onChange={handleInputChange}
                    className={`w-full rounded-2xl border bg-background px-4 py-3 text-xs sm:text-sm transition-colors focus:outline-none ${
                      fieldErrors.intake_id
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    }`}
                  >
                    <option value="">Choose an intake</option>
                    {config.intakes.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.intake_id && (
                    <p className="text-[11px] font-medium text-destructive">{fieldErrors.intake_id}</p>
                  )}
                </div>
              )}
            </div>

            {/* Visa note */}
            {isVisa && (
              <div className="rounded-2xl bg-primary/5 border border-primary/20 p-4 text-xs text-primary leading-relaxed flex items-center gap-2.5">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  Choose your preferred visa intake. Our team will verify document submission deadlines and Certificate of Eligibility (COE) requirements.
                </span>
              </div>
            )}
          </div>

          {/* Card 3: Guardian Details (Conditionally active for Kids Category) */}
          {isKids && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 pb-3 border-b border-border">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                    Guardian Contact Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Student contact details are entered above. Choose who should receive institute communications.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    Preferred Contact Recipient <span className="text-primary">*</span>
                  </label>
                  <select
                    name="contact_recipient"
                    required={isKids}
                    value={formData.contact_recipient}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="">Choose recipient</option>
                    <option value="student">Student</option>
                    <option value="guardian">Guardian</option>
                  </select>
                  {fieldErrors.contact_recipient && (
                    <p className="text-[11px] font-medium text-destructive">
                      {fieldErrors.contact_recipient}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Guardian Name {isGuardianRecipient && <span className="text-primary">*</span>}
                  </label>
                  <input
                    type="text"
                    name="guardian_name"
                    required={isGuardianRecipient}
                    maxLength={120}
                    value={formData.guardian_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Priyantha Fernando"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                  {fieldErrors.guardian_name && (
                    <p className="text-[11px] font-medium text-destructive">{fieldErrors.guardian_name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Guardian Email {isGuardianRecipient && <span className="text-primary">*</span>}
                  </label>
                  <input
                    type="email"
                    name="guardian_email"
                    required={isGuardianRecipient}
                    maxLength={254}
                    value={formData.guardian_email}
                    onChange={handleInputChange}
                    placeholder="e.g. parent@example.com"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                  {fieldErrors.guardian_email && (
                    <p className="text-[11px] font-medium text-destructive">{fieldErrors.guardian_email}</p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">
                    Guardian Phone Number {isGuardianRecipient && <span className="text-primary">*</span>}
                  </label>
                  <input
                    type="tel"
                    name="guardian_phone"
                    required={isGuardianRecipient}
                    maxLength={20}
                    placeholder="077 123 4567"
                    value={formData.guardian_phone}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                  {fieldErrors.guardian_phone && (
                    <p className="text-[11px] font-medium text-destructive">{fieldErrors.guardian_phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Additional Study Goals & Privacy Consent */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {isKids ? 4 : 3}
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  Study Goals & Privacy Consent
                </h3>
                <p className="text-xs text-muted-foreground">
                  Acknowledge our registration policy and share any specific academic goals.
                </p>
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Additional Message <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                name="message"
                rows={3}
                maxLength={2000}
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Your study goals, questions about visa intakes, or university preferences..."
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Institute Privacy Notice Box */}
            <div className="rounded-2xl border border-border bg-muted/40 p-5 space-y-2 text-xs leading-relaxed">
              <strong className="text-foreground block font-semibold">
                Privacy Notice & Admissions Terms
              </strong>
              <p className="text-muted-foreground">
                {config.institute?.privacyText ||
                  "Tomoni Japanese Language Institute collects student information solely for enrollment processing, examination registry, and visa advisory purposes. Your data will never be sold or shared with unauthorized third parties."}
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacy_acknowledged"
                  required
                  checked={formData.privacy_acknowledged}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-xs text-foreground leading-tight">
                  I have read and acknowledge the admissions privacy notice. <span className="text-primary">*</span>
                </span>
              </label>
              {fieldErrors.privacy_acknowledged && (
                <p className="text-[11px] font-medium text-destructive ml-7">
                  {fieldErrors.privacy_acknowledged}
                </p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="promotional_consent"
                  checked={formData.promotional_consent}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-xs text-muted-foreground leading-tight">
                  I would like to receive promotional news, scholarship updates, and intake announcements from Tomoni. <span className="text-muted-foreground font-normal">(optional; unsubscribe anytime)</span>
                </span>
              </label>
            </div>

            {/* Anti-spam trap input (Honeypot) */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website:
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {/* Submit section */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-muted-foreground text-center sm:text-left">
                Submitting this form registers your interest. Enrollment is confirmed separately by the institute admissions office.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Submitting Registration.</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-muted/30 via-background to-background">
        <RegistrationFormInner />

        <ReadyCtaBanner />
      </main>

      <Footer />
    </div>
  );
}
