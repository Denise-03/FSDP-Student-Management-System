import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Lock, MinusCircle } from 'lucide-react';
import { useApp } from '../../../app/providers.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import { Resource } from '../../../shared/components/ui.jsx';
import FamilyDayLayout from '../components/FamilyDayLayout.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import HouseholdDetails from '../components/HouseholdDetails.jsx';
import WithdrawDialog from '../components/WithdrawDialog.jsx';
import { formFromRegistration } from '../registrationRules.js';
import {
  REGISTRATION_PATH,
  updateRegistration,
  withdrawRegistration,
} from '../api/familyDayApi.js';

// Shown after the household withdraws its interest.
function InterestWithdrawn({ registration }) {
  return (
    <FamilyDayLayout
      current="Interest withdrawn"
      title="Your household’s interest is withdrawn"
      intro="You are no longer on the Family Day interest list. Thank you for keeping your household’s plans up to date."
    >
      <section className="fd-card">
        <div className="fd-status">
          <span className="fd-status-icon fd-status-muted" aria-hidden="true">
            <MinusCircle size={24} />
          </span>
          <div>
            <h2>Interest withdrawn</h2>
            <p>No longer registered for event updates</p>
          </div>
        </div>
        <p className="fd-body-text">
          Family Day updates to {registration.contactEmail} will stop. This change applies only
          to this event, not to other communications you have separately agreed to.
        </p>
        <div className="fd-alert fd-alert-success">
          <div>
            <strong>Your classes and membership are unchanged</strong>
            <p>
              Withdrawing interest does not cancel your Aikido classes or membership. There was
              no confirmed booking to cancel.
            </p>
          </div>
        </div>
        <h3 className="fd-form-heading">Your household</h3>
        <HouseholdDetails registration={registration} />
        <h3 className="fd-form-heading">Changed your mind?</h3>
        <p className="fd-hint">
          You can register your household’s interest again. Registering interest does not
          reserve a place or guarantee attendance.
        </p>
        <div className="fd-actions">
          <Link className="fd-btn fd-btn-green" to="/family-day/register">
            Register interest again
          </Link>
          <Link className="fd-btn fd-btn-outline" to="/family-day">
            Back to event
          </Link>
        </div>
      </section>
    </FamilyDayLayout>
  );
}

function ManageInterest({ initial }) {
  const { user } = useApp();
  const [registration, setRegistration] = useState(initial);
  const [asking, setAsking] = useState(false);

  if (registration.status === 'withdrawn') {
    return <InterestWithdrawn registration={registration} />;
  }

  return (
    <FamilyDayLayout
      current="Manage interest"
      title="Manage your household’s interest"
      intro="Review or edit your details below. Your interest is registered, but no seat is reserved and attendance is not guaranteed."
    >
      <p className="fd-alert fd-alert-success fd-signed-in">
        <Lock size={16} aria-hidden="true" /> Signed in as {user?.name}
      </p>
      <section className="fd-card">
        <div className="fd-card-top">
          <h2>Your household</h2>
          <span className="fd-pill-green">Interest registered</span>
        </div>
        <RegistrationForm
          initialValues={formFromRegistration(registration)}
          submitLabel="Save changes"
          onSubmit={async (payload) => {
            const result = await updateRegistration(payload);
            setRegistration(result.registration);
            return result.message;
          }}
        >
          <Link className="fd-btn fd-btn-outline" to="/family-day">
            Back to event
          </Link>
        </RegistrationForm>
      </section>
      <section className="fd-card fd-card-quiet">
        <h2>No longer interested?</h2>
        <p className="fd-body-text">
          Withdraw your household’s interest to stop Family Day updates. This does not affect
          classes or membership.
        </p>
        <button type="button" className="fd-btn fd-btn-outline" onClick={() => setAsking(true)}>
          Withdraw interest
        </button>
      </section>
      {asking && (
        <WithdrawDialog
          registration={registration}
          onClose={() => setAsking(false)}
          onConfirm={async () => {
            const result = await withdrawRegistration();
            setAsking(false);
            setRegistration(result.registration);
          }}
        />
      )}
    </FamilyDayLayout>
  );
}

export default function FamilyDayManagePage() {
  const resource = useResource(REGISTRATION_PATH);
  return (
    <Resource resource={resource}>
      {(data) =>
        data.registration ? (
          <ManageInterest initial={data.registration} />
        ) : (
          // Nothing to manage yet, so go to the registration form.
          <Navigate to="/family-day/register" replace />
        )
      }
    </Resource>
  );
}
