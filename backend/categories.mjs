export const CATEGORIES = [
  { id: "visa", name: "Japanese Visa + Class", code: null },
  { id: "general", name: "General Class", code: "GN" },
  { id: "jft", name: "JFT Class", code: "JF" },
  { id: "ol", name: "O/L Class", code: "OL" },
  { id: "al", name: "A/L Class", code: "AL" },
  { id: "kids", name: "Kids Class", code: "KD" },
];
export const categoryName = (value) =>
  CATEGORIES.find((c) => c.id === value)?.name || value || "Not recorded";
export const contactEmail = (record) =>
  (record.registration_category || record.category) === "kids" &&
  record.contact_recipient === "guardian"
    ? record.guardian_email
    : record.email;
export const contactPhone = (record) =>
  (record.registration_category || record.category) === "kids" &&
  record.contact_recipient === "guardian"
    ? record.guardian_phone
    : record.phone;
