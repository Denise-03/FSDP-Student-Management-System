import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Metrics,
  Badge,
  Field,
  ReadinessCard,
  Action,
} from '../../../shared/components/ui.jsx';
import { dateTime, mutate } from '../../../shared/lib/api.js';
export function InstructorDashboardPage() {
  const { user } = useApp();
<<<<<<< HEAD
  const resource = useResource('/instructor');
=======
  const resource = useResource('/instructor', 5000);
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
  return (
    <>
      <Heading
        eyebrow="INSTRUCTOR PORTAL"
        title={`Good to see you, ${user?.name.split(' ')[0]}.`}
      >
        Your classes. Your students. Their next milestone.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <>
            <Metrics
              items={[
                [data.sessions.length, 'Assigned sessions'],
                [data.students.length, 'Assigned students'],
                [
                  data.students.filter((s) => s.readiness.eligible).length,
                  'Eligible students',
                ],
                [
                  data.students.filter((s) => s.lowAttendance).length,
                  'Follow-up suggested',
                ],
              ]}
            />
            <div className="grid two">
              <Card title="Your class sessions">
                {data.sessions.map((s) => (
                  <div className="list-row" key={s.id}>
                    <div className="row spread">
                      <div>
                        <h3>{s.className}</h3>
                        <p>{s.dojoName}</p>
                        <p>
                          {dateTime(s.startsAt)} · {s.booked} booked
                        </p>
                      </div>
                      <Link
                        className="button secondary"
                        to={`/instructor/classes/${s.id}/attendance`}
                      >
                        Open roster →
                      </Link>
                    </div>
                  </div>
                ))}
              </Card>
              <Card title="Student milestones">
                {data.students.map((s) => (
                  <div className="list-row" key={s.id}>
                    <h3>{s.name}</h3>
                    <p>
                      {s.readiness.total} / {s.readiness.rule?.minSessions || '—'} sessions
                    </p>
                    <Badge>
                      {s.readiness.eligible
                        ? 'eligible'
                        : s.lowAttendance
                          ? 'follow-up suggested'
                          : 'in progress'}
                    </Badge>
                  </div>
                ))}
                <Link className="text-link" to="/instructor/students">
                  Explore student progress →
                </Link>
              </Card>
            </div>
          </>
        )}
      </Resource>
    </>
  );
}
<<<<<<< HEAD
export function StudentProgressPage() {
  const resource = useResource('/instructor');
=======
function PerformanceReview({ student, onDone }) {
  const [passed, setPassed] = useState('true');
  const [feedback, setFeedback] = useState('');
  return (
    <Card title="Training performance review">
      <p>
        Record an instructor endorsement for this student's current belt.
      </p>
      <Field
        label="Performance"
        value={passed}
        onChange={(e) => setPassed(e.target.value)}
      >
        <option value="true">Good performance confirmed</option>
        <option value="false">Further training needed</option>
      </Field>
      <Field
        label="Feedback"
        value={feedback}
        maxLength={500}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <Action
        run={() =>
          mutate(`/instructor/students/${student.id}/performance`, {
            passed: passed === 'true',
            feedback,
          }, 'PUT')
        }
        onDone={onDone}
      >
        Save performance review
      </Action>
    </Card>
  );
}
export function StudentProgressPage() {
  const resource = useResource('/instructor', 5000);
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
  const [search, setSearch] = useState('');
  return (
    <>
      <Heading eyebrow="INSTRUCTOR PORTAL" title="Support every student’s journey.">
        Cross-centre activity is included before suggesting a follow-up.
      </Heading>
      <Field
        label="Search assigned students"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Resource resource={resource}>
        {(data) => (
          <div className="grid two">
            {data.students
              .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
              .map((s) => (
                <div key={s.id}>
                  <h2>{s.name}</h2>
<<<<<<< HEAD
                  <ReadinessCard state={s.readiness} />
=======
                  <ReadinessCard state={s.readiness} />                
                  {s.readiness.checks?.some(
                    (check) => check.code === 'performance'
                  ) && (
                    <PerformanceReview
                      student={s}
                      onDone={resource.reload}
                    />
                  )}
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
                  <Card title="Recent engagement">
                    <p>
                      {s.recent} verified visits in the last 30 days across all centres and
                      external training.
                    </p>
                    <Badge>
                      {s.lowAttendance ? 'follow-up suggested' : 'Training regularly'}
                    </Badge>
                    {s.lowAttendance && (
                      <Action
                        className="secondary"
                        run={() => mutate(`/instructor/students/${s.id}/follow-up`, {})}
                      >
                        Send supportive in-app reminder
                      </Action>
                    )}
                  </Card>
                </div>
              ))}
          </div>
        )}
      </Resource>
    </>
  );
}
