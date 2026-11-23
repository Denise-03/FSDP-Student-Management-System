import { peopleText } from '../registrationRules.js';

// A simple label / value table of what the household submitted.
export default function HouseholdDetails({ registration }) {
  const active = registration.status === 'registered';
  const rows = [
    ['Registration ID', registration.registrationId],
    ['Parent / guardian', registration.parentName],
    ['Contact email', registration.contactEmail],
    ['Household', peopleText(registration.adults, registration.children)],
    ['Who may be joining', registration.whoMayBeJoining],
    ['Dietary needs', registration.dietaryNeeds || 'None given'],
    ['Additional information', registration.additionalInfo],
    [
      'Event-only updates',
      active ? 'Authorised for this Family Day only' : 'Stopped for this event',
    ],
  ];
  return (
    <dl className="fd-details">
      {rows
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}
