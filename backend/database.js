const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open a database connection
const dbPath = path.resolve(__dirname, 'subscribers.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Recreate the subscribers table for the new schema
db.serialize(() => {
    // Drop old table since we are adding new columns and it's just test data
    db.run(`DROP TABLE IF EXISTS subscribers`);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            is_verified BOOLEAN DEFAULT 0,
            verify_token TEXT,
            date_subscribed DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;
