
import { useState } from "react";
import "../styles/gradingApplications.css";

// Temp sample data.
const sampleApplications = [
    {
        GradingApplicationId: 1,
        TargetGradeName: "6th Kyu",
        SubmittedAtUtc: "2026-11-05T10:30:00",
        GradingSessionName: "December 2026 Grading",
        Status: "Pending",
        RejectionReason: null,
    },
    {
        GradingApplicationId: 2,
        TargetGradeName: "5th Kyu",
        SubmittedAtUtc: "2026-09-20T14:00:00",
        GradingSessionName: "October 2026 Grading",
        Status: "Approved",
        RejectionReason: null,
    },
    {
        GradingApplicationId: 3,
        TargetGradeName: "4th Kyu",
        SubmittedAtUtc: "2026-08-12T09:15:00",
        GradingSessionName: "September 2026 Grading",
        Status: "Rejected",
        RejectionReason:
            "Insufficient qualifying training sessions. Please attend more classes before reapplying.",
    },
];

function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function GradingApplications() {
    const [applications] = useState(sampleApplications);
    const [selectedFilter, setSelectedFilter] = useState("All");

    const pendingCount = applications.filter(
        (application) => application.Status === "Pending"
    ).length;

    const approvedCount = applications.filter(
        (application) => application.Status === "Approved"
    ).length;

    const rejectedCount = applications.filter(
        (application) => application.Status === "Rejected"
    ).length;

    const filteredApplications =
        selectedFilter === "All"
            ? applications
            : applications.filter(
                  (application) => application.Status === selectedFilter
              );

    return (
        <main className="feature-page grading-applications-page">
            <div className="grading-navigation">
                <a className="feature-secondary-link" href="/">
                    <span aria-hidden="true">←</span> Back to Dashboard
                </a>
            </div>

            <div className="feature-page-heading">
                <div>
                    <p className="feature-eyebrow">
                        YOUR GRADING PROGRESS
                    </p>
                    <h1>My Grading Applications</h1>
                    <p className="feature-description">
                        View your submitted grading applications and track
                        their approval status.
                    </p>
                </div>
            </div>

            {/* Application status summary */}
            <div className="grading-summary">
                <div className="grading-summary-card">
                    <span className="grading-summary-label">Total Applications</span>
                    <strong>{applications.length}</strong>
                </div>

                <div className="grading-summary-card pending-summary">
                    <span className="grading-summary-label">Pending</span>
                    <strong>{pendingCount}</strong>
                </div>

                <div className="grading-summary-card approved-summary">
                    <span className="grading-summary-label">Approved</span>
                    <strong>{approvedCount}</strong>
                </div>

                <div className="grading-summary-card rejected-summary">
                    <span className="grading-summary-label">Rejected</span>
                    <strong>{rejectedCount}</strong>
                </div>
            </div>

            {/* Application filters */}
            <div className="grading-filter-section">
                <h2>Submitted Applications</h2>

                <div className="grading-filter-buttons">
                    {["All", "Pending", "Approved", "Rejected"].map(
                        (filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={`grading-filter-button ${
                                    selectedFilter === filter ? "active" : ""
                                }`}
                                onClick={() => setSelectedFilter(filter)}
                            >
                                {filter}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Application list */}
            {filteredApplications.length === 0 ? (
                <div className="feature-empty-state">
                    <h2>No applications found</h2>
                    <p>
                        You do not have any applications with this status.
                    </p>
                </div>
            ) : (
                <div className="grading-application-list">
                    {filteredApplications.map((application) => (
                        <article
                            className="grading-application-card"
                            key={application.GradingApplicationId}
                        >
                            <div className="grading-application-heading">
                                <div>
                                    <p className="grading-application-label">
                                        TARGET BELT GRADE
                                    </p>
                                    <h2>{application.TargetGradeName}</h2>
                                </div>

                                <span
                                    className={`grading-status-badge ${application.Status.toLowerCase()}`}
                                >
                                    {application.Status}
                                </span>
                            </div>

                            <div className="grading-application-details">
                                <div>
                                    <span>Application ID</span>
                                    <strong>
                                        #{application.GradingApplicationId}
                                    </strong>
                                </div>

                                <div>
                                    <span>Submitted on</span>
                                    <strong>
                                        {formatDate(application.SubmittedAtUtc)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Grading session</span>
                                    <strong>
                                        {application.GradingSessionName}
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={`grading-status-message ${application.Status.toLowerCase()}-message`}
                            >
                                {application.Status === "Pending" && (
                                    <>
                                        <strong>Application under review</strong>
                                        <p>
                                            Your application has been submitted
                                            and is awaiting administrator review.
                                        </p>
                                    </>
                                )}

                                {application.Status === "Approved" && (
                                    <>
                                        <strong>Application approved</strong>
                                        <p>
                                            Your grading application has been
                                            approved. Please check with your dojo
                                            for the next steps.
                                        </p>
                                    </>
                                )}

                                {application.Status === "Rejected" && (
                                    <>
                                        <strong>Application rejected</strong>
                                        {application.RejectionReason ? (
                                            <p>
                                                <strong>Reason: </strong>
                                                {application.RejectionReason}
                                            </p>
                                        ) : (
                                            <p>
                                                No rejection reason was provided.
                                                Please contact your administrator
                                                for more information.
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default GradingApplications;
