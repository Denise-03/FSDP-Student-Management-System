// Checks the form in the browser so people get quick, clear messages.
// The server checks everything again, so these rules match the backend.
export const MAX_PER_GROUP = 20;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const emptyForm = {
  parentName: '',
  contactEmail: '',
  adults: '0',
  children: '0',
  dietaryNeeds: '',
  whoMayBeJoining: '',
  additionalInfo: '',
  updatesConsent: false,
};

// Fills the form from a saved registration (used on the Manage page).
export function formFromRegistration(registration) {
  return {
    parentName: registration.parentName,
    contactEmail: registration.contactEmail,
    adults: String(registration.adults),
    children: String(registration.children),
    dietaryNeeds: registration.dietaryNeeds || '',
    whoMayBeJoining: registration.whoMayBeJoining || '',
    additionalInfo: registration.additionalInfo || '',
    updatesConsent: Boolean(registration.updatesConsent),
  };
}

// Form inputs hold text, but the API wants numbers for the counts.
export function toPayload(values) {
  return {
    ...values,
    parentName: values.parentName.trim(),
    contactEmail: values.contactEmail.trim(),
    adults: Number(values.adults),
    children: Number(values.children),
  };
}

function countError(text, label) {
  const clean = String(text).trim();
  if (clean === '') return `Enter the number of ${label}. Use 0 if none.`;
  if (!/^-?\d+$/.test(clean)) return `Number of ${label} must be a whole number, like 2.`;
  const count = Number(clean);
  if (count < 0) return `Number of ${label} cannot be negative.`;
  if (count > MAX_PER_GROUP) return `Please enter ${MAX_PER_GROUP} or fewer ${label}.`;
  return '';
}

export function validateForm(values) {
  const errors = {};
  if (!values.parentName.trim()) errors.parentName = 'Enter the parent or guardian name.';
  else if (values.parentName.trim().length > 120)
    errors.parentName = 'Name must be 120 characters or fewer.';

  const email = values.contactEmail.trim();
  if (!email) errors.contactEmail = 'Enter a contact email.';
  else if (!EMAIL_PATTERN.test(email))
    errors.contactEmail = 'Enter a valid email address, like you@example.com.';

  const adultsProblem = countError(values.adults, 'adults');
  const childrenProblem = countError(values.children, 'children');
  if (adultsProblem) errors.adults = adultsProblem;
  if (childrenProblem) errors.children = childrenProblem;
  if (!adultsProblem && !childrenProblem && Number(values.adults) + Number(values.children) < 1) {
    errors.adults = 'Your household must have at least 1 person.';
    errors.children = 'Your household must have at least 1 person.';
  }

  if (values.dietaryNeeds.length > 500)
    errors.dietaryNeeds = 'Dietary needs must be 500 characters or fewer.';
  if (values.whoMayBeJoining.length > 500)
    errors.whoMayBeJoining = 'Who may be joining must be 500 characters or fewer.';
  if (values.additionalInfo.length > 1000)
    errors.additionalInfo = 'Additional information must be 1000 characters or fewer.';
  if (!values.updatesConsent)
    errors.updatesConsent = 'Please tick the box so we can send you event updates.';
  return errors;
}

export function peopleText(adults, children) {
  const total = Number(adults) + Number(children);
  return `${adults} ${adults === 1 ? 'adult' : 'adults'} · ${children} ${
    children === 1 ? 'child' : 'children'
  } · ${total} ${total === 1 ? 'person' : 'people'}`;
}
