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
import { mutate, dateTime, money } from '../../../shared/lib/api.js';
function DojoEditor({ dojo, onDone }) {
  const [form, setForm] = useState({
    name: dojo.name,
    address: dojo.address,
    active: dojo.active,
  });
  return (
    <Card title={dojo.name}>
      <Field
        label="Centre name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Field
        label="Address"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <label className="check">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Active centre
      </label>
      <Action run={() => mutate(`/admin/dojos/${dojo.id}`, form, 'PATCH')} onDone={onDone}>
        Save centre
      </Action>
    </Card>
  );
}
function RuleEditor({ rule, onDone }) {
  const [form, setForm] = useState({
    minSessions: rule.minSessions,
    minDays: rule.minDays,
  });
  return (
    <Card title={`${rule.label} - rank ${rule.fromBelt} to ${rule.toBelt}`}>
      <Field
        label="Minimum qualifying sessions"
        type="number"
        min={1}
        max={500}
        value={form.minSessions}
        onChange={(e) => setForm({ ...form, minSessions: Number(e.target.value) })}
      />
      <Field
        label="Minimum days in rank"
        type="number"
        min={0}
        max={3650}
        value={form.minDays}
        onChange={(e) => setForm({ ...form, minDays: Number(e.target.value) })}
      />
      <Action run={() => mutate(`/admin/rules/${rule.id}`, form, 'PATCH')} onDone={onDone}>
        Save grading rule
      </Action>
    </Card>
  );
}
function SessionEditor({ session, onDone }) {
  const [capacity, setCapacity] = useState(session.capacity);
  return (
    <div className="list-row">
      <h3>
        {session.classTypeId} · {session.dojoId}
      </h3>
      <p>
        {dateTime(session.startsAt)} · {session.instructorId}
      </p>
      <Badge>{session.active ? 'active' : 'cancelled'}</Badge>
      <div className="row">
        <Field
          label="Session capacity"
          type="number"
          min={1}
          max={100}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
        <Action
          className="secondary"
          run={() =>
            mutate(
              `/admin/sessions/${session.id}`,
              { active: session.active, capacity },
              'PATCH',
            )
          }
          onDone={onDone}
        >
          Save capacity
        </Action>
        <Action
          className="secondary"
          run={() =>
            mutate(
              `/admin/sessions/${session.id}`,
              { active: !session.active, capacity },
              'PATCH',
            )
          }
          onDone={onDone}
        >
          {session.active ? 'Cancel session' : 'Reopen session'}
        </Action>
      </div>
    </div>
  );
}
function NewSession({ data, onDone }) {
  const [form, setForm] = useState({
    classTypeId: data.classTypes[0]?.id,
    dojoId: data.dojos[0]?.id,
    instructorId: data.instructors[0]?.id,
    startsAt: '',
    endsAt: '',
    capacity: 12,
  });
  return (
    <Card title="Schedule a new class">
      <div className="grid two">
        {[
          ['classTypeId', 'Class type', data.classTypes],
          ['dojoId', 'Training centre', data.dojos],
          ['instructorId', 'Assigned instructor', data.instructors],
        ].map(([key, label, items]) => (
          <Field
            key={key}
            label={label}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Field>
        ))}
        {['startsAt', 'endsAt'].map((key) => (
          <Field
            key={key}
            label={
              key === 'startsAt'
                ? 'Starts at (local device time)'
                : 'Ends at (local device time)'
            }
            type="datetime-local"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ))}
        <Field
          label="Capacity"
          type="number"
          min={1}
          max={100}
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
        />
      </div>
      <Action
        disabled={!form.startsAt || !form.endsAt}
        run={() =>
          mutate('/admin/sessions', {
            ...form,
            startsAt: new Date(form.startsAt).toISOString(),
            endsAt: new Date(form.endsAt).toISOString(),
          })
        }
        onDone={onDone}
      >
        Create class session
      </Action>
    </Card>
  );
}
function FeeEditor({ amount, onDone }) {
  const [value, setValue] = useState(amount);
  return (
    <Card title="Membership registration price">
      <p>DEMO PRICE — {money(value)}. Applies to future approved charges only.</p>
      <Field
        label="Registration fee in SGD cents"
        type="number"
        min={100}
        max={100000}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <Action
        run={() => mutate('/admin/settings/registration-fee', { amount: value }, 'PATCH')}
        onDone={onDone}
      >
        Save fee
      </Action>
    </Card>
  );
}
export default function ManageClassesPage() {
  const resource = useResource('/admin/manage');
  const { catalogue } = useApp();
  const [tab, setTab] = useState('Sessions');
  function reload() {
    resource.reload();
    catalogue.reload();
  }
  return (
    <>
      <Heading eyebrow="MEMBERSHIP ADMIN" title="Keep your community moving.">
        Coordinate centres, session availability and demonstration rules.
      </Heading>
      <div className="tabs">
        {['Sessions', 'Centres', 'Fees', 'Grading rules'].map((t) => (
          <button
            className={tab === t ? '' : 'secondary'}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <Resource resource={resource}>
        {(data) => (
          <>
            {tab === 'Sessions' && (
              <>
                <NewSession data={data} onDone={reload} />
                <Card title="All class sessions">
                  {data.sessions.map((s) => (
                    <SessionEditor key={s.id} session={s} onDone={reload} />
                  ))}
                </Card>
              </>
            )}
            {tab === 'Centres' && (
              <div className="grid two">
                {data.dojos.map((d) => (
                  <DojoEditor key={d.id} dojo={d} onDone={reload} />
                ))}
              </div>
            )}
            {tab === 'Fees' && (
              <FeeEditor
                amount={Number(
                  data.settings.find((s) => s.id === 'registration_fee')?.value,
                )}
                onDone={reload}
              />
            )}
            {tab === 'Grading rules' && (
              <div className="grid two">
                {data.rules.map((rule) => (
                  <RuleEditor key={rule.id} rule={rule} onDone={reload} />
                ))}
              </div>
            )}
          </>
        )}
      </Resource>
    </>
  );
}
