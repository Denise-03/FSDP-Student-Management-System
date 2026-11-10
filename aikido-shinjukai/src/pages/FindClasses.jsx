import { useEffect, useMemo, useState } from "react";
import "../styles/findClasses.css";

// Temporary prototype ID. Replace with the authenticated student's ID after login integration.
const STUDENT_ID = 1;

function parseLocalDate(value) {
    if (!value) return null;

    // SQL returns a local datetime string (YYYY-MM-DD HH:mm) to avoid timezone shifts.
    const normalized = String(value).replace(" ", "T");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
    const date = parseLocalDate(value);
    return date
        ? date.toLocaleDateString("en-SG", {
              weekday: "short",
              day: "numeric",
              month: "short",
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

function FindClasses() {
    const [classes, setClasses] = useState([]);
    const [selectedDojo, setSelectedDojo] = useState("all");
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function fetchClasses() {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`/api/classes?studentId=${STUDENT_ID}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to retrieve classes.");
            }

            setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    const dojos = useMemo(() => {
        const uniqueDojos = new Map();
        classes.forEach((classItem) => {
            uniqueDojos.set(classItem.DojoId, {
                DojoId: classItem.DojoId,
                DojoName: classItem.DojoName,
            });
        });
        return Array.from(uniqueDojos.values()).sort((a, b) =>
            a.DojoName.localeCompare(b.DojoName)
        );
    }, [classes]);

    const filteredClasses = useMemo(
        () =>
            selectedDojo === "all"
                ? classes
                : classes.filter(
                      (classItem) => classItem.DojoId === Number(selectedDojo)
                  ),
        [classes, selectedDojo]
    );

    async function handleEnrol(classSessionId) {
        try {
            setEnrollingId(classSessionId);
            setMessage("");
            setError("");

            const response = await fetch("/api/classes/enrol", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: STUDENT_ID,
                    classSessionId,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Enrolment failed.");
            }

            setMessage(data.message || "Successfully enrolled in class.");
            await fetchClasses();
        } catch (err) {
            setError(err.message || "Unable to complete enrolment.");
        } finally {
            setEnrollingId(null);
        }
    }

    return (
        <main className="feature-page find-classes-page">
            <div className="feature-page-heading">
                <div>
                    <p className="feature-eyebrow">TRAIN ACROSS OUR DOJOS</p>
                    <h1>Find Classes</h1>
                    <p className="feature-description">
                        Explore upcoming sessions and enrol at any participating dojo.
                    </p>
                </div>
                <a className="feature-secondary-link" href="/my-training-schedule.html">
                    My Training Schedule <span aria-hidden="true">→</span>
                </a>
            </div>

            <section className="class-filter-panel" aria-label="Class filters">
                <label htmlFor="dojo-filter">Choose a dojo</label>
                <select
                    id="dojo-filter"
                    value={selectedDojo}
                    onChange={(event) => setSelectedDojo(event.target.value)}
                >
                    <option value="all">All participating dojos</option>
                    {dojos.map((dojo) => (
                        <option key={dojo.DojoId} value={dojo.DojoId}>
                            {dojo.DojoName}
                        </option>
                    ))}
                </select>
                <button
                    className="feature-refresh-button"
                    type="button"
                    onClick={fetchClasses}
                    disabled={loading}
                >
                    Refresh classes
                </button>
            </section>

            {message && <div className="feature-alert feature-alert-success" role="status">{message}</div>}
            {error && <div className="feature-alert feature-alert-error" role="alert">{error}</div>}

            {loading ? (
                <p className="feature-empty-state">Loading available classes...</p>
            ) : filteredClasses.length === 0 ? (
                <div className="feature-empty-state">
                    <h2>No upcoming classes found</h2>
                    <p>Try selecting another dojo or check again later.</p>
                </div>
            ) : (
                <>
                    <div className="class-results-heading">
                        <h2>{selectedDojo === "all" ? "Upcoming classes" : "Classes at selected dojo"}</h2>
                        <span>{filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"}</span>
                    </div>
                    <div className="class-results-grid">
                        {filteredClasses.map((classItem) => {
                            const spacesLeft = Math.max(
                                0,
                                Number(classItem.Capacity) - Number(classItem.EnrolledCount)
                            );
                            const isFull = spacesLeft <= 0;
                            const isEnrolled = Boolean(classItem.IsEnrolled);

                            return (
                                <article className="class-result-card" key={classItem.ClassSessionId}>
                                    <div className="class-card-topline">
                                        <span className="class-dojo-label">{classItem.DojoName}</span>
                                        <span className={`class-availability ${isEnrolled ? "is-enrolled" : isFull ? "is-full" : "is-available"}`}>
                                            {isEnrolled ? "Enrolled" : isFull ? "Class full" : "Available"}
                                        </span>
                                    </div>
                                    <h3>{classItem.Title}</h3>
                                    <p className="class-session-code">{classItem.SessionCode}</p>
                                    <div className="class-detail-list">
                                        <p><span>Date</span><strong>{formatDate(classItem.StartsAtLocalText || classItem.StartsAtLocal)}</strong></p>
                                        <p><span>Time</span><strong>{formatTime(classItem.StartsAtLocalText || classItem.StartsAtLocal)} – {formatTime(classItem.EndsAtLocalText || classItem.EndsAtLocal)}</strong></p>
                                        <p><span>Location</span><strong>{classItem.DojoAddress}</strong></p>
                                        <p><span>Spaces left</span><strong>{spacesLeft} of {classItem.Capacity}</strong></p>
                                    </div>
                                    <button
                                        className="class-enrol-button"
                                        type="button"
                                        onClick={() => handleEnrol(classItem.ClassSessionId)}
                                        disabled={isFull || isEnrolled || enrollingId !== null}
                                    >
                                        {enrollingId === classItem.ClassSessionId
                                            ? "Enrolling..."
                                            : isEnrolled
                                              ? "Already enrolled"
                                              : isFull
                                                ? "Class full"
                                                : "Enrol in this class"}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </main>
    );
}

export default FindClasses;
