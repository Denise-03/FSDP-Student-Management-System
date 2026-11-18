import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Metrics,
  Badge,
  Field,
  Action,
  Empty,
} from '../../../shared/components/ui.jsx';
import { mutate, money } from '../../../shared/lib/api.js';
export function AdminDashboardPage() {
  const resource = useResource('/admin');
  return (
    <>
      <Heading eyebrow="MEMBERSHIP ADMIN" title="A connected view of your community.">
        Support new members and coordinate the next training day.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <Metrics
            items={[
              [data.pending, 'Applications awaiting review'],
              [data.activeMembers, 'Active memberships'],
              [data.activeCentres, 'Active centres'],
              [data.unpaidCharges, 'Unpaid charges'],
            ]}
          />
        )}
      </Resource>
      <div className="grid three">
        {[
          [
            'Review applications',
            'Check membership details and private evidence.',
            '/admin/enrolments',
          ],
          [
            'Coordinate classes',
            'Manage centre details and class availability.',
            '/admin/manage',
          ],
          [
            'See the bigger picture',
            'Cross-centre attendance and membership reporting.',
            '/admin/reports',
          ],
<<<<<<< HEAD
=======
          [
            'Review grading applications',
            'Approve or reject student grading applications.',
            '/admin/grading-applications',
          ],
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
        ].map(([title, text, to]) => (
          <Card title={title} key={to}>
            <p>{text}</p>
            <Link className="text-link" to={to}>
              Open workspace →
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
export function MembersPage() {
  const resource = useResource('/admin/members');
  const [search, setSearch] = useState('');
  return (
    <>
      <Heading eyebrow="MEMBERSHIP ADMIN" title="Your member directory.">
        A clear, searchable record of profiles and membership status.
      </Heading>
      <Field
        label="Search name, email or member number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Resource resource={resource}>
        {(data) => (
          <div className="grid two">
            {data
              .filter((m) =>
                `${m.name} ${m.email} ${m.memberNumber}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((m) => (
                <Card title={m.name} key={m.id}>
                  <Badge>{m.status || 'applicant'}</Badge>
                  <p>{m.email}</p>
                  <p>
                    {m.memberNumber || 'No member number'} · {m.beltName}
                  </p>
                  <p>{m.dojoName || 'No principal dojo'}</p>
                </Card>
              ))}
          </div>
        )}
      </Resource>
    </>
  );
}
export function CentreReportsPage() {
  const resource = useResource('/admin/reports');
  return (
    <>
      <Heading eyebrow="MEMBERSHIP ADMIN" title="See the whole journey.">
        Actual database summaries from fictional demonstration records.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <>
            <div className="grid three">
              {data.centres.map((c) => (
                <Card title={c.name} key={c.id}>
                  <strong className="metric">{c.verifiedVisits}</strong>
                  <p>Verified present visits</p>
                  <p>{c.members} active principal memberships</p>
                  <progress
                    value={c.verifiedVisits}
                    max={Math.max(1, ...data.centres.map((c) => c.verifiedVisits))}
                    aria-label={`${c.name} verified visits`}
                  />
                </Card>
              ))}
            </div>
            <Card title="Cross-centre attendance">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Training centre</th>
                      <th>Verified visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.attendance.map((r, i) => (
                      <tr key={i}>
                        <td>{r.studentName}</td>
                        <td>{r.dojoName}</td>
                        <td>{r.verifiedVisits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title="Applications by month">
              {data.monthly.map((m) => (
                <p key={m.month}>
                  {m.month} · {m.applications} applications
                </p>
              ))}
            </Card>
          </>
        )}
      </Resource>
    </>
  );
}
function WaiverForm({ charge, onDone }) {
  const [reason, setReason] = useState('');
  return (
    <>
      <Field
        label="Fee waiver reason (minimum 10 characters)"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <Action
        className="secondary"
        disabled={reason.trim().length < 10}
        run={() => mutate(`/admin/charges/${charge.id}/waive`, { reason })}
        onDone={onDone}
      >
        Record fee waiver & activate membership
      </Action>
    </>
  );
}
export function AdminPaymentsPage() {
  const resource = useResource('/admin/payments');
  return (
    <>
      <Heading eyebrow="MEMBERSHIP ADMIN" title="Fees and payment records.">
        Amounts are server-priced. A fee waiver is recorded separately from payment.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <div className="grid two">
            {data.length ? (
              data.map((c, i) => (
                <Card title={c.studentName} key={`${c.id}-${i}`}>
                  <p>{c.description}</p>
                  <strong className="price">{money(c.amount)}</strong>
                  <p>
                    <Badge>{c.status}</Badge> {c.demoFixture ? 'Illustrative fixture' : ''}
                  </p>
                  {c.attemptStatus && (
                    <p>
                      Attempt: {c.attemptStatus} ·{' '}
                      {c.providerSessionId || 'Demonstration fixture'}
                    </p>
                  )}
                  {c.status === 'pending' && (
                    <WaiverForm charge={c} onDone={resource.reload} />
                  )}
                </Card>
              ))
            ) : (
              <Empty />
            )}
          </div>
        )}
      </Resource>
    </>
  );
}
