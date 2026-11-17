import { useState } from 'react';
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
import { dateTime, mutate } from '../../../shared/lib/api.js';
export default function StudentAttendanceHistoryPage() {
  const resource = useResource('/attendance/mine');
  const [centre, setCentre] = useState('All');
  const [form, setForm] = useState({ eventKey: 'external:', centre: '', happenedAt: '' });
  return (
    <>
      <Heading title="Every practice, connected.">
        Verified attendance across all your training centres.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <>
            <Metrics
              items={[
                [data.total, 'Qualifying sessions'],
                [data.centres.length, 'Qualifying centres'],
                [data.records.filter((r) => !r.verifiedBy).length, 'Awaiting verification'],
              ]}
            />
            <Field
              label="Filter attendance centre"
              value={centre}
              onChange={(e) => setCentre(e.target.value)}
            >
              <option>All</option>
              {[...new Set(data.records.map((r) => r.centre))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Field>
            <div className="session-list">
              {data.records
                .filter((r) => centre === 'All' || r.centre === centre)
                .map((record) => (
                  <Card key={record.id}>
                    <div className="row spread">
                      <div>
                        <h3>{record.centre}</h3>
                        <p>{dateTime(record.happenedAt)}</p>
                      </div>
                      <Badge>{record.verifiedBy ? record.status : 'unverified'}</Badge>
                    </div>
                    <p>
                      {record.qualifying
                        ? 'Qualifying training category'
                        : 'Not qualifying'}{' '}
                      ·{' '}
                      {record.verifiedBy
                        ? 'Instructor verified'
                        : 'Awaiting authorised instructor review'}
                    </p>
                  </Card>
                ))}
              {!data.records.length && <Empty />}
            </div>
          </>
        )}
      </Resource>
      <Card title="Submit external training">
        <p>
          Use the organiser’s unique event reference. A repeated event cannot count again.
          An assigned instructor must verify it.
        </p>
        <div className="grid two">
          {['eventKey', 'centre', 'happenedAt'].map((key) => (
            <Field
              key={key}
              label={
                {
                  eventKey: 'Unique event reference (external:...)',
                  centre: 'External training centre',
                  happenedAt: 'Training date and time',
                }[key]
              }
              type={key === 'happenedAt' ? 'datetime-local' : 'text'}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>
        <Action
          disabled={!form.happenedAt}
          run={() =>
            mutate('/attendance/external', {
              ...form,
              happenedAt: new Date(form.happenedAt).toISOString(),
            })
          }
          onDone={resource.reload}
        >
          Submit for verification
        </Action>
      </Card>
    </>
  );
}
