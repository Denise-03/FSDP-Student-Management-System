import { useState } from 'react';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Field,
  Textarea,
  Action,
  Badge,
  Empty,
} from '../../../shared/components/ui.jsx';
import { mutate, dateTime } from '../../../shared/lib/api.js';

function GradingReviewCard({ application, onDone }) {
  const [reason, setReason] = useState(
    application.decisionReason || '',
  );

  const pending = application.status === 'pending';

  async function decide(decision) {
    return mutate(
      `/admin/grading-applications/${application.id}/decision`,
      {
        decision,
        reason,
      },
    );
  }

  return (
    <Card title={`${application.studentName} · ${application.sessionName}`}>
      <div className="row spread">
        <Badge>{application.status}</Badge>
        <small>{dateTime(application.createdAt)}</small>
      </div>

      <p>{application.email}</p>

      <dl>
        <div>
          <dt>Grading session</dt>
          <dd>{application.sessionName}</dd>
        </div>

        <div>
          <dt>Session date</dt>
          <dd>{dateTime(application.startsAt)}</dd>
        </div>

        <div>
          <dt>Venue</dt>
          <dd>{application.venue || 'Venue not specified'}</dd>
        </div>

        <div>
          <dt>Current grade</dt>
          <dd>{application.currentGrade || 'Not recorded'}</dd>
        </div>

        <div>
          <dt>Target grade</dt>
          <dd>{application.targetGrade || 'Not configured'}</dd>
        </div>
      </dl>

      <h3>Instructor assessment</h3>

      {application.instructorRecommendation ? (
        <>
          <Badge>{application.instructorRecommendation}</Badge>
          <p>{application.instructorFeedback}</p>

          <small>
            Acknowledged by{' '}
            {application.instructorAcknowledgement || 'instructor'}
          </small>
        </>
      ) : (
        <p>No instructor assessment has been submitted yet.</p>
      )}

      {pending ? (
        <>
          <Textarea
            label="Decision reason (optional; recommended for rejection)"
            value={reason}
            maxLength={1000}
            onChange={(event) => setReason(event.target.value)}
          />

          <div className="row">
            <Action
              className="red"
              run={() => decide('approved')}
              onDone={onDone}
            >
              Approve application
            </Action>

            <Action
              className="secondary"
              disabled={!reason.trim()}
              run={() => decide('rejected')}
              onDone={onDone}
            >
              Reject application
            </Action>
          </div>
        </>
      ) : (
        <>
          {application.decisionReason && (
            <p>Decision reason: {application.decisionReason}</p>
          )}

          <p>
            Reviewed:{' '}
            {application.reviewedAt
              ? dateTime(application.reviewedAt)
              : '—'}
          </p>
        </>
      )}
    </Card>
  );
}

export default function GradingApplicationReviewsPage() {
  const resource = useResource('/admin/grading-applications');
  const [filter, setFilter] = useState('pending');

  return (
    <>
      <Heading
        eyebrow="GRADING ADMIN"
        title="Review grading applications."
      >
        Review the student's application and instructor recommendation
        before recording the final decision.
      </Heading>

      <Field
        label="Application status"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option value="pending">Pending review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="all">All applications</option>
      </Field>

      <Resource resource={resource}>
        {(applications) => {
          const visible = applications.filter(
            (application) =>
              filter === 'all' ||
              application.status === filter,
          );

          return visible.length ? (
            <div className="grid two">
              {visible.map((application) => (
                <GradingReviewCard
                  key={application.id}
                  application={application}
                  onDone={resource.reload}
                />
              ))}
            </div>
          ) : (
            <Empty>
              No grading applications match this filter.
            </Empty>
          );
        }}
      </Resource>
    </>
  );
}