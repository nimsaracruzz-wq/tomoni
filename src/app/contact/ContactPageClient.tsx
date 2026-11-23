"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import ApplicationModal from "@/components/ApplicationModal";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Train,
} from "lucide-react";

export default function ContactPage() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    courseId: "visa",
    mode: "physical",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/public/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          courseId: formData.courseId,
          preferredMode: formData.mode,
          notes: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit message. Please try again or WhatsApp us directly.");
      }

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        courseId: "visa",
        mode: "physical",
        message: "",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Something went wrong. Please reach out to our team directly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactDetails = [
    {
      icon: MapPin,
      title: "Kuliyapitiya Institute",
      primary: "No. 355 A 1/1 Hettipola Road",
      secondary: "Kuliyapitiya, Sri Lanka",
      hint: "Visit us for Japanese classes and student visa guidance",
    },
    {
      icon: Phone,
      title: "Sri Lanka Contact",
      primary: "071 491 9354",
      secondary: "070 270 7624 (WhatsApp)",
      hint: "Call or message our Kuliyapitiya office",
    },
    {
      icon: Phone,
      title: "Japan Direct Contact",
      primary: "+81 90-3841-0745",
      secondary: "WhatsApp & Direct Call",
      hint: "Direct line for Japan inquiries & visa advisory",
    },
    {
      icon: Mail,
      title: "Email Inquiries",
      primary: "tomoniinstitute@gmail.com",
      secondary: "tomoniedu.com",
      hint: "Email us or visit our website",
    },
    {
      icon: Clock,
      title: "Operating Hours",
      primary: "Monday – Saturday: 8:30 AM – 6:00 PM",
      secondary: "Sunday: 9:00 AM – 4:00 PM",
      hint: "Open for weekend classes & counseling",
    },
  ];

  const faqs = [
    {
      q: "Do I need to make an appointment before visiting the institute?",
      a: "Contact us before visiting so our team can arrange the right course or student visa guidance for you.",
    },
    {
      q: "What documents should I bring for a free visa consultation?",
      a: "Please bring copies of your O/Level and A/Level result sheets, your National Identity Card (NIC) or passport, and any existing Japanese certificates or transcripts if applicable.",
    },
    {
      q: "Are weekend and evening batches available for working professionals?",
      a: "Yes! We run dedicated evening weekday cohorts (6:00 PM to 8:30 PM) as well as full-day Saturday and Sunday batches specifically tailored for students and working professionals.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header
        onOpenConsultation={() => setIsApplyModalOpen(true)}
        onOpenApply={() => setIsApplyModalOpen(true)}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 via-background to-background pt-8 pb-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-foreground">Contact</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Get in Touch with Our Japanese Education Team.
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  Have questions about JLPT N5/N4, O/L and A/L classes, Kids Japanese, or student visas? Contact our friendly advisors or visit our Kuliyapitiya institute for guidance.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://wa.me/819038410745"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors"
                  >
                    <span>WhatsApp Japan: +81 90-3841-0745</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a
                    href="https://wa.me/94702707624"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors"
                  >
                    <span>WhatsApp SL: 070 270 7624</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                  <a
                    href="tel:+819038410745"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Call Japan (+81 90-3841-0745)</span>
                  </a>
                  <a
                    href="tel:+94714919354"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Call SL (071 491 9354)</span>
                  </a>
                </div>
              </div>

              {/* Center Photo Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-lg border border-border">
                  <Image
                    src="/assets/classroom.jpg"
                    alt="TOMONI Japanese Language Institute in Kuliyapitiya"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    <p className="text-xs font-semibold text-white/80">
                      Kuliyapitiya Institute
                    </p>
                    <p className="font-serif text-lg font-bold">
                      Open for Japanese language classes and student visa guidance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 bg-card border-y border-border">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactDetails.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-3xl border border-border bg-background p-6 shadow-sm hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <div className="text-xs font-semibold text-foreground">
                        {item.primary}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.secondary}
                      </div>
                    </div>
                    <div className="text-[11px] text-primary font-medium pt-2 border-t border-border/80">
                      {item.hint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Form and Map / Guidance Section */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Consultation Inquiry Form */}
              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                      Send Us a Message
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Fill out the form below and an educational consultant will reach out to you within 24 hours.
                    </p>
                  </div>

                  {isSubmitted ? (
                    <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-6 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="font-serif text-lg font-bold text-foreground">
                        Thank You! Your Inquiry Has Been Received.
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Our student advisory team will review your details and contact you via phone or WhatsApp shortly.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="rounded-full bg-primary px-6 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {errorMessage && (
                        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                          {errorMessage}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Full Name <span className="text-primary">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. Kasun Fernando"
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Phone / WhatsApp <span className="text-primary">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="e.g. 077 123 4567"
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Email Address <span className="text-primary">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="e.g. kasun@example.com"
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Program of Interest
                          </label>
                          <select
                            value={formData.courseId}
                            onChange={(e) =>
                              setFormData({ ...formData, courseId: e.target.value })
                            }
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                          >
                            <option value="visa">Japanese Visa + Class (Higher Education)</option>
                            <option value="general">General Japanese Class</option>
                            <option value="school">School Japanese (O/L & A/L)</option>
                            <option value="kids">Kids Japanese</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Preferred Study Mode
                          </label>
                          <select
                            value={formData.mode}
                            onChange={(e) =>
                              setFormData({ ...formData, mode: e.target.value })
                            }
                            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors"
                          >
                            <option value="physical">Physical Classes in Kuliyapitiya</option>
                            <option value="online">Live Interactive Online</option>
                            <option value="flexible">Flexible / Either</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Your Questions or Inquiries
                        </label>
                        <textarea
                          rows={4}
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          placeholder="Tell us about your educational background or any questions about Japan intake periods..."
                          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-xs sm:text-sm focus:border-primary focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-full bg-primary py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <span>Sending Inquiry.</span>
                        ) : (
                          <>
                            <span>Send Message</span>
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Campus Location & Getting Here */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Train className="h-5 w-5" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Visit Our Kuliyapitiya Institute
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <p>
                      <strong>Address:</strong> No. 355 A 1/1 Hettipola Road, Kuliyapitiya.
                    </p>
                    <p>
                      <strong>Sri Lanka:</strong> 071 491 9354 or 070 270 7624 (WhatsApp)
                    </p>
                    <p>
                      <strong>Japan:</strong> +81 90-3841-0745 (Call & WhatsApp)
                    </p>
                    <p>
                      <strong>Website:</strong> tomoniedu.com
                    </p>
                  </div>
                </div>

                {/* FAQ Highlights */}
                <div className="rounded-3xl border border-border bg-muted/40 p-6 sm:p-8 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {faqs.map((faq, i) => (
                      <div key={i} className="space-y-1">
                        <div className="font-semibold text-xs sm:text-sm text-foreground">
                          {faq.q}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ready CTA Banner */}
        <ReadyCtaBanner onContactClick={() => setIsApplyModalOpen(true)} />
      </main>

      <Footer />

      {/* Application / Consultation Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        initialCourseId="visa"
      />
    </div>
  );
}
