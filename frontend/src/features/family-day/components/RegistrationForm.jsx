import { useId, useRef, useState } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { emptyForm, validateForm, toPayload, MAX_PER_GROUP } from '../registrationRules.js';
import '../familyDay.css';

// One label + input + hint + error message, wired together for screen readers.
function FormField({ label, required, hint, error, children }) {
  const id = useId();
  return (
    <div className="fd-field">
      {label && (
        <label htmlFor={id}>
          {label}
          {required && ' *'}
        </label>
      )}
      {children({
        id,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': error ? `${id}-error` : hint ? `${id}-hint` : undefined,
      })}
      {error && (
        <p className="fd-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="fd-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}

// Used by both the Register page and the Manage page.
// onSubmit(payload) should throw an Error to show a message, or return a text to show success.
export default function RegistrationForm({
  initialValues = emptyForm,
  submitLabel,
  busyLabel = 'Saving…',
  onSubmit,
  children,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const sending = useRef(false); // stops a double click before the screen updates
  const formRef = useRef(null);

  function change(name, value) {
    setValues((old) => ({ ...old, [name]: value }));
    setErrors((old) => ({ ...old, [name]: undefined }));
    setSuccess('');
  }

  async function submit(event) {
    event.preventDefault();
    if (sending.current) return;
    setFormError('');
    setSuccess('');
    const found = validateForm(values);
    setErrors(found);
    if (Object.keys(found).length) {
      setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    sending.current = true;
    setBusy(true);
    try {
      const message = await onSubmit(toPayload(values));
      if (typeof message === 'string') setSuccess(message);
    } catch (error) {
      setFormError(error.message);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  const total = (Number(values.adults) || 0) + (Number(values.children) || 0);
  const totalOk = !errors.adults && !errors.children && total >= 1;

  return (
    <form className="fd-form" onSubmit={submit} noValidate ref={formRef}>
      <p className="fd-hint">One expression of interest per household. * Required fields</p>

      <FormField label="Parent / guardian name" required error={errors.parentName}>
        {(aria) => (
          <input
            {...aria}
            type="text"
            autoComplete="name"
            maxLength={120}
            placeholder="Enter your name"
            value={values.parentName}
            onChange={(e) => change('parentName', e.target.value)}
          />
        )}
      </FormField>

      <FormField
        label="Contact email"
        required
        error={errors.contactEmail}
        hint="We would use this email for Family Day details and attendance updates only."
      >
        {(aria) => (
          <input
            {...aria}
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
            value={values.contactEmail}
            onChange={(e) => change('contactEmail', e.target.value)}
          />
        )}
      </FormField>

      <h3 className="fd-form-heading">Household / family information</h3>
      <p className="fd-hint">
        Include everyone in your household who may attend, including yourself. Enter whole
        numbers; the total must be at least 1.
      </p>
      <div className="fd-two">
        <FormField label="Number of adults" required error={errors.adults}>
          {(aria) => (
            <input
              {...aria}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_PER_GROUP}
              step="1"
              value={values.adults}
              onChange={(e) => change('adults', e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Number of children" required error={errors.children}>
          {(aria) => (
            <input
              {...aria}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_PER_GROUP}
              step="1"
              value={values.children}
              onChange={(e) => change('children', e.target.value)}
            />
          )}
        </FormField>
      </div>
      {totalOk && (
        <p className="fd-total">
          {total} {total === 1 ? 'person' : 'people'} in your household
        </p>
      )}

      <FormField
        label="Who may be joining? (optional)"
        error={errors.whoMayBeJoining}
        hint="For example: parents and grandparents. Please do not include children’s personal details."
      >
        {(aria) => (
          <input
            {...aria}
            type="text"
            maxLength={500}
            placeholder="e.g. Both parents and one grandparent"
            value={values.whoMayBeJoining}
            onChange={(e) => change('whoMayBeJoining', e.target.value)}
          />
        )}
      </FormField>

      <FormField
        label="Dietary needs (optional)"
        error={errors.dietaryNeeds}
        hint="Share food preferences only. Please do not include medical information or children’s personal details."
      >
        {(aria) => (
          <textarea
            {...aria}
            rows={3}
            maxLength={500}
            placeholder="e.g. vegetarian meals requested"
            value={values.dietaryNeeds}
            onChange={(e) => change('dietaryNeeds', e.target.value)}
          />
        )}
      </FormField>

      <FormField label="Additional information (optional)" error={errors.additionalInfo}>
        {(aria) => (
          <textarea
            {...aria}
            rows={3}
            maxLength={1000}
            placeholder="Anything else you would like us to know"
            value={values.additionalInfo}
            onChange={(e) => change('additionalInfo', e.target.value)}
          />
        )}
      </FormField>

      <div className="fd-consent">
        <FormField error={errors.updatesConsent}>
          {(aria) => (
            <span className="fd-check">
              <input
                {...aria}
                type="checkbox"
                checked={values.updatesConsent}
                onChange={(e) => change('updatesConsent', e.target.checked)}
              />
              <label htmlFor={aria.id}>
                I authorise Aikido Shinju-Kai to contact me with updates about this Family Day
                event only. *
              </label>
            </span>
          )}
        </FormField>
        <p className="fd-hint">
          No marketing consent is requested. You can withdraw your interest to stop updates for
          this event.
        </p>
      </div>

      <div className="fd-alert fd-alert-info">
        <Info size={18} aria-hidden="true" />
        <div>
          <strong>Not a confirmed booking</strong>
          <p>
            Registering interest does not reserve a place or guarantee attendance. Attendance
            will be confirmed separately once details are available.
          </p>
        </div>
      </div>

      {formError && (
        <p className="fd-alert fd-alert-error" role="alert">
          {formError}
        </p>
      )}
      {success && (
        <p className="fd-alert fd-alert-success" role="status">
          {success}
        </p>
      )}

      <div className="fd-actions">
        <button type="submit" className="fd-btn fd-btn-green" disabled={busy}>
          {busy ? busyLabel : submitLabel}
          {!busy && <ArrowRight size={16} aria-hidden="true" />}
        </button>
        {children}
      </div>
    </form>
  );
}
