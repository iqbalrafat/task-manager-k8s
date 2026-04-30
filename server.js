const express = require("express");
const { Pool } = require("pg");
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
});

// Test DB connection on startup
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ DB Connection Failed:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL');
        release();
    }
});

// Test route
app.get("/test", (req, res) => {
    res.send("OK");
});

// Create Table
app.get('/init', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS task (
                id SERIAL PRIMARY KEY,
                title VARCHAR(100)
            )`
        );
        res.send('Table Created');
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database error");
    }
});

// Add Task
app.post('/post', async (req, res) => {
    try {
        const { title } = req.body;
        console.log({ title });
        const result = await pool.query(
            "INSERT INTO task(title) VALUES ($1) RETURNING *", [title]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database error");
    }
});

// Get Tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM task');
        res.json(result.rows);
    } catch (err) {
        console.error("DB ERROR:", err);
        res.status(500).send("Database error");
    }
});

// Start
app.listen(3002, () => {
    console.log("Server running on port 3002");
});