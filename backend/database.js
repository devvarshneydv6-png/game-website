const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    } else {
        console.log('Connected to Neon PostgreSQL database.');
        release();
    }
});

// Initialize database table
pool.query(`
    CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verify_token TEXT,
        date_subscribed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`, (err, res) => {
    if (err) {
        console.error('Error creating table:', err);
    }
});

module.exports = pool;
