import { useParams } from 'react-router-dom';
import { useResource } from '../../../shared/hooks/useResource.js';
import { Heading, Resource, Card, Action, Badge } from '../../../shared/components/ui.jsx';
import { mutate, dateTime } from '../../../shared/lib/api.js';
export default function InstructorTakeAttendancePage() {
  const { sessionId } = useParams();
  const resource = useResource(`/attendance/sessions/${sessionId}`);
  const external = useResource('/attendance/external/review');
  return (
    <>
      <Heading eyebrow="INSTRUCTOR PORTAL" title="Every record matters.">
        Verify present or absent. Corrections update the same record and keep an audit
        trail.
      </Heading>
      <Resource resource={resource}>
        {(data) => (
          <Card title={`${data.session.className} - ${data.session.dojoName}`}>
            <p>{dateTime(data.session.startsAt)}</p>
            {data.roster.length ? (
              data.roster.map((student) => (
                <div className="list-row row spread" key={student.id}>
                  <div>
                    <h3>{student.name}</h3>
                    <Badge>{student.status || 'unmarked'}</Badge>
                  </div>
                  <div className="row">
                    {['present', 'absent'].map((status) => (
                      <Action
                        key={status}
                        className={status === 'absent' ? 'secondary' : ''}
                        disabled={new Date(data.session.startsAt) > new Date()}
                        run={() =>
                          mutate(
                            `/attendance/sessions/${sessionId}`,
                            { studentId: student.id, status },
                            'PUT',
                          )
                        }
                        onDone={resource.reload}
                      >
                        Mark {status}
                      </Action>
                    ))}
                    {student.status && (
                      <Action
                        className="secondary"
                        onDone={resource.reload}
                        run={() =>
                          mutate(
                            `/attendance/sessions/${sessionId}/${student.id}`,
                            undefined,
                            'DELETE',
                          )
                        }
                      >
                        Remove incorrect record
                      </Action>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No confirmed bookings for this session.</p>
            )}
          </Card>
        )}
      </Resource>
      <Card title="External training awaiting verification">
        <Resource resource={external}>
          {(data) =>
            data.length ? (
              data.map((record) => (
                <div className="list-row" key={record.id}>
                  <h3>
                    {record.studentName} · {record.centre}
                  </h3>
                  <p>
                    {record.eventKey} · {dateTime(record.happenedAt)}
                  </p>
                  <Badge>{record.verifiedBy ? 'verified' : 'pending verification'}</Badge>
                  <div className="row">
                    <Action
                      run={() =>
                        mutate(
                          `/attendance/external/${record.id}/verify`,
                          { qualifying: true },
                          'PATCH',
                        )
                      }
                      onDone={external.reload}
                    >
                      Verify qualifying training
                    </Action>
                    <Action
                      className="secondary"
                      run={() =>
                        mutate(
                          `/attendance/external/${record.id}/verify`,
                          { qualifying: false },
                          'PATCH',
                        )
                      }
                      onDone={external.reload}
                    >
                      Mark nonqualifying
                    </Action>
                  </div>
                </div>
              ))
            ) : (
              <p>No external training records for assigned students.</p>
            )
          }
        </Resource>
      </Card>
    </>
  );
}
