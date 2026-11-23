import { useEffect, useRef, useState } from 'react';
import { MinusCircle } from 'lucide-react';
import { peopleText } from '../registrationRules.js';
import '../familyDay.css';

// Uses the browser's built-in <dialog>, which handles focus and the Esc key.
export default function WithdrawDialog({ registration, onClose, onConfirm }) {
  const dialogRef = useRef(null);
  const working = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function confirm() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (problem) {
      setError(problem.message);
      working.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fd-dialog"
      aria-labelledby="fd-withdraw-title"
      onClose={onClose}
    >
      <span className="fd-dialog-icon" aria-hidden="true">
        <MinusCircle size={24} />
      </span>
      <h2 id="fd-withdraw-title">Withdraw your household’s interest?</h2>
      <p>
        This will remove your household’s expression of interest in Aikido Shinju-Kai Family
        Day and stop updates for this event.
      </p>
      <div className="fd-dialog-summary">
        <strong>
          {registration.parentName} · {peopleText(registration.adults, registration.children)}
        </strong>
        <small>{registration.contactEmail}</small>
      </div>
      <p>
        Your Aikido classes and membership will not be cancelled or changed. You can register
        interest again later.
      </p>
      {error && (
        <p className="fd-alert fd-alert-error" role="alert">
          {error}
        </p>
      )}
      <div className="fd-actions">
        <button type="button" className="fd-btn fd-btn-outline" onClick={onClose} disabled={busy}>
          Keep my interest
        </button>
        <button type="button" className="fd-btn fd-btn-danger" onClick={confirm} disabled={busy}>
          {busy ? 'Withdrawing…' : 'Withdraw interest'}
        </button>
      </div>
    </dialog>
  );
}
