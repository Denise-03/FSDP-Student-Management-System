import { useEffect, useState } from "react";
import "../styles/myTrainingSchedule.css";

//Replace with authenticated students ID after login integration.
const STUDENT_ID = 1;

function parseLocalDate(value) {
    if (!value) return null;
    const date = new Date(String(value).replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
    const date = parseLocalDate(value);
    return date
        ? date.toLocaleDateString("en-SG", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Date unavailable";
}

function formatTime(value) {
    const date = parseLocalDate(value);
    return date
        ? date.toLocaleTimeString("en-SG", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
          })
        : "Time unavailable";
}

function MyTrainingSchedule() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function fetchSchedule() {
        try {
            setLoading(true);
            setError("");
            const response = await fetch(`/api/classes/student/${STUDENT_ID}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to retrieve your schedule.");
            }

            setSessions(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSchedule();
    }, []);

    return (
        <main className="feature-page training-schedule-page">
        <div className="schedule-navigation">
            <a className="feature-secondary-link" href="/">
                <span aria-hidden="true">←</span> Back to Dashboard
            </a>
        </div>

        <div className="feature-page-heading">
                <div>
                    <p className="feature-eyebrow">YOUR CENTRAL TRAINING RECORD</p>
                    <h1>My Training Schedule</h1>
                    <p className="feature-description">
                        See your enrolled sessions across all participating dojos in one place.
                    </p>
                </div>
                <a className="feature-secondary-link" href="/find-classes.html">
                    <span aria-hidden="true">←</span> Find more classes
                </a>
            </div>

            {error && <div className="feature-alert feature-alert-error" role="alert">{error}</div>}

            {loading ? (
                <p className="feature-empty-state">Loading your training schedule...</p>
            ) : sessions.length === 0 ? (
                <div className="feature-empty-state">
                    <h2>You have no enrolled classes yet</h2>
                    <p>Browse classes at different dojos and enrol in a session to see it here.</p>
                    <a className="schedule-primary-link" href="/find-classes.html">Find classes</a>
                </div>
            ) : (
                <>
                    <div className="schedule-summary">
                        <strong>{sessions.length}</strong>
                        <span>{sessions.length === 1 ? "enrolled session" : "enrolled sessions"} across your dojos</span>
                    </div>
                    <div className="schedule-session-list">
                        {sessions.map((session) => (
                            <article className="schedule-session-card" key={session.ClassEnrolmentId}>
                                <div className="schedule-date-block">
                                    <span>{formatDate(session.StartsAtLocalText || session.StartsAtLocal).split(",")[0]}</span>
                                    <strong>{parseLocalDate(session.StartsAtLocalText || session.StartsAtLocal)?.getDate() || "—"}</strong>
                                </div>
                                <div className="schedule-session-info">
                                    <div className="schedule-session-heading">
                                        <div>
                                            <h2>{session.Title}</h2>
                                            <p>{session.DojoName}</p>
                                        </div>
                                        <span className={`schedule-status ${session.ClassStatus === "Completed" ? "completed" : "scheduled"}`}>
                                            {session.ClassStatus}
                                        </span>
                                    </div>
                                    <p className="schedule-session-time">
                                        {formatDate(session.StartsAtLocalText || session.StartsAtLocal)} · {formatTime(session.StartsAtLocalText || session.StartsAtLocal)} – {formatTime(session.EndsAtLocalText || session.EndsAtLocal)}
                                    </p>
                                    <p className="schedule-session-address">{session.DojoAddress}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}

export default MyTrainingSchedule;
