import { Link } from 'react-router-dom';
import { useApp } from '../../../app/providers.jsx';
import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Card,
  Resource,
  Metrics,
  ReadinessCard,
} from '../../../shared/components/ui.jsx';
import { dateTime } from '../../../shared/lib/api.js';
export default function StudentDashboardPage() {
  const { user } = useApp();
  const resource = useResource('/student', 5000);
  return (
    <>
      <Heading title={`Welcome back, ${user?.name.split(' ')[0]}.`}>
        A little practice. A little progress. Your journey continues.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <>
            <Metrics
              items={[
                [data.readiness.total, 'Qualifying sessions'],
                [data.readiness.centres.length, 'Training centres'],
                [data.bookings.length, 'Upcoming bookings'],
                [data.readiness.profile?.membershipStatus || 'applicant', 'Membership'],
              ]}
            />
            <div className="grid two">
              <ReadinessCard state={data.readiness} />
              <Card title="Next on your calendar">
                {data.bookings.length ? (
                  data.bookings.slice(0, 3).map((b) => (
                    <div className="list-row" key={b.id}>
                      <h3>{b.className}</h3>
                      <p>{b.dojoName}</p>
                      <p>{dateTime(b.startsAt)}</p>
                    </div>
                  ))
                ) : (
                  <p>Make space for your next practice.</p>
                )}
                <Link className="button" to="/student/classes">
                  Find a class →
                </Link>
              </Card>
            </div>
            <Card title="Your latest updates">
              {data.notifications.map((n) => (
                <div className="list-row" key={n.id}>
                  <p>{n.message}</p>
                  <small>{dateTime(n.createdAt)}</small>
                </div>
              ))}
              <Link className="text-link" to="/student/notifications">
                All notifications →
              </Link>
            </Card>
          </>
        )}
      </Resource>
    </>
  );
}
