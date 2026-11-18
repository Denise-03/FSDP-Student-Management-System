import { useResource } from '../../../shared/hooks/useResource.js';
import {
  Heading,
  Resource,
  Card,
  Action,
  Badge,
  Empty,
} from '../../../shared/components/ui.jsx';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
=======
>>>>>>> 9ae1f96d3ab84d0cac50e53b0bfbe3ea036f12f2
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
<<<<<<< HEAD
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
=======
                  {!n.readAt && (
                    <Action
                      className="secondary"
                      run={() => mutate(`/notifications/${n.id}/read`, {}, 'PATCH')}
                      onDone={resource.reload}
                    >
                      Mark as read
                    </Action>
                  )}
>>>>>>> 9ae1f96d3ab84d0cac50e53b0bfbe3ea036f12f2
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
