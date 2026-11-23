import React from "react";
import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME, CONTACT_INFO } from "./seo";

export function JsonLd({ data }: { data: Record<string, any> | Array<Record<string, any>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function getEducationalOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/hero.jpg`,
    image: `${SITE_URL}/assets/hero.jpg`,
    description:
      "Tomoni Japanese Language Center provides JLPT N5, N4, N3 preparation, JFT-Basic training, School O/L & A/L Japanese, and ethical Study in Japan student visa guidance in Sri Lanka.",
    telephone: CONTACT_INFO.phones[0].tel,
    email: CONTACT_INFO.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT_INFO.address.streetAddress,
      addressLocality: CONTACT_INFO.address.addressLocality,
      addressRegion: CONTACT_INFO.address.addressRegion,
      postalCode: CONTACT_INFO.address.postalCode,
      addressCountry: CONTACT_INFO.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CONTACT_INFO.geo.latitude,
      longitude: CONTACT_INFO.geo.longitude,
    },
    sameAs: CONTACT_INFO.socials,
    areaServed: {
      "@type": "Country",
      name: "Sri Lanka",
    },
    knowsLanguage: ["en", "ja", "si"],
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en-LK",
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export interface FAQItem {
  q: string;
  a: string;
}

export function getFAQPageSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export interface CourseSchemaParams {
  name: string;
  description: string;
  slug: string;
  duration?: string;
  educationalLevel?: string;
}

export function getCourseSchema({
  name,
  description,
  slug,
  duration = "P6M",
  educationalLevel = "Beginner to Intermediate",
}: CourseSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    url: `${SITE_URL}/courses/${slug}`,
    educationalLevel,
    timeRequired: duration,
    inLanguage: "ja",
    availableLanguage: ["en", "si"],
  };
}

export interface ArticleSchemaParams {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  imageUrl?: string;
}

export function getArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  authorName = "Tomoni Academic Faculty",
  imageUrl = `${SITE_URL}/assets/hero.jpg`,
}: ArticleSchemaParams) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}/blog/${slug}`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/hero.jpg`,
      },
    },
    image: imageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
    inLanguage: "en-LK",
  };
}
