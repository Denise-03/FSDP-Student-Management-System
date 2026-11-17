import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import {
  Heading,
  Card,
  Resource,
  Field,
  Badge,
  Action,
  Empty,
} from '../../../shared/components/ui.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import { mutate, dateTime } from '../../../shared/lib/api.js';
import ClassCards from '../components/ClassCards.jsx';
export function ClassesPage() {
  const { catalogue } = useApp();
  const [search, setSearch] = useState('');
  return (
    <div className="section">
      <Heading title="Find your practice.">
        A welcoming place to begin. A new way to keep growing.
      </Heading>
      <Field
        label="Search classes"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Adult, children, weapons?"
      />
      <Resource resource={catalogue}>
        {(data) => {
          const classes = data.classTypes.filter((c) =>
            `${c.name} ${c.description}`.toLowerCase().includes(search.toLowerCase()),
          );
          return classes.length ? (
            <ClassCards classes={classes} />
          ) : (
            <Empty>No classes match this search.</Empty>
          );
        }}
      </Resource>
    </div>
  );
}
export function DojosPage() {
  const { catalogue } = useApp();
  const [region, setRegion] = useState('All');
  return (
    <div className="section">
      <Heading title="Your place to train.">
        Fictional centres demonstrate a connected training network across Singapore.
      </Heading>
      <Field label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
        {['All', 'Central', 'East', 'West'].map((value) => (
          <option key={value}>{value}</option>
        ))}
      </Field>
      <Resource resource={catalogue}>
        {(data) => (
          <div className="grid three">
            {data.dojos
              .filter((d) => region === 'All' || d.region === region)
              .map((dojo) => (
                <Card title={dojo.name} key={dojo.id}>
                  <Badge>active</Badge>
                  <p>{dojo.address}</p>
                  <p>{dojo.region} region · Demonstration location</p>
                  <Link className="text-link" to={`/student/classes?dojo=${dojo.id}`}>
                    View available sessions →
                  </Link>
                </Card>
              ))}
          </div>
        )}
      </Resource>
    </div>
  );
}
export function SessionList({ sessions, showBook = true, reload }) {
  const { user } = useApp();
  const navigate = useNavigate();
  function remember(sessionId) {
    sessionStorage.setItem(
      'fsdp.intendedSession',
      JSON.stringify({ id: sessionId, expires: Date.now() + 86400000 }),
    );
    navigate(
      user ? (user.role === 'student' ? '/student/classes' : '/enrolment') : '/login',
    );
  }
  return (
    <div className="session-list">
      {sessions.length ? (
        sessions.map((session) => (
          <Card key={session.id}>
            <div className="row spread">
              <div>
                <h3>{session.className}</h3>
                <p>{session.dojoName}</p>
                <p>
                  {dateTime(session.startsAt)} · {session.instructorName}
                </p>
              </div>
              <div>
                <Badge>{`${session.booked} / ${session.capacity} booked`}</Badge>
                {showBook &&
                  (user?.role === 'student' ? (
                    <Action
                      run={() => mutate('/classes/bookings', { sessionId: session.id })}
                      onDone={() => {
                        reload?.();
                        sessionStorage.removeItem('fsdp.intendedSession');
                      }}
                    >
                      Book class
                    </Action>
                  ) : (
                    <button onClick={() => remember(session.id)}>Book class →</button>
                  ))}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Empty>No upcoming sessions match these filters.</Empty>
      )}
    </div>
  );
}
export function ClassDetailsPage() {
  const { classId } = useParams();
  const { catalogue } = useApp();
  return (
    <div className="section">
      <Resource resource={catalogue}>
        {(data) => {
          const item = data.classTypes.find((c) => c.id === classId);
          if (!item)
            return (
              <Empty>
                Class not found. <Link to="/classes">Back to classes</Link>
              </Empty>
            );
          return (
            <>
              <Heading title={item.name}>{item.description}</Heading>
              <div className="detail-banner">
                <p>
                  Ages {item.minAge}–{item.maxAge} · Minimum verified rank:{' '}
                  {data.belts.find((b) => b.id === item.minBelt)?.name}
                </p>
                <p>Demo schedule · All times shown in Singapore time.</p>
              </div>
              <h2>Find your next session</h2>
              <SessionList
                sessions={data.sessions.filter((s) => s.classTypeId === classId)}
                reload={catalogue.reload}
              />
            </>
          );
        }}
      </Resource>
    </div>
  );
}
function isSuitableSession(profile, session) {
  const birth = new Date(profile.dateOfBirth);
  const date = new Date(session.startsAt);
  let age = date.getUTCFullYear() - birth.getUTCFullYear();
  if (
    date.getUTCMonth() < birth.getUTCMonth() ||
    (date.getUTCMonth() === birth.getUTCMonth() && date.getUTCDate() < birth.getUTCDate())
  )
    age -= 1;
  // Recommendations mirror suitability; the API still owns the booking decision.
  return (
    profile.verified &&
    session.minBelt <= profile.beltId &&
    age >= session.minAge &&
    age <= session.maxAge
  );
}
export function BookClassesPage() {
  const { catalogue, user } = useApp();
  const [dojo, setDojo] = useState(
    new URLSearchParams(location.search).get('dojo') || 'All',
  );
  const [kind, setKind] = useState('All');
  const profile = useResource('/profile');
  let intended;
  try {
    intended = JSON.parse(sessionStorage.getItem('fsdp.intendedSession'));
  } catch {
    intended = null;
  }
  return (
    <>
      <Heading title="Make time for practice.">
        Choose a suitable class. Availability is checked again when you book.
      </Heading>
      {intended?.expires > Date.now() && (
        <Card title="Your selected class">
          <Resource resource={catalogue}>
            {(data) => (
              <SessionList
                sessions={data.sessions.filter((s) => s.id === intended.id)}
                reload={catalogue.reload}
              />
            )}
          </Resource>
        </Card>
      )}
      <Resource resource={catalogue}>
        {(data) => (
          <>
            <div className="filters">
              <Field
                label="Training centre"
                value={dojo}
                onChange={(e) => setDojo(e.target.value)}
              >
                <option>All</option>
                {data.dojos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Field>
              <Field
                label="Class type"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option>All</option>
                {data.classTypes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Field>
            </div>
            <Resource resource={profile}>
              {(p) => (
                <SessionList
                  sessions={data.sessions.filter(
                    (s) =>
                      (dojo === 'All' || s.dojoId === dojo) &&
                      (kind === 'All' || s.classTypeId === kind) &&
                      isSuitableSession(p, s),
                  )}
                  reload={catalogue.reload}
                />
              )}
            </Resource>
          </>
        )}
      </Resource>
    </>
  );
}
export function MyBookingsPage() {
  const resource = useResource('/classes/bookings');
  return (
    <>
      <Heading title="Your time on the mat.">
        Your upcoming and previous bookings, saved across visits.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <div className="session-list">
            {data.length ? (
              data.map((booking) => (
                <Card key={booking.id}>
                  <div className="row spread">
                    <div>
                      <h3>{booking.className}</h3>
                      <p>
                        {booking.dojoName} · {dateTime(booking.startsAt)}
                      </p>
                    </div>
                    <Badge>{booking.status}</Badge>
                  </div>
                  {booking.status === 'confirmed' &&
                    new Date(booking.startsAt) > new Date() && (
                      <Action
                        className="secondary"
                        run={() => mutate(`/classes/bookings/${booking.id}`, {}, 'DELETE')}
                        onDone={resource.reload}
                      >
                        Cancel booking
                      </Action>
                    )}
                </Card>
              ))
            ) : (
              <Empty>
                No bookings yet. <Link to="/student/classes">Find a class</Link>
              </Empty>
            )}
          </div>
        )}
      </Resource>
    </>
  );
}
