"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCourse?: string;
  initialCourseId?: string;
  availableCourses?: Array<{ id: string; name: string }>;
  availableIntakes?: Array<{ id: string; name: string }>;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  defaultCourse = "general",
  initialCourseId,
  availableCourses,
  availableIntakes,
}: ApplicationModalProps) {
  const effectiveCourse = initialCourseId || defaultCourse;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    course: effectiveCourse,
    category: effectiveCourse,
    intake: "2027-04",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    addressLine: "",
    nationality: "Sri Lankan",
    priorStudy: "Beginner / No experience",
    goalInJapan: "Higher Education",
    notes: "",
  });

  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [formToken, setFormToken] = useState("");
  const [tokenTime, setTokenTime] = useState(0);
  const [submissionReference, setSubmissionReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (effectiveCourse) {
      setFormData((prev) => ({
        ...prev,
        course: effectiveCourse,
        category: effectiveCourse,
      }));
    }
  }, [effectiveCourse]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    fetch("/api/public/config")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.formToken) {
          setFormToken(data.formToken);
          setTokenTime(Date.now());
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    setErrorMessage("");
    if (step === 2) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setErrorMessage("Please complete all required fields (Full name, Email, Phone number).");
        return;
      }
      if (!formData.email.includes("@")) {
        setErrorMessage("Please provide a valid email address.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!privacyAccepted) {
      setErrorMessage("Please acknowledge the admissions notice to proceed.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        course_id: formData.course,
        category: formData.course === "visa" ? "visa" : (formData.course === "kids" ? "kids" : "general"),
        intake_id: formData.course === "visa" ? formData.intake : "",
        current_level: formData.priorStudy || "Beginner / No experience",
        full_name: formData.fullName.trim(),
        preferred_name: formData.fullName.trim().split(" ")[0] || formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address_line1: formData.addressLine.trim() || formData.city.trim() || "Kuliyapitiya Institute",
        address_city: formData.city.trim() || "Kuliyapitiya",
        guardian_name: formData.course === "kids" ? formData.fullName : "",
        guardian_email: formData.course === "kids" ? formData.email : "",
        guardian_phone: formData.course === "kids" ? formData.phone : "",
        contact_recipient: "student",
        experience_summary: `${formData.priorStudy} • Goal: ${formData.goalInJapan}`,
        target_goal: formData.goalInJapan,
        notes: formData.notes.trim(),
        privacy_acknowledged: true,
        privacy_policy_agreed: true,
        terms_agreed: true,
        newsletter_subscribed: false,
        website_reference: "tomoni-web-application",
        form_token: formToken,
        token_time: tokenTime || Date.now(),
      };

      const res = await fetch("/api/public/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
        setSubmissionReference(data.referenceNumber || data.enrollmentId || "TOM-2026-CONFIRMED");
      } else {
        setErrorMessage(data.error || "Submission could not be completed. Please try again.");
      }
    } catch {
      setErrorMessage("Network error occurred while submitting your application. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setSubmissionReference("");
    setErrorMessage("");
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/80 transition-opacity"
        onClick={handleResetAndClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-lg border border-border-light p-6 sm:p-8 overflow-hidden z-10 animate-fade-in my-8">
          
          {/* Close Button */}
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 text-stone-dark hover:text-navy hover:bg-cream rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-red mb-1">
                  <span>Admissions 2026</span>
                </div>
                <h3 className="font-serif-heading text-2xl font-semibold text-navy">
                  Tomoni Institute Enrollment
                </h3>
                <p className="text-xs text-stone-dark mt-1">
                  Stage {step} of 3: {step === 1 ? "Program Selection" : step === 2 ? "Applicant Details" : "Study Aspirations"}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-cream-warm h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-red h-full rounded-full transition-colors duration-300"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Step 1: Course and Intake Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1.5">
                        Select Course / Registration Track *
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) =>
                          setFormData({ ...formData, course: e.target.value, category: e.target.value })
                        }
                        className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                      >
                        {(availableCourses?.length
                          ? availableCourses
                          : [
                              { id: "visa", name: "Japanese Visa + Class (Study in Japan Pathway)" },
                              { id: "general", name: "General Class (Practical Japanese for Adults)" },
                              { id: "jft", name: "JFT Class (Japan Foundation Test / SSW Worker)" },
                              { id: "ol", name: "O/L Class (Sri Lankan Ordinary Level Support)" },
                              { id: "al", name: "A/L Class (Sri Lankan Advanced Level Support)" },
                              { id: "kids", name: "Kids Class (Japanese for Young Learners)" },
                            ]
                        ).map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.category === "visa" && (
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1.5">
                          Target Visa Intake Term in Japan *
                        </label>
                        <select
                          value={formData.intake}
                          onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                          className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                        >
                          {(availableIntakes?.length
                            ? availableIntakes
                            : [
                                { id: "2027-04", name: "April 2027 (Spring Primary Intake)" },
                                { id: "2027-06", name: "June 2027 (Summer Intake)" },
                                { id: "2027-10", name: "October 2027 (Autumn Intake)" },
                              ]
                          ).map((intake) => (
                            <option key={intake.id} value={intake.id}>
                              {intake.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1.5">
                        Current Japanese Proficiency Level
                      </label>
                      <select
                        value={formData.priorStudy}
                        onChange={(e) => setFormData({ ...formData, priorStudy: e.target.value })}
                        className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                      >
                        <option value="Beginner / No experience">Complete Beginner (No prior Japanese)</option>
                        <option value="Hiragana & Katakana">Know Hiragana & Katakana scripts</option>
                        <option value="JLPT N5 or equivalent">Elementary (JLPT N5 level / School O/L)</option>
                        <option value="JLPT N4 or higher">Intermediate (JLPT N4 / A/L level)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Details */}
                {step === 2 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="As shown on NIC or Passport"
                        className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Phone / WhatsApp Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="077 123 4567 or +94..."
                          className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Town / City in Sri Lanka *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Colombo, Kandy, Gampaha"
                          className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-red font-medium">{errorMessage}</p>
                    )}
                  </div>
                )}

                {/* Step 3: Aspirations & Notes */}
                {step === 3 && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        Primary Aspiration in Japan *
                      </label>
                      <select
                        value={formData.goalInJapan}
                        onChange={(e) => setFormData({ ...formData, goalInJapan: e.target.value })}
                        className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                      >
                        <option value="Higher Education">Enter Japanese University or Graduate School</option>
                        <option value="Vocational College">Specialized Vocational College (Senmon Gakko)</option>
                        <option value="Sri Lankan School Exam">Excel at Sri Lankan G.C.E. O/L or A/L Japanese</option>
                        <option value="Employment in Japan">Career & Professional Employment in Japan</option>
                        <option value="Personal Fluency">Everyday Spoken Communication & Cultural Enrichment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">
                        Additional Notes or Specific Inquiries
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="                        Tell us about your school grade, target intake year, or questions regarding our Kuliyapitiya institute..."
                        className="w-full p-3 bg-cream border border-border-light rounded-2xl text-xs text-navy focus:outline-none focus:border-red transition-colors"
                      />
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        id="privacy_agree"
                        type="checkbox"
                        required
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded-full border-border text-red focus:ring-red"
                      />
                      <label htmlFor="privacy_agree" className="text-xs text-stone-dark leading-relaxed cursor-pointer select-none">
                        I agree to receive official academic communications and course schedules from Tomoni Japanese Language Institute.
                      </label>
                    </div>

                    {errorMessage && (
                      <p className="text-xs text-red font-medium">{errorMessage}</p>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border-light">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-navy hover:bg-cream rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-red hover:bg-red-hover text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-colors ml-auto"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-7 py-2.5 bg-red hover:bg-red-hover text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-colors disabled:opacity-50 ml-auto"
                    >
                      <span>{isSubmitting ? "Transmitting..." : "Submit Application"}</span>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </form>
            </div>
          ) : (
            /* Submission Confirmation */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-red-soft border border-red-border text-red flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-serif-heading text-2xl font-semibold text-navy mb-2">
                Application Received
              </h3>
              <p className="text-xs sm:text-sm text-stone-dark max-w-md mx-auto mb-5 leading-relaxed">
                Thank you, <span className="font-semibold text-navy">{formData.fullName}</span>. We have received your application for <span className="font-semibold text-red">{formData.course}</span>.
                Our Kuliyapitiya admissions team will contact you at <span className="font-semibold text-navy">{formData.email}</span>.
              </p>

              {/* Reference */}
              <div className="my-5 p-4 bg-cream border border-border-light rounded-2xl text-center">
                <span className="block text-[10px] font-semibold text-stone mb-1">
                  Official Application Reference
                </span>
                <span className="font-sans text-base font-bold text-red select-all">
                  {submissionReference || "TOM-2026-CONFIRMED"}
                </span>
                <span className="block text-[11px] text-stone mt-1">
                  Please retain this reference for your orientation consultation.
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-navy hover:bg-red text-white text-xs font-semibold rounded-full transition-colors shadow-sm"
              >
                Close & Return
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}