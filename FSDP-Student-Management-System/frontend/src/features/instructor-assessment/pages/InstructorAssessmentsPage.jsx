import { useState } from 'react';
import { useApp } from '../../../app/providers.jsx';
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
function AssessmentForm({ candidate, onDone }) {
  const { user } = useApp();
  const [form, setForm] = useState({
    result: 'recommend_pass',
    feedback: '',
    acknowledgement: '',
  });
  return (
    <Card title={`${candidate.studentName} - ${candidate.sessionName}`}>
      <p>{dateTime(candidate.startsAt)}</p>
      <Badge>{candidate.status}</Badge>
      {candidate.status === 'assessed' ? (
        <>
          <p>
            {candidate.result?.replaceAll('_', ' ')} · {candidate.feedback}
          </p>
          <p>
            Signed by {candidate.acknowledgement}; {candidate.timeInRankDays} days in rank.
          </p>
        </>
      ) : (
        <>
          <p>
            Time in rank is calculated from the verified rank start (
            {candidate.rankStart?.slice(0, 10)}) at the event date.
          </p>
          <Field
            label="Assessment recommendation"
            value={form.result}
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          >
            <option value="recommend_pass">Recommend pass for further processing</option>
            <option value="further_training">Needs further training</option>
          </Field>
          <Textarea
            label="Instructor feedback"
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            minLength={10}
            maxLength={2000}
          />
          <Field
            label={`Digital acknowledgement - type ${user?.name}`}
            value={form.acknowledgement}
            onChange={(e) => setForm({ ...form, acknowledgement: e.target.value })}
          />
          <Action
            className="red"
            disabled={new Date(candidate.startsAt) > new Date()}
            run={() => mutate(`/assessments/${candidate.id}`, form)}
            onDone={onDone}
          >
            Sign & submit for further processing
          </Action>
        </>
      )}
    </Card>
  );
}
export default function InstructorAssessmentsPage() {
  const resource = useResource('/assessments');
  return (
    <>
      <Heading eyebrow="INSTRUCTOR PORTAL" title="Recognise progress with care.">
        Signed recommendations are retained for further processing. They never automatically
        promote a student.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <div className="grid two">
            {data.length ? (
              data.map((c) => (
                <AssessmentForm key={c.id} candidate={c} onDone={resource.reload} />
              ))
            ) : (
              <Empty>No assigned grading candidates.</Empty>
            )}
          </div>
        )}
      </Resource>
    </>
  );
}
