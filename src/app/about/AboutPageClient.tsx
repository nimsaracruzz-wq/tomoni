"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplicationModal from "@/components/ApplicationModal";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import {
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export default function AboutPage() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const pillars = [
    {
      icon: Award,
      title: "Academic Excellence",
      desc: "Systematic, curriculum-driven Japanese training focused on both examination success (JLPT / NAT-TEST) and natural conversational fluency.",
    },
    {
      icon: ShieldCheck,
      title: "Ethical Visa Guidance",
      desc: "Transparent, legal, and thorough documentation. We maintain one of the highest Certificate of Eligibility (COE) acceptance rates in Sri Lanka.",
    },
    {
      icon: HeartHandshake,
      title: "The TOMONI Spirit",
      desc: "Tomoni means 'Together' in Japanese. We don't just teach classes; we walk beside each student every step of the journey from Colombo to Japan.",
    },
    {
      icon: Building2,
      title: "Direct Japan Partnerships",
      desc: "Official institutional partnerships with reputable language academies, vocational colleges (Senmon Gakko), and universities across Japan.",
    },
  ];

  const facultyMembers = [
    {
      name: "Thinuka Sensei",
      fullName: "Thinuka Dhahamneth",
      role: "Founder & Japan Coordinator",
      desc: "Coordinates TOMONI support and communication in Japan for students preparing for their next step.",
      image: "/images/thinuka_sensei.jpg",
    },
    {
      name: "Muditha Sensei",
      fullName: "Muditha Anuragi",
      role: "Japanese Language Teacher",
      desc: "Teaches JLPT N5 to N4 and JFT preparation for students building a foundation in Japanese.",
      image: "/images/muditha_sensei.jpg",
    },
  ];

  const milestones = [
    {
      metric: "1,200+",
      label: "Students Guided to Japan",
      detail: "Graduates enrolled in top schools, colleges, and careers across Japan.",
    },
    {
      metric: "98.4%",
      label: "Visa Success Rate",
      detail: "Flawless compliance with Japanese Immigration Bureau criteria.",
    },
    {
      metric: "15+",
      label: "Japanese Partner Schools",
      detail: "Accredited institutions located in Tokyo, Osaka, Kyoto, and Fukuoka.",
    },
    {
      metric: "100%",
      label: "English-Speaking Guidance",
      detail: "Crystal-clear consultations and assistance for Sri Lankan applicants and parents.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header onOpenApply={() => setIsApplyModalOpen(true)} />

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
              <span className="font-semibold text-foreground">About Us</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Japanese Language Learning for Your Next Chapter.
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                  TOMONI Japanese Language Institute helps students in Kuliyapitiya build practical Japanese skills through JLPT N5/N4, O/L, A/L, Kids, and Student Visa programs.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setIsApplyModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 hover:shadow-lg"
                  >
                    <span>Book Free Consultation</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <span>View Our Courses</span>
                  </Link>
                </div>
              </div>

              {/* Hero Image Collage */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto aspect-4/5 max-w-md overflow-hidden rounded-3xl shadow-lg border border-border">
                  <Image
                    src="/assets/classroom.jpg"
                    alt="TOMONI Japanese Language Classroom"
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
                      Interactive Classrooms Designed for Accelerated Learning
                    </p>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-5 -left-5 hidden sm:flex items-center gap-3 rounded-2xl bg-card p-4 shadow-lg border border-border max-w-xs">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      100% Comprehensive
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Language + Visa + University Guidance
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Numbers */}
        <section className="border-y border-border bg-card py-12">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {milestones.map((m, i) => (
                <div key={i} className="space-y-1 p-2">
                  <div className="font-serif text-3xl sm:text-4xl font-bold text-primary">
                    {m.metric}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-foreground">
                    {m.label}
                  </div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                    {m.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story and Mission */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 relative order-2 lg:order-1">
                <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-lg border border-border">
                  <Image
                    src="/assets/tokyo.jpg"
                    alt="Tokyo Japan Cityscape"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-sm border border-border">
                    <Image
                      src="/assets/temple.jpg"
                      alt="Traditional Japan Temple"
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-sm border border-border">
                    <Image
                      src="/assets/street.jpg"
                      alt="Modern Japanese street"
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  Why &quot;TOMONI&quot; Matters to Every Student
                </h2>
                <div className="space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <p>
                    Studying in a foreign country can be intimidating. Japanese is a rich language with unique grammatical nuances, three scripts, and cultural customs that require attentive guidance.
                  </p>
                  <p>
                    In Japanese, <strong>TOMONI</strong> translates to <em>&quot;Together&quot;</em>. That is the core philosophy underpinning everything we do at our Kuliyapitiya institute. We do not treat candidates as numbers or cases; we stand alongside them as mentors, teachers, and guides.
                  </p>
                  <p>
                    From the very first day you learn basic syllables to passing your JLPT examination, assembling your Japanese Statement of Purpose, securing your Certificate of Eligibility (COE), and stepping onto Japanese soil, our team is there to ensure your transition is smooth and successful.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Our Mission
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      To empower Sri Lankan youth through high-caliber Japanese language mastery, honest visa consulting, and direct access to Japan&apos;s leading educational institutions.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Our Vision
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      To be South Asia&apos;s most reputable, transparent, and student-centered gateway to academic and career opportunities in Japan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Excellence */}
        <section className="py-16 bg-muted/30 border-y border-border">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Built Around Student Success
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Here is why hundreds of Sri Lankan students and their families trust TOMONI for their Japanese education.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={index}
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Faculty & Team Showcase */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Meet the People Behind TOMONI
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Our institute is led by a team that supports students in Sri Lanka and Japan.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              {facultyMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="relative aspect-4/3 overflow-hidden border-b border-border bg-muted">
                    <Image
                      src={member.image}
                      alt={`${member.name} at TOMONI Japanese Language Institute`}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-foreground">
                        {member.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{member.fullName}</p>
                      <div className="text-xs font-semibold text-primary">
                        {member.role}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                        {member.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Campus Facilities */}
        <section className="py-16 bg-muted/20 border-t border-border">
          <div className="mx-auto max-w-6xl px-5">
            <div className="rounded-3xl bg-card border border-border p-8 sm:p-12 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                    Study in an Environment Tailored for Concentration
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Conveniently located in Kuliyapitiya, our institute offers comfortable classrooms, dedicated listening practice for JLPT exams, and authentic Japanese learning materials.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs sm:text-sm text-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Audio-equipped exam listening booths</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Quiet self-study rooms and resource library</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>One-on-one visa counseling and interview rooms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Conveniently located on Hettipola Road, Kuliyapitiya</span>
                    </li>
                  </ul>
                </div>

                <div className="relative aspect-video sm:aspect-4/3 rounded-2xl overflow-hidden border border-border shadow-md">
                  <Image
                    src="/assets/hero.jpg"
                    alt="TOMONI Study Space"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
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
        initialCourseId="general"
      />
    </div>
  );
}
