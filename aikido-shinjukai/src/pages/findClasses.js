
import React, { useEffect, useState } from "react";
import "../styles/findClasses.css";

const STUDENT_ID = 1; // Temporary student ID for testing

function FindClasses() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Retrieve classes from the backend
    async function fetchClasses() {
        try {
            setLoading(true);

            const response = await fetch("/api/classes");
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to retrieve classes.");
            }

            setClasses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchClasses();
    }, []);

    // Enrol student in a selected class
    async function handleEnrol(classSessionId) {
        try {
            setEnrollingId(classSessionId);
            setMessage("");
            setError("");

            const response = await fetch("/api/classes/enrol", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    studentId: STUDENT_ID,
                    classSessionId: classSessionId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Enrolment failed.");
            }

            setMessage(data.message);
            await fetchClasses();

        } catch (err) {
            setError(err.message);
        } finally {
            setEnrollingId(null);
        }
    }

    // Format class date and time
    function formatDate(date) {
        return new Date(date).toLocaleDateString("en-SG", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    function formatTime(date) {
        return new Date(date).toLocaleTimeString("en-SG", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    return (
        <div className="find-classes-container">
            <div className="find-classes-header">
                <h1>Find Classes</h1>
                <p>Browse and enrol in classes across our participating dojos.</p>
            </div>

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <p>Loading classes...</p>
            ) : classes.length === 0 ? (
                <p>No scheduled classes are currently available.</p>
            ) : (
                <div className="class-list">
                    {classes.map((classItem) => {
                        const spacesLeft =
                            classItem.Capacity - classItem.EnrolledCount;

                        const isFull = spacesLeft <= 0;

                        return (
                            <div
                                className="class-card"
                                key={classItem.ClassSessionId}
                            >
                                <div className="class-card-details">
                                    <h2>{classItem.Title}</h2>

                                    <p>
                                        <strong>Dojo:</strong>{" "}
                                        {classItem.DojoName}
                                    </p>

                                    <p>
                                        <strong>Address:</strong>{" "}
                                        {classItem.DojoAddress}
                                    </p>

                                    <p>
                                        <strong>Date:</strong>{" "}
                                        {formatDate(classItem.StartsAtLocal)}
                                    </p>

                                    <p>
                                        <strong>Time:</strong>{" "}
                                        {formatTime(classItem.StartsAtLocal)}
                                        {" - "}
                                        {formatTime(classItem.EndsAtLocal)}
                                    </p>

                                    <p>
                                        <strong>Available spaces:</strong>{" "}
                                        {Math.max(spacesLeft, 0)} / {classItem.Capacity}
                                    </p>
                                </div>

                                <button
                                    className="enrol-button"
                                    onClick={() =>
                                        handleEnrol(classItem.ClassSessionId)
                                    }
                                    disabled={isFull || enrollingId !== null}
                                >
                                    {enrollingId === classItem.ClassSessionId
                                        ? "Enrolling..."
                                        : isFull
                                        ? "Class Full"
                                        : "Enrol"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default FindClasses;
