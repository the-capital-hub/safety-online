export const NAME_MAX_LENGTH = 50;
export const EMAIL_MAX_LENGTH = 254;
export const MOBILE_MAX_LENGTH = 10;
export const GSTIN_LENGTH = 15;
export const BIO_MAX_LENGTH = 500;
export const VERIFICATION_CODE_LENGTH = 6;
export const STREET_MAX_LENGTH = 80;

export const STREET_ALLOWED_CHARACTERS_DESCRIPTION =
  "letters, numbers, spaces, commas, periods, apostrophes, hyphens, slashes, ampersands, parentheses, and #";

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]{0,49}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const STREET_REGEX = /^[A-Za-z0-9\s,.'#\/&()-]+$/;
const STREET_SANITIZE_REGEX = /[^A-Za-z0-9\s,.'#\/&()-]/g;

export function sanitizeName(value = "") {
  let sanitized = value.replace(/[^A-Za-z\s'.-]/g, "");
  sanitized = sanitized.replace(/\s{2,}/g, " ");
  sanitized = sanitized.trim();
  return sanitized.slice(0, NAME_MAX_LENGTH);
}

export function validateName(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return NAME_REGEX.test(trimmed);
}

export function sanitizeEmail(value = "") {
  return value.replace(/\s/g, "").slice(0, EMAIL_MAX_LENGTH).toLowerCase();
}

export function validateEmail(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > EMAIL_MAX_LENGTH) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function sanitizeMobile(value = "") {
  return value.replace(/\D/g, "").slice(0, MOBILE_MAX_LENGTH);
}

export function validateMobile(value = "") {
  return MOBILE_REGEX.test(value);
}

export function sanitizeGSTIN(value = "") {
  return value.replace(/[^0-9A-Za-z]/g, "").toUpperCase().slice(0, GSTIN_LENGTH);
}

export function validateGSTIN(value = "") {
  const formatted = value.toUpperCase();
  if (formatted.length !== GSTIN_LENGTH) return false;
  return GSTIN_REGEX.test(formatted);
}

export function sanitizeStreetAddress(value = "") {
  if (!value) {
    return "";
  }

  let sanitized = value.replace(STREET_SANITIZE_REGEX, "");
  sanitized = sanitized.replace(/\s{2,}/g, " ");
  sanitized = sanitized.trim();

  if (sanitized.length <= STREET_MAX_LENGTH) {
    return sanitized;
  }

  return sanitized.slice(0, STREET_MAX_LENGTH).trim();
}

export function validateStreetAddress(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length > STREET_MAX_LENGTH) return false;
  return STREET_REGEX.test(trimmed);
}

export function sanitizeBio(value = "") {
  if (!value) return "";
  const withoutTags = value.replace(/<[^>]*>/g, "");
  return withoutTags.slice(0, BIO_MAX_LENGTH);
}

export function validateBio(value = "") {
  if (!value) return true;
  if (value.length > BIO_MAX_LENGTH) return false;
  if (/<script/i.test(value)) return false;
  return true;
}

export function sanitizeVerificationCode(value = "") {
  return value.replace(/\D/g, "").slice(0, VERIFICATION_CODE_LENGTH);
}

export function createEmptyTransporterErrors() {
  return {
    name: "",
    id: "",
    phone: "",
    email: "",
  };
}

export function validateTransporterDetails(details = {}) {
  const errors = createEmptyTransporterErrors();

  const name = (details.name || "").trim();
  const id = (details.id || "").trim();
  const phone = (details.phone || "").trim();
  const email = (details.email || "").trim();

  if (!name) {
    errors.name = "Transporter name is required";
  }

  if (!id) {
    errors.id = "Transporter ID is required";
  }

  if (!phone) {
    errors.phone = "Transporter phone number is required";
  } else if (!validateMobile(phone)) {
    errors.phone = "Please enter a valid 10-digit phone number";
  }

  if (!email) {
    errors.email = "Transporter email is required";
  } else if (!validateEmail(email)) {
    errors.email = "Please enter a valid email address";
  }

  return {
    isValid: Object.values(errors).every((error) => !error),
    errors,
  };
}
