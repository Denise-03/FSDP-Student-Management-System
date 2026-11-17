import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import { api, mutate } from '../../../shared/lib/api.js';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Card,
  Heading,
  Field,
  Textarea,
  Notice,
  Resource,
  Action,
  Badge,
} from '../../../shared/components/ui.jsx';
const initial = {
  phone: '',
  dateOfBirth: '',
  dojoId: '',
  experience: '',
  claimedBelt: 'Beginner',
  guardianName: '',
  waiver: false,
  selectedSessionId: '',
};
function ApplicationForm({ record, dojos, belts }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(() => {
    let selected;
    try {
      selected = JSON.parse(sessionStorage.getItem('fsdp.intendedSession'));
    } catch {
      selected = null;
    }
    return {
      ...initial,
      ...record.application?.data,
      selectedSessionId:
        record.application?.data.selectedSessionId ||
        (selected?.expires > Date.now() ? selected.id : ''),
    };
  });
  const [file, setFile] = useState(null);
  const editable =
    !record.application ||
    ['draft', 'changes_requested'].includes(record.application.status);
  const set = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  async function save(next = false) {
    setBusy(true);
    setMessage('');
    try {
      await mutate('/enrolment/draft', form, 'PUT');
      setError(false);
      setMessage('Draft saved to your account.');
      if (next) setStep(Math.min(step + 1, 3));
    } catch (error) {
      setError(true);
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await mutate('/enrolment/draft', form, 'PUT');
      await mutate('/enrolment/submit', {});
      navigate('/enrolment/status');
    } catch (error) {
      setError(true);
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  if (!editable)
    return (
      <Card title="Application already submitted">
        <Badge>{record.application.status}</Badge>
        <p>Your application is protected while under review.</p>
        <Link className="button" to="/enrolment/status">
          View application status
        </Link>
      </Card>
    );
  return (
    <Card>
      <div className="form-steps" aria-label="Application progress">
        {[
          'Personal details',
          'Training history',
          'Evidence & consent',
          'Review & submit',
        ].map((name, index) => (
          <button
            key={name}
            type="button"
            className={step === index ? 'current' : 'secondary'}
            onClick={() => setStep(index)}
            aria-current={step === index ? 'step' : undefined}
          >
            {index + 1}. {name}
          </button>
        ))}
      </div>
      <form onSubmit={submit}>
        {step === 0 && (
          <>
            <h2>Tell us about yourself.</h2>
            <div className="grid two">
              <Field
                label="Contact number"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                maxLength={30}
                autoComplete="tel"
                required
              />
              <Field
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => set('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <Field
              label="Principal dojo"
              value={form.dojoId}
              onChange={(e) => set('dojoId', e.target.value)}
              required
            >
              <option value="">Choose a centre</option>
              {dojos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Field>
            <Field
              label="Guardian full name (required for applicants under 18)"
              value={form.guardianName}
              onChange={(e) => set('guardianName', e.target.value)}
              maxLength={120}
            />
          </>
        )}
        {step === 1 && (
          <>
            <h2>Your training so far.</h2>
            <Textarea
              label="Previous Aikido training"
              value={form.experience}
              onChange={(e) => set('experience', e.target.value)}
              maxLength={2000}
            />
            <Field
              label="Claimed belt (subject to verification)"
              value={form.claimedBelt}
              onChange={(e) => set('claimedBelt', e.target.value)}
            >
              {belts.map((b) => (
                <option key={b.id}>{b.name}</option>
              ))}
            </Field>
            <p>
              Previous experience is a claim until reviewed. Your account cannot change its
              verified belt.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Evidence and consent.</h2>
            <p>
              Optional: upload a synthetic or redacted previous-training PDF, maximum 2 MB.
              Do not upload identity or medical documents.
            </p>
            <Field
              label="Synthetic training PDF"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Action
              className="secondary"
              disabled={!file}
              run={async () => {
                await mutate('/enrolment/draft', form, 'PUT');
                const body = new FormData();
                body.append('document', file);
                return api('/enrolment/documents', { method: 'POST', body });
              }}
            >
              Upload private evidence
            </Action>
            <p>{record.documents.length} document(s) already saved.</p>
            <label className="check">
              <input
                type="checkbox"
                checked={form.waiver}
                onChange={(e) => set('waiver', e.target.checked)}
              />
              I understand that this is a demo waiver acknowledgement. A guardian named
              above acknowledges participation for a minor.
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Review your application.</h2>
            <dl>
              {Object.entries(form).map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replaceAll(/([A-Z])/g, ' $1')}</dt>
                  <dd>{String(value || '—')}</dd>
                </div>
              ))}
            </dl>
            <p>
              Approval is followed by payment or a documented fee waiver. Registration alone
              does not activate membership.
            </p>
          </>
        )}
        <Notice error={error}>{message}</Notice>
        <div className="row">
          <button
            type="button"
            className="secondary"
            onClick={() => save()}
            disabled={busy}
          >
            Save draft
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => save(true)} disabled={busy}>
              Save & continue →
            </button>
          ) : (
            <button className="red" disabled={busy || !form.waiver}>
              {busy ? 'Submitting…' : 'Submit application'}
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
export default function EnrolmentPage() {
  const record = useResource('/enrolment');
  const { catalogue } = useApp();
  return (
    <div className="section narrow">
      <Heading title="Your journey starts here.">
        Complete four simple steps. Save your draft and return whenever you need.
      </Heading>
      <Resource resource={record}>
        {(data) => (
          <Resource resource={catalogue}>
            {(catalogue) => (
              <ApplicationForm
                record={data}
                dojos={catalogue.dojos}
                belts={catalogue.belts}
              />
            )}
          </Resource>
        )}
      </Resource>
    </div>
  );
}
