import { Link } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import { Heading, Card, Resource, Badge, Action } from '../../../shared/components/ui.jsx';
export default function ApplicationStatusPage() {
  const resource = useResource('/enrolment');
  const { refreshUser } = useApp();
  return (
    <div className="section narrow">
      <Heading title="Every step, in one place.">
        Track your application and what happens next.
      </Heading>
      <Resource resource={resource}>
        {({ application }) => (
          <Card title="Membership application">
            {application ? (
              <>
                <Badge>{application.status}</Badge>
                <p>{application.reason || 'Your application status is shown above.'}</p>
                <ol className="timeline">
                  <li>Create an account and submit your application</li>
                  <li>Administrator reviews membership and claimed rank</li>
                  <li>Pay approved charge or receive a documented fee waiver</li>
                  <li>Active membership unlocks suitable class bookings</li>
                </ol>
                {['draft', 'changes_requested'].includes(application.status) && (
                  <Link className="button" to="/enrolment">
                    Continue application →
                  </Link>
                )}
                {application.status === 'approved_pending_payment' && (
                  <Link className="button red" to="/payments">
                    View charge & checkout →
                  </Link>
                )}
                {application.status === 'active' && (
                  <Link className="button" to="/student/classes">
                    Return to class booking →
                  </Link>
                )}
              </>
            ) : (
              <>
                <p>You have not started your membership application.</p>
                <Link className="button red" to="/enrolment">
                  Start application
                </Link>
              </>
            )}
            <Action
              className="secondary"
              run={async () => {
                await refreshUser();
                resource.reload();
                return { message: 'Status refreshed from server.' };
              }}
            >
              Refresh application status
            </Action>
          </Card>
        )}
      </Resource>
    </div>
  );
}
