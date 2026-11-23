// Checks and cleans the Family Day form data.
// It has no database code, so it is easy to test on its own.
const MAX_PER_GROUP = 20;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Remove hidden control characters and angle brackets so pasted HTML
// cannot be stored. SQL is already safe because we use parameters.
export function cleanText(value, { multiline = false } = {}) {
  let text = String(value ?? '').normalize('NFKC');
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  text = text.replace(/[<>]/g, '');
  if (multiline) {
    text = text.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
  } else {
    text = text.replace(/\s+/g, ' ');
  }
  return text.trim();
}

// Accepts 2 or "2". Anything else (2.5, "abc", "") becomes NaN.
function toCount(raw) {
  if (typeof raw === 'number' && Number.isInteger(raw)) return raw;
  if (typeof raw === 'string' && /^\d{1,3}$/.test(raw.trim())) return Number(raw.trim());
  return Number.NaN;
}

function checkCount(raw, label, errors, key) {
  const count = toCount(raw);
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    errors[key] = `Enter the number of ${label}. Use 0 if none.`;
  } else if (Number.isNaN(count)) {
    errors[key] = `Number of ${label} must be a whole number, like 2.`;
  } else if (count < 0) {
    errors[key] = `Number of ${label} cannot be negative.`;
  } else if (count > MAX_PER_GROUP) {
    errors[key] = `Please enter ${MAX_PER_GROUP} or fewer ${label}.`;
  }
  return count;
}

function checkOptionalText(raw, label, maxLength, errors, key, multiline = false) {
  if (raw !== undefined && raw !== null && typeof raw !== 'string') {
    errors[key] = `${label} must be text.`;
    return '';
  }
  const text = cleanText(raw, { multiline });
  if (text.length > maxLength) {
    errors[key] = `${label} must be ${maxLength} characters or fewer.`;
  }
  return text;
}

// Returns { errors, value }. When errors is empty, value is safe to save.
export function validateRegistration(body = {}) {
  const errors = {};

  if (typeof body.parentName !== 'string' || !cleanText(body.parentName)) {
    errors.parentName = 'Enter the parent or guardian name.';
  }
  const parentName = cleanText(body.parentName);
  if (parentName.length > 120) {
    errors.parentName = 'Name must be 120 characters or fewer.';
  }

  const contactEmail = cleanText(body.contactEmail).toLowerCase();
  if (typeof body.contactEmail !== 'string' || !contactEmail) {
    errors.contactEmail = 'Enter a contact email.';
  } else if (contactEmail.length > 254 || !EMAIL_PATTERN.test(contactEmail)) {
    errors.contactEmail = 'Enter a valid email address, like you@example.com.';
  }

  const adults = checkCount(body.adults, 'adults', errors, 'adults');
  const children = checkCount(body.children, 'children', errors, 'children');
  if (!errors.adults && !errors.children && adults + children < 1) {
    errors.adults = 'Your household must have at least 1 person.';
    errors.children = 'Your household must have at least 1 person.';
  }

  const dietaryNeeds = checkOptionalText(
    body.dietaryNeeds,
    'Dietary needs',
    500,
    errors,
    'dietaryNeeds',
  );
  const whoMayBeJoining = checkOptionalText(
    body.whoMayBeJoining,
    'Who may be joining',
    500,
    errors,
    'whoMayBeJoining',
  );
  const additionalInfo = checkOptionalText(
    body.additionalInfo,
    'Additional information',
    1000,
    errors,
    'additionalInfo',
    true,
  );

  if (body.updatesConsent !== true) {
    errors.updatesConsent = 'Please tick the box so we can send you event updates.';
  }

  return {
    errors,
    value: {
      parentName,
      contactEmail,
      adults,
      children,
      dietaryNeeds,
      whoMayBeJoining,
      additionalInfo,
      updatesConsent: true,
    },
  };
}
