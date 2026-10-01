import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        course: "",
        gwa: "",
        scholarship_type: "",
        status: "Pending"
    });

    const [editingId, setEditingId] = useState(null);

    const API_URL = "http://localhost:5000/api/applicants";

    // Gets all applicants from the Express backend.
    const getApplicants = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to load applicants.");
            }

            const data = await response.json();
            setApplicants(data);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getApplicants();
    }, []);

    // Handles changes in the form fields.
    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    // Adds a new applicant or updates an existing applicant.
    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (
            !form.name ||
            !form.course ||
            !form.gwa ||
            !form.scholarship_type ||
            !form.status
        ) {
            setError("Please complete all fields.");
            return;
        }

        try {
            const url = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: form.name,
                    course: form.course,
                    gwa: Number(form.gwa),
                    scholarship_type: form.scholarship_type,
                    status: form.status
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Request failed.");
            }

            if (editingId) {
                setMessage("Applicant updated successfully.");
            } else {
                setMessage("Applicant added successfully.");
            }

            resetForm();
            getApplicants();

        } catch (error) {
            setError(error.message);
        }
    };

    // Loads applicant data into the form for editing.
    const handleEdit = (applicant) => {
        setEditingId(applicant.id);

        setForm({
            name: applicant.name,
            course: applicant.course,
            gwa: applicant.gwa,
            scholarship_type: applicant.scholarship_type,
            status: applicant.status
        });

        setMessage("");
        setError("");
    };

    // Deletes an applicant.
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this applicant?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Delete failed.");
            }

            setMessage("Applicant deleted successfully.");
            getApplicants();

        } catch (error) {
            setError(error.message);
        }
    };

    // Clears the form.
    const resetForm = () => {
        setEditingId(null);

        setForm({
            name: "",
            course: "",
            gwa: "",
            scholarship_type: "",
            status: "Pending"
        });
    };

    return (
        <div className="app">
            <header>
                <h1>Scholarship Applicant Management</h1>
                <p>Manage scholarship applicants easily.</p>
            </header>

            <main>
                <section className="form-card">
                    <h2>
                        {editingId
                            ? "Update Applicant"
                            : "Add New Applicant"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">

                            <div className="form-group">
                                <label>Applicant Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Course</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={form.course}
                                    onChange={handleChange}
                                    placeholder="Example: BSIT"
                                />
                            </div>

                            <div className="form-group">
                                <label>GWA</label>
                                <input
                                    type="number"
                                    name="gwa"
                                    value={form.gwa}
                                    onChange={handleChange}
                                    placeholder="Example: 1.75"
                                    min="1"
                                    max="5"
                                    step="0.01"
                                />
                            </div>

                            <div className="form-group">
                                <label>Scholarship Type</label>
                                <select
                                    name="scholarship_type"
                                    value={form.scholarship_type}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        Select scholarship
                                    </option>
                                    <option value="Academic">
                                        Academic
                                    </option>
                                    <option value="Financial">
                                        Financial
                                    </option>
                                    <option value="Athletic">
                                        Athletic
                                    </option>
                                    <option value="Government">
                                        Government
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                >
                                    <option value="Pending">
                                        Pending
                                    </option>
                                    <option value="Approved">
                                        Approved
                                    </option>
                                    <option value="Rejected">
                                        Rejected
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="form-buttons">
                            <button type="submit">
                                {editingId
                                    ? "Update Applicant"
                                    : "Add Applicant"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {message && (
                    <div className="success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                <section className="table-card">
                    <h2>Applicant List</h2>

                    {loading ? (
                        <p className="empty-message">
                            Loading applicants...
                        </p>
                    ) : applicants.length === 0 ? (
                        <p className="empty-message">
                            No scholarship applicants found.
                        </p>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Course</th>
                                        <th>GWA</th>
                                        <th>Scholarship</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {applicants.map((applicant) => (
                                        <tr key={applicant.id}>
                                            <td>{applicant.name}</td>
                                            <td>{applicant.course}</td>
                                            <td>{applicant.gwa}</td>
                                            <td>
                                                {applicant.scholarship_type}
                                            </td>
                                            <td>
                                                <span className="status">
                                                    {applicant.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        handleEdit(applicant)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            applicant.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;