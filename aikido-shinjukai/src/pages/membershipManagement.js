
import React, { useState, useEffect } from "react";
import "../styles/membershipManagement.css";

function MembershipManagement() {
    const [students, setStudents] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [editingMembershipId, setEditingMembershipId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Retrieve all students from the API
    async function loadStudents() {
        try {
            const response = await fetch("/api/memberships");

            if (!response.ok) {
                throw new Error("Unable to retrieve students.");
            }

            const data = await response.json();

            setStudents(data);

            // Select the first student automatically
            setSelectedStudentId(currentId =>
                currentId === null && data.length > 0
                    ? data[0].StudentId
                    : currentId
            );

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Retrieve a selected student's details and membership history
    async function loadStudentDetails(studentId) {
        try {
            const response = await fetch(
                `/api/memberships/student/${studentId}`
            );

            if (!response.ok) {
                throw new Error("Unable to retrieve student details.");
            }

            const data = await response.json();

            setSelectedStudent(data);
        } catch (err) {
            setError(err.message);
            setSelectedStudent(null);
        }
    }

    // Load student list when the page first opens
    useEffect(() => {
        loadStudents();
    }, []);

    // Load details whenever a different student is selected
    useEffect(() => {
        if (selectedStudentId !== null) {
            setSelectedStudent(null);
            setEditingMembershipId(null);
            loadStudentDetails(selectedStudentId);
        }
    }, [selectedStudentId]);

    // Search students
    const filteredStudents = students.filter(student =>
        student.DisplayName.toLowerCase().includes(
            searchTerm.toLowerCase()
        ) ||
        student.StudentNumber.toLowerCase().includes(
            searchTerm.toLowerCase()
        )
    );

    // Edit membership
    function handleEdit(membership) {
        setEditingMembershipId(membership.membershipId);

        setEditForm({
            startsOn: membership.startsOn,
            expiresOn: membership.expiresOn,
            status: membership.status
        });
    }

    // Save membership changes to the database
    async function handleSave() {
        if (editForm.expiresOn < editForm.startsOn) {
            alert("Expiry date cannot be earlier than the start date.");
            return;
        }

        try {
            const response = await fetch(
                `/api/memberships/${editingMembershipId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(editForm)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Update failed.");
            }

            alert("Membership updated successfully!");

            setEditingMembershipId(null);

            // Refresh both the student list and selected student's details
            await loadStudents();
            await loadStudentDetails(selectedStudentId);

        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) {
        return <div className="loading-message">Loading students...</div>;
    }

    return (
        <div className="dashboard">

            <aside className="sidebar">
                <h2 className="logo">
                    AIKIDO<br />SHINJUKAI
                </h2>

                <nav>
                    <p className="nav-heading">MAIN MENU</p>
                    <a href="#" className="nav-link active">Membership</a>
                    <a href="#" className="nav-link">Students</a>
                    <a href="#" className="nav-link">Dojo Management</a>
                    <a href="#" className="nav-link">Reports</a>
                </nav>

                <div className="sidebar-footer">
                    Administrator
                </div>
            </aside>

            <main className="main-content">

                <header className="topbar">
                    <div>
                        <h2>Membership Management</h2>
                        <p>Manage student membership records</p>
                    </div>

                    <div className="admin-profile">Admin</div>
                </header>

                <section className="content">

                    <div className="section-heading">
                        <div>
                            <h2>Student Memberships</h2>
                            <p>
                                View and manage student membership information.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <p className="error-message">{error}</p>
                    )}

                    <div className="membership-layout">

                        {/* STUDENT LIST */}
                        <div className="student-panel">

                            <div className="panel-heading">
                                <h3>Students</h3>
                                <span>{filteredStudents.length} records</span>
                            </div>

                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />

                            <div className="student-list">

                                {filteredStudents.map(student => (
                                    <div
                                        key={student.StudentId}
                                        className={`student-item ${
                                            selectedStudentId === student.StudentId
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedStudentId(student.StudentId)
                                        }
                                    >
                                        <div className="student-avatar">
                                            {student.DisplayName.charAt(0)}
                                        </div>

                                        <div className="student-info">
                                            <strong>{student.DisplayName}</strong>
                                            <span>{student.StudentNumber}</span>
                                            <span>{student.DojoName}</span>
                                        </div>

                                        <span className={`status ${
                                            student.MembershipStatus.toLowerCase().replace(" ", "-")
                                        }`}>
                                            {student.MembershipStatus}
                                        </span>
                                    </div>
                                ))}

                                {filteredStudents.length === 0 && (
                                    <p className="empty-message">
                                        No students found.
                                    </p>
                                )}

                            </div>
                        </div>

                        {/* STUDENT DETAILS */}
                        <div className="details-panel">

                            {selectedStudent ? (
                                <>
                                    <div className="panel-heading">
                                        <h3>Student Details</h3>
                                        <span>{selectedStudent.studentNumber}</span>
                                    </div>

                                    <div className="student-profile">
                                        <div className="large-avatar">
                                            {selectedStudent.name.charAt(0)}
                                        </div>

                                        <div>
                                            <h2>{selectedStudent.name}</h2>
                                            <p>{selectedStudent.email}</p>
                                        </div>
                                    </div>

                                    <div className="detail-grid">

                                        <div>
                                            <span>Student Number</span>
                                            <strong>
                                                {selectedStudent.studentNumber}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Home Dojo</span>
                                            <strong>{selectedStudent.dojo}</strong>
                                        </div>

                                        <div>
                                            <span>Date Joined</span>
                                            <strong>{selectedStudent.joinedOn}</strong>
                                        </div>

                                    </div>

                                    <div className="history-heading">
                                        <h3>Membership History</h3>
                                    </div>

                                    {selectedStudent.memberships.length > 0 ? (

                                        selectedStudent.memberships.map(membership => (

                                            <div
                                                className="membership-card"
                                                key={membership.membershipId}
                                            >

                                                {editingMembershipId === membership.membershipId ? (

                                                    <div className="edit-form">

                                                        <label>Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={editForm.startsOn}
                                                            onChange={e =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    startsOn: e.target.value
                                                                })
                                                            }
                                                        />

                                                        <label>Expiry Date</label>
                                                        <input
                                                            type="date"
                                                            value={editForm.expiresOn}
                                                            onChange={e =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    expiresOn: e.target.value
                                                                })
                                                            }
                                                        />

                                                        <label>Membership Status</label>
                                                        <select
                                                            value={editForm.status}
                                                            onChange={e =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    status: e.target.value
                                                                })
                                                            }
                                                        >
                                                            <option value="Active">Active</option>
                                                            <option value="Suspended">Suspended</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>

                                                        <div className="form-actions">
                                                            <button onClick={handleSave}>
                                                                Save Changes
                                                            </button>

                                                            <button
                                                                className="cancel-button"
                                                                onClick={() =>
                                                                    setEditingMembershipId(null)
                                                                }
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>

                                                    </div>

                                                ) : (

                                                    <>
                                                        <div className="membership-card-heading">
                                                            <strong>
                                                                Membership #{membership.membershipId}
                                                            </strong>

                                                            <span className={`status ${membership.status.toLowerCase()}`}>
                                                                {membership.status}
                                                            </span>
                                                        </div>

                                                        <div className="membership-dates">

                                                            <div>
                                                                <span>Start Date</span>
                                                                <strong>{membership.startsOn}</strong>
                                                            </div>

                                                            <div>
                                                                <span>Expiry Date</span>
                                                                <strong>{membership.expiresOn}</strong>
                                                            </div>

                                                        </div>

                                                        <button
                                                            className="edit-button"
                                                            onClick={() => handleEdit(membership)}
                                                        >
                                                            Edit Membership
                                                        </button>
                                                    </>

                                                )}

                                            </div>

                                        ))

                                    ) : (
                                        <p className="empty-message">
                                            No membership records available.
                                        </p>
                                    )}

                                </>

                            ) : (
                                <p className="empty-message">
                                    {error
                                        ? "Unable to load student details."
                                        : "Loading student details..."}
                                </p>
                            )}

                        </div>

                    </div>

                </section>
            </main>
        </div>
    );
}

export default MembershipManagement;
