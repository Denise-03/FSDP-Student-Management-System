import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
export function Heading({ eyebrow = 'YOUR AIKIDO JOURNEY', title, children }) {
  return (
    <div className="heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
export function Card({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Badge({ children }) {
  const text = String(children || 'Not available').replaceAll('_', ' ');
  const good =
    /active|eligible|present|succeeded|assessed|confirmed|waived/.test(text) &&
    !/inactive|ineligible|pending|not yet/.test(text);
  return <span className={`badge ${good ? 'good' : ''}`}>{text}</span>;
}
export function Field({ label, children, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {children ? (
        <select id={id} {...props}>
          {children}
        </select>
      ) : (
        <input id={id} {...props} />
      )}
    </label>
  );
}
export function Textarea({ label, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea id={id} rows={4} {...props} />
    </label>
  );
}
export function Notice({ children, error = false }) {
  return children ? (
    <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>
      {children}
    </div>
  ) : null;
}
export function Resource({ resource, children }) {
  if (resource.loading && !resource.data)
    return (
      <p role="status" className="loading">
        Loading your information…
      </p>
    );
  if (resource.error)
    return (
      <Notice error>
        {resource.error} <button onClick={resource.reload}>Try again</button>
      </Notice>
    );
  return resource.data ? children(resource.data) : <p>No records yet.</p>;
}
export function Action({ run, children, className = '', onDone, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  async function handle() {
    setBusy(true);
    setMessage('');
    try {
      const result = await run();
      setError(false);
      setMessage(result?.message || 'Saved.');
      onDone?.(result);
    } catch (error) {
      setError(true);
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="action">
      <button className={className} disabled={disabled || busy} onClick={handle}>
        {busy ? 'Please wait…' : children}
      </button>
      <Notice error={error}>{message}</Notice>
    </div>
  );
}
export function Empty({ children = 'No records yet.' }) {
  return <p className="empty">{children}</p>;
}
export function Metrics({ items }) {
  return (
    <div className="metrics">
      {items.map(([value, label]) => (
        <Card key={label}>
          <strong className="metric">{value ?? '-'}</strong>
          <p>{label}</p>
        </Card>
      ))}
    </div>
  );
}
export function ReadinessCard({ state }) {
  return (
    <Card title="Your next milestone">
      <div className="row spread">
        <h3>
          {state.profile?.beltName || 'Unverified'} ·{' '}
          {state.rule?.targetBelt || 'Next rank'}
        </h3>
        <Badge>{state.eligible ? 'eligible' : 'not yet eligible'}</Badge>
      </div>
      <p>{state.rule?.label || 'No grading rule configured'}</p>
      <progress
        max={state.rule?.minSessions || 1}
        value={Math.min(state.total, state.rule?.minSessions || 1)}
        aria-label="Qualifying training sessions"
      />
      <p>
        <strong>
          {state.total} / {state.rule?.minSessions || '—'}
        </strong>{' '}
        qualifying sessions - {state.days || 0} days in rank
      </p>
      {state.reasons.map((reason) => (
        <p key={reason}>{reason}</p>
      ))}
      <Link className="text-link" to="/student/grading-applications">
        View grading opportunities →
      </Link>
    </Card>
  );
}
