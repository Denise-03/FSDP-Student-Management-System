import { Link, Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { useResource } from '../../../shared/hooks/useResource.js';
import { Resource } from '../../../shared/components/ui.jsx';
import FamilyDayLayout from '../components/FamilyDayLayout.jsx';
import RegistrationForm from '../components/RegistrationForm.jsx';
import HouseholdDetails from '../components/HouseholdDetails.jsx';
import { REGISTRATION_PATH, createRegistration } from '../api/familyDayApi.js';

// Shown after a successful registration.
function InterestReceived({ registration }) {
  const total = registration.totalPeople;
  return (
    <section className="fd-card">
      <div className="fd-status">
        <span className="fd-status-icon" aria-hidden="true">
          <Check size={24} />
        </span>
        <div>
          <h2>Interest received</h2>
          <p>
            One household · {total} potential {total === 1 ? 'attendee' : 'attendees'}
          </p>
        </div>
      </div>
      <div className="fd-alert fd-alert-success">
        <div>
          <strong>Not a confirmed booking</strong>
          <p>
            Registering interest does not reserve a place or guarantee attendance. Attendance
            will be confirmed separately once details are available.
          </p>
        </div>
      </div>
      <h3 className="fd-form-heading">Your household</h3>
      <HouseholdDetails registration={registration} />
      <h3 className="fd-form-heading">What happens next?</h3>
      <p className="fd-body-text">
        Date, time and venue are To Be Announced. Event updates will go to{' '}
        {registration.contactEmail} when details are available.
      </p>
      <p className="fd-hint">
        Confirmation of attendance follows later. You can manage your household details or
        withdraw your interest at any time.
      </p>
      <div className="fd-actions">
        <Link className="fd-btn fd-btn-green" to="/family-day/manage">
          Manage interest
        </Link>
        <Link className="fd-btn fd-btn-outline" to="/family-day">
          Back to event
        </Link>
      </div>
    </section>
  );
}

export default function FamilyDayRegisterPage() {
  const resource = useResource(REGISTRATION_PATH);
  const [saved, setSaved] = useState(null);

  if (saved) {
    const firstName = saved.parentName.split(' ')[0];
    return (
      <FamilyDayLayout
        current="Interest received"
        title={`Thank you, ${firstName}. You’re on the interest list.`}
        intro="Your household’s expression of interest has been recorded. We look forward to bringing our Aikido family together."
      >
        <InterestReceived registration={saved} />
      </FamilyDayLayout>
    );
  }

  return (
    <FamilyDayLayout
      current="Register interest"
      title="Register your family’s interest"
      intro="Let us know who may join us. Share a few household details so we can keep you informed as plans take shape."
    >
      <Resource resource={resource}>
        {(data) =>
          data.registration?.status === 'registered' ? (
            // Already registered, so send the student to edit instead.
            <Navigate to="/family-day/manage" replace />
          ) : (
            <section className="fd-card">
              <h2>Your household</h2>
              <RegistrationForm
                submitLabel="Submit interest"
                busyLabel="Submitting…"
                onSubmit={async (payload) => {
                  const result = await createRegistration(payload);
                  setSaved(result.registration);
                }}
              >
                <Link className="fd-btn fd-btn-outline" to="/family-day">
                  Back to event
                </Link>
              </RegistrationForm>
            </section>
          )
        }
      </Resource>
    </FamilyDayLayout>
  );
}
