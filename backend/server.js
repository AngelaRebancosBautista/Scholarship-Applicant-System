const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ===============================
// TEST SERVER
// ===============================
app.get("/", (req, res) => {
    res.json({
        message: "Scholarship Applicant API is running"
    });
});

// ===============================
// TEST DATABASE
// ===============================
app.get("/api/test-db", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1 AS test");

        res.status(200).json({
            message: "Database connection successful",
            result
        });

    } catch (error) {
        console.error("DATABASE CONNECTION ERROR:", error);

        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// ===============================
// GET ALL APPLICANTS
// ===============================
app.get("/api/applicants", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM applicants ORDER BY id DESC"
        );

        res.status(200).json(rows);

    } catch (error) {
        console.error("GET APPLICANTS ERROR:", error);

        res.status(500).json({
            message: "Failed to get applicants",
            error: error.message
        });
    }
});

// ===============================
// GET ONE APPLICANT
// ===============================
app.get("/api/applicants/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM applicants WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Applicant not found."
            });
        }

        res.status(200).json(rows[0]);

    } catch (error) {
        console.error("GET APPLICANT ERROR:", error);

        res.status(500).json({
            message: "Failed to get applicant",
            error: error.message
        });
    }
});

// ===============================
// CREATE APPLICANT
// ===============================
app.post("/api/applicants", async (req, res) => {
    try {
        const {
            name,
            course,
            gwa,
            scholarship_type,
            status
        } = req.body;

        if (
            !name ||
            !course ||
            gwa === undefined ||
            gwa === "" ||
            !scholarship_type ||
            !status
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const numericGwa = Number(gwa);

        if (
            Number.isNaN(numericGwa) ||
            numericGwa < 1 ||
            numericGwa > 5
        ) {
            return res.status(400).json({
                message: "GWA must be between 1.00 and 5.00."
            });
        }

        const [result] = await db.query(
            `INSERT INTO applicants
            (name, course, gwa, scholarship_type, status)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                course,
                numericGwa,
                scholarship_type,
                status
            ]
        );

        const [rows] = await db.query(
            "SELECT * FROM applicants WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            message: "Applicant created successfully.",
            applicant: rows[0]
        });

    } catch (error) {
        console.error("CREATE APPLICANT ERROR:", error);

        res.status(500).json({
            message: "Failed to create applicant",
            error: error.message
        });
    }
});

// ===============================
// UPDATE APPLICANT
// ===============================
app.put("/api/applicants/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            course,
            gwa,
            scholarship_type,
            status
        } = req.body;

        if (
            !name ||
            !course ||
            gwa === undefined ||
            gwa === "" ||
            !scholarship_type ||
            !status
        ) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }

        const numericGwa = Number(gwa);

        if (
            Number.isNaN(numericGwa) ||
            numericGwa < 1 ||
            numericGwa > 5
        ) {
            return res.status(400).json({
                message: "GWA must be between 1.00 and 5.00."
            });
        }

        const [result] = await db.query(
            `UPDATE applicants
             SET name = ?,
                 course = ?,
                 gwa = ?,
                 scholarship_type = ?,
                 status = ?
             WHERE id = ?`,
            [
                name,
                course,
                numericGwa,
                scholarship_type,
                status,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Applicant not found."
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM applicants WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "Applicant updated successfully.",
            applicant: rows[0]
        });

    } catch (error) {
        console.error("UPDATE APPLICANT ERROR:", error);

        res.status(500).json({
            message: "Failed to update applicant",
            error: error.message
        });
    }
});

// ===============================
// DELETE APPLICANT
// ===============================
app.delete("/api/applicants/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM applicants WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Applicant not found."
            });
        }

        res.status(200).json({
            message: "Applicant deleted successfully."
        });

    } catch (error) {
        console.error("DELETE APPLICANT ERROR:", error);

        res.status(500).json({
            message: "Failed to delete applicant",
            error: error.message
        });
    }
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});