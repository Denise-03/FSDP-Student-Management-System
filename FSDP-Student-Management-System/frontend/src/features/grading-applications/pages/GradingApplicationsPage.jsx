import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Action,
  Badge,
  Empty,
} from '../../../shared/components/ui.jsx';
import { mutate, dateTime } from '../../../shared/lib/api.js';
export default function GradingApplicationsPage() {
  const resource = useResource('/grading');
  return (
    <>
      <Heading title="Take your next step.">
        Applications are checked against your latest readiness and the event window.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <>
            <div className="grid two">
              {data.sessions.map((session) => (
                <Card title={session.name} key={session.id}>
                  <p>{dateTime(session.startsAt)}</p>
                  <p>
                    Applications: {dateTime(session.opensAt)} · {dateTime(session.closesAt)}
                  </p>
                  {data.applications.some((a) => a.gradingSessionId === session.id) ? (
                    <Badge>Application submitted</Badge>
                  ) : (
                    <Action
                      disabled={
                        new Date(session.closesAt) < new Date() ||
                        new Date(session.opensAt) > new Date()
                      }
                      run={() => mutate('/grading', { gradingSessionId: session.id })}
                      onDone={resource.reload}
                    >
                      Apply for grading
                    </Action>
                  )}
                </Card>
              ))}
            </div>
            <Card title="Your applications">
              {data.applications.length ? (
                data.applications.map((a) => (
                  <div className="list-row" key={a.id}>
                    <h3>{a.sessionName}</h3>
                    <Badge>{a.status}</Badge>
                    {a.feedback && (
                      <>
                        <p>
                          {a.result?.replaceAll('_', ' ')} · {a.feedback}
                        </p>
                        <p>
                          Signed by {a.acknowledgement} for further processing. No belt
                          promotion performed.
                        </p>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <Empty>No applications submitted yet.</Empty>
              )}
            </Card>
          </>
        )}
      </Resource>
    </>
  );
}
