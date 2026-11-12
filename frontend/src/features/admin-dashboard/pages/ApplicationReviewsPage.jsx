import { useState } from 'react';
import { useResource } from '../../../shared/hooks/useResource.js';
import { useApp } from '../../../app/providers.jsx';
import {
  Heading,
  Resource,
  Card,
  Field,
  Textarea,
  Action,
  Badge,
} from '../../../shared/components/ui.jsx';
import { mutate, dateTime } from '../../../shared/lib/api.js';
function ReviewDetail({ id, onDone }) {
  const resource = useResource(`/admin/applications/${id}`);
  const { catalogue } = useApp();
  const [form, setForm] = useState({
    reason: '',
    verifiedBelt: 0,
    rankStart: new Date().toISOString().slice(0, 10),
  });
  return (
    <Resource resource={resource}>
      {(data) => (
        <Card title={`Review · ${data.application.name}`}>
          <Badge>{data.application.status}</Badge>
          <p>{data.application.email}</p>
          <dl>
            {Object.entries(data.application.data).map(([key, value]) => (
              <div key={key}>
                <dt>{key.replaceAll(/([A-Z])/g, ' $1')}</dt>
                <dd>{String(value || '—')}</dd>
              </div>
            ))}
          </dl>
          <h3>Private supporting evidence</h3>
          {data.documents.length ? (
            data.documents.map((d) => (
              <p key={d.id}>
                <a className="text-link" href={`/api/enrolment/documents/${d.id}`} download>
                  {d.originalName} →
                </a>
              </p>
            ))
          ) : (
            <p>No documents uploaded.</p>
          )}
          {data.application.status === 'pending_review' && (
            <>
              <Resource resource={catalogue}>
                {(catalogue) => (
                  <Field
                    label="Verified belt (do not automatically accept claimed rank)"
                    value={form.verifiedBelt}
                    onChange={(e) =>
                      setForm({ ...form, verifiedBelt: Number(e.target.value) })
                    }
                  >
                    {catalogue.belts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </Field>
                )}
              </Resource>
              <Field
                label="Verified rank start date"
                type="date"
                value={form.rankStart}
                onChange={(e) => setForm({ ...form, rankStart: e.target.value })}
              />
              <Textarea
                label="Decision reason / requested changes"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                maxLength={1000}
              />
              <div className="row">
                {[
                  ['approve', 'Approve then payment'],
                  ['changes_requested', 'Request changes'],
                  ['rejected', 'Reject application'],
                ].map(([decision, label]) => (
                  <Action
                    key={decision}
                    className={decision === 'approve' ? 'red' : 'secondary'}
                    run={() =>
                      mutate(`/admin/applications/${id}/decision`, { ...form, decision })
                    }
                    onDone={() => {
                      resource.reload();
                      onDone();
                    }}
                  >
                    {label}
                  </Action>
                ))}
              </div>
            </>
          )}
          <h3>Decision audit</h3>
          {data.audit.map((entry, i) => (
            <p key={i}>
              {dateTime(entry.createdAt)} · {entry.action} · {entry.details}
            </p>
          ))}
        </Card>
      )}
    </Resource>
  );
}
export default function ApplicationReviewsPage() {
  const resource = useResource('/admin/applications');
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  return (
    <>
      <Heading eyebrow="MEMBERSHIP ADMIN" title="A thoughtful start for every member.">
        Review details, verify rank and explain each decision.
      </Heading>
      <div className="filters">
        <Field
          label="Search applicants"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Field
          label="Application status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            'All',
            'pending_review',
            'changes_requested',
            'approved_pending_payment',
            'active',
            'draft',
            'rejected',
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Field>
      </div>
      <div className="review-grid">
        <Resource resource={resource}>
          {(data) => (
            <Card title="Application queue">
              {data
                .filter(
                  (a) =>
                    (filter === 'All' || a.status === filter) &&
                    `${a.name} ${a.email}`.toLowerCase().includes(search.toLowerCase()),
                )
                .map((a) => (
                  <button
                    className={`queue-item ${selected === a.id ? 'selected' : ''}`}
                    key={a.id}
                    onClick={() => setSelected(a.id)}
                  >
                    <strong>{a.name}</strong>
                    <Badge>{a.status}</Badge>
                  </button>
                ))}
            </Card>
          )}
        </Resource>
        {selected ? (
          <ReviewDetail key={selected} id={selected} onDone={resource.reload} />
        ) : (
          <Card title="Choose an application">
            <p>Select a member from the queue to review their application.</p>
          </Card>
        )}
      </div>
    </>
  );
}
