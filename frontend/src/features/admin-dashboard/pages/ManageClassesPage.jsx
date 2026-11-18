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
<<<<<<< HEAD
function RuleEditor({ rule, onDone }) {
  const [form, setForm] = useState({
    minSessions: rule.minSessions,
    minDays: rule.minDays,
  });
  return (
    <Card title={`${rule.label} - rank ${rule.fromBelt} to ${rule.toBelt}`}>
=======
const EXTRA_TYPES = {
  performance: ['Instructor confirms good performance', 1, 1],
  membership_days: ['Minimum days of valid membership remaining', 0, 365],
  training_centres: ['Minimum qualifying training centres', 1, 10],
};
function validNumber(value, min, max, label) {
  if (
    String(value).trim() === '' ||
    !/^\d+$/.test(String(value)) ||
    Number(value) < min ||
    Number(value) > max
  )
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`);
  return Number(value);
}
function ExtraRuleEditor({ ruleId, item, onDone }) {
  const [value, setValue] = useState(String(item.requiredValue));
  const [label, min, max] = EXTRA_TYPES[item.type];
  return (
    <div className="list-row">
      <h3>{label}</h3>
      {min !== max && (
        <Field
          label="Required value"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
      <div className="row">
        <Action
          run={() =>
            mutate(`/admin/rules/${ruleId}/additional`, {
              type: item.type,
              requiredValue: validNumber(value, min, max, label),
            }, 'PUT')
          }
          onDone={onDone}
        >
          Save
        </Action>
        <Action
          className="secondary"
          run={() =>
            mutate(
              `/admin/rules/${ruleId}/additional/${item.type}`,
              undefined,
              'DELETE',
            )
          }
          onDone={onDone}
        >
          Remove
        </Action>
      </div>
    </div>
  );
}
function RuleEditor({ rule, extras, onDone }) {
  const [form, setForm] = useState({
    minSessions: String(rule.minSessions),
    minDays: String(rule.minDays),
  });
  const [newType, setNewType] = useState('');
  const [newValue, setNewValue] = useState('1');
  const available = Object.keys(EXTRA_TYPES).filter(
    (type) => !extras.some((item) => item.type === type),
  );
  return (
    <Card title={`${rule.fromBeltName} → ${rule.toBeltName}`}>
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
      <Field
        label="Minimum qualifying sessions"
        type="number"
        min={1}
        max={500}
        value={form.minSessions}
<<<<<<< HEAD
        onChange={(e) => setForm({ ...form, minSessions: Number(e.target.value) })}
=======
        onChange={(e) => setForm({ ...form, minSessions: e.target.value })}
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
      />
      <Field
        label="Minimum days in rank"
        type="number"
        min={0}
        max={3650}
        value={form.minDays}
<<<<<<< HEAD
        onChange={(e) => setForm({ ...form, minDays: Number(e.target.value) })}
      />
      <Action run={() => mutate(`/admin/rules/${rule.id}`, form, 'PATCH')} onDone={onDone}>
        Save grading rule
      </Action>
=======
        onChange={(e) => setForm({ ...form, minDays: e.target.value })}
      />
      <Action
        run={() =>
          mutate(`/admin/rules/${rule.id}`, {
            minSessions: validNumber(form.minSessions, 1, 500, 'Sessions'),
            minDays: validNumber(form.minDays, 0, 3650, 'Days in rank'),
          }, 'PATCH')
        }
        onDone={onDone}
      >
        Save grading rule
      </Action>
      <h1></h1>
      <h3>Additional requirements</h3>
      <p>Active membership and rank verification are always required.</p>
      {extras.map((item) => (
        <ExtraRuleEditor
          key={`${item.id}-${item.requiredValue}`}
          item={item}
          ruleId={rule.id}
          onDone={onDone}
        />
      ))}
      {available.length > 0 && (
        <div className="list-row">
          <Field
            label="Add a requirement"
            value={newType}
            onChange={(e) => {
              setNewType(e.target.value);
              setNewValue('1');
            }}
          >
            <option value="">Select a rule</option>
            {available.map((type) => (
              <option key={type} value={type}>
                {EXTRA_TYPES[type][0]}
              </option>
            ))}
          </Field>
          {newType &&
            EXTRA_TYPES[newType][1] !== EXTRA_TYPES[newType][2] && (
              <Field
                label="Required value"
                type="number"
                min={EXTRA_TYPES[newType][1]}
                max={EXTRA_TYPES[newType][2]}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            )}
          <Action
            disabled={!newType}
            run={() =>
              mutate(`/admin/rules/${rule.id}/additional`, {
                type: newType,
                requiredValue: validNumber(
                  newValue,
                  EXTRA_TYPES[newType][1],
                  EXTRA_TYPES[newType][2],
                  EXTRA_TYPES[newType][0],
                ),
              }, 'PUT')
            }
            onDone={() => {
              setNewType('');
              onDone();
            }}
          >
            Add requirement
          </Action>
        </div>
      )}
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
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
<<<<<<< HEAD
                  <RuleEditor key={rule.id} rule={rule} onDone={reload} />
=======
                  <RuleEditor
                    key={rule.id}
                    rule={rule}
                    extras={data.requirements.filter(
                      (item) => item.ruleId === rule.id,
                    )}
                    onDone={reload}
                  />
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
                ))}
              </div>
            )}
          </>
        )}
      </Resource>
    </>
  );
}
