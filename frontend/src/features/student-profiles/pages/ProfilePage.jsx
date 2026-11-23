import { useState } from 'react';
import { useApp } from '../../../app/providers.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Field,
  Action,
  Badge,
} from '../../../shared/components/ui.jsx';
import { mutate } from '../../../shared/lib/api.js';
function ProfileForm({ profile, onDone }) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone || '',
    preferences: profile.preferences,
  });
  return (
    <div className="grid two">
      <Card title="Personal information">
        <Field
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          maxLength={120}
        />
        <Field label="Email" value={profile.email} readOnly />
        <Field
          label="Contact number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          maxLength={30}
        />
        <Field
          label="Notification preference"
          value={form.preferences}
          onChange={(e) => setForm({ ...form, preferences: e.target.value })}
        >
          <option value="in-app">In-app only</option>
          <option value="email-and-in-app">
            Email and in-app (email goes to dev outbox)
          </option>
        </Field>
        <Action run={() => mutate('/profile', form, 'PATCH')} onDone={onDone}>
          Save profile
        </Action>
      </Card>
      <Card title="Your training profile">
        <Badge>{profile.membershipStatus || 'applicant'}</Badge>
        <dl>
          {[
            ['Membership number', profile.memberNumber],
            ['Principal dojo', profile.dojoName],
            ['Class type', profile.classType],
            [
              'Verified belt',
              profile.verified ? profile.beltName : 'Awaiting verification',
            ],
            ['Rank start', profile.rankStart?.slice(0, 10)],
          ].map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value || '—'}</dd>
            </div>
          ))}
        </dl>
        <p>
          Once you have reached 13 years of age, you will be automatically
          transferred to the adult class.
        </p>
        <p>Verified rank and membership fields are maintained through authorised review.</p>
      </Card>
    </div>
  );
}
export default function ProfilePage() {
  const resource = useResource('/profile');
  const { refreshUser } = useApp();
  return (
    <>
      <Heading title="Your profile.">Keep your contact preferences up to date.</Heading>
      <Resource resource={resource}>
        {(data) => (
          <ProfileForm
            profile={data}
            onDone={() => {
              resource.reload();
              refreshUser();
            }}
          />
        )}
      </Resource>
    </>
  );
}
