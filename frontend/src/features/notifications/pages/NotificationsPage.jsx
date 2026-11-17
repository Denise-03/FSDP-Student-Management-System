import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Action,
  Badge,
  Empty,
} from '../../../shared/components/ui.jsx';
import { Link } from 'react-router-dom';
import { mutate, dateTime } from '../../../shared/lib/api.js';
export default function NotificationsPage() {
  const resource = useResource('/notifications');
  return (
    <>
      <Heading title="Stay connected.">
        Membership, classes and milestones, in one place.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <div className="session-list">
            {data.length ? (
              data.map((n) => (
                <Card key={n.id}>
                  <div className="row spread">
                    <p>{n.message}</p>
                    <Badge>{n.readAt ? 'Read' : 'Unread'}</Badge>
                  </div>
                  <small>{dateTime(n.createdAt)}</small>
                  {n.relatedType === 'grading_application' && n.relatedId && (
                  <p>
                <Link className="text-link" to={`/student/grading-applications#application-${n.relatedId}`}>
                View grading application 
                </Link>
                </p>
              )}
              
              {!n.readAt && (
                <Action
                className="secondary"
                run={() => mutate(`/notifications/${n.id}/read`, {}, 'PATCH')}
                onDone={resource.reload}
                >
                  Mark as read
                  </Action>
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
