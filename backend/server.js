require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper: Setup Nodemailer Transporter
function getTransporter() {
    const emailUser = process.env.EMAIL_USER || '';
    const emailPass = process.env.EMAIL_PASS || '';
    if (!emailUser || !emailPass) return null;
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
    });
}

// API: Subscribe Email (Double Opt-In)
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const token = crypto.randomBytes(20).toString('hex');
    
    db.query("INSERT INTO subscribers (email, is_verified, verify_token) VALUES ($1, false, $2)", [email, token], (err, result) => {
        if (err) {
            if (err.code === '23505') { // Postgres unique constraint violation
                return res.status(400).json({ error: 'This email is already subscribed!' });
            }
            console.error("DB Insert Error:", err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Send Verification Email
        const transporter = getTransporter();
        if (!transporter) {
            return res.status(500).json({ error: 'Server configuration error: Email credentials missing.' });
        }

        const verifyLink = `https://nindogames-website-backend.onrender.com/api/verify?token=${token}`;
        const mailOptions = {
            from: `"Nindo Game" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify your Nindo Subscription!',
            text: `Welcome to the Shadows!\n\nPlease verify your email address to receive Nindo Game updates by copying this link into your browser:\n${verifyLink}\n\nIf you did not request this, please ignore this email.`,
            html: `
                <h2>Welcome to the Shadows!</h2>
                <p>Please verify your email address to receive Nindo Game updates.</p>
                <a href="${verifyLink}" style="padding: 10px 20px; background: #f09b00; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Nodemailer error:", err);
                return res.status(500).json({ error: 'Failed to send email. Check Render credentials. Error: ' + err.message });
            }
            res.status(200).json({ message: 'Verification email sent! Please check your inbox to confirm.' });
        });
    });
});

// API: Verify Email Route (Clicked from Email)
app.get('/api/verify', (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send('Invalid token.');

    db.query("SELECT id FROM subscribers WHERE verify_token = $1", [token], (err, result) => {
        if (err) return res.status(500).send('Database error.');
        if (result.rows.length === 0) return res.status(400).send('Invalid or expired verification link.');

        const row = result.rows[0];
        db.query("UPDATE subscribers SET is_verified = true, verify_token = NULL WHERE id = $1", [row.id], (err) => {
            if (err) return res.status(500).send('Database error.');
            
            // Send a nice HTML response
            res.send(`
                <html>
                <body style="background: #111; color: white; font-family: sans-serif; text-align: center; padding-top: 50px;">
                    <h1 style="color: #f09b00;">Email Verified!</h1>
                    <p>You have successfully joined the Nindo Shadows.</p>
                    <p>You can now close this tab and return to the website.</p>
                </body>
                </html>
            `);
        });
    });
});

const ADMIN_PASS = process.env.ADMIN_PASS || "nindo2026";

// API: Get all subscribers
app.post('/api/subscribers', (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });

    db.query("SELECT * FROM subscribers ORDER BY date_subscribed DESC", [], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(200).json(result.rows);
    });
});

// API: Delete a subscriber
app.post('/api/delete', (req, res) => {
    const { password, id } = req.body;
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
    if (!id) return res.status(400).json({ error: 'Subscriber ID is required' });

    db.query("DELETE FROM subscribers WHERE id = $1", [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(200).json({ message: 'Subscriber deleted successfully!' });
    });
});

// API: Send Broadcast Email (Verified Only)
app.post('/api/broadcast', async (req, res) => {
    const { password, subject, message } = req.body;
    if (password !== ADMIN_PASS) return res.status(401).json({ error: 'Unauthorized' });
    if (!subject || !message) return res.status(400).json({ error: 'Subject and message required' });

    db.query("SELECT email FROM subscribers WHERE is_verified = true", [], async (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        const emails = result.rows.map(r => r.email);
        if (emails.length === 0) return res.status(400).json({ error: 'No verified subscribers found!' });

        const transporter = getTransporter();
        if (!transporter) {
            return res.status(500).json({ error: 'Email configuration missing.' });
        }

        let sentCount = 0;

        // Send emails individually to avoid BCC spam filters
        for (const userEmail of emails) {
            const mailOptions = {
                from: `"Nindo Updates" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: subject,
                text: message,
                html: `<p style="white-space: pre-wrap;">${message}</p><br><br><small style="color:#888;">You are receiving this because you verified your email on the Nindo Website.</small>`
            };

            try {
                await transporter.sendMail(mailOptions);
                sentCount++;
            } catch (error) {
                console.error("Error sending to " + userEmail, error);
            }
            
            // Add a small 1-second delay between emails so Gmail doesn't block us for spamming too fast
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        res.status(200).json({ message: `Broadcast successfully sent individually to ${sentCount} verified subscribers!` });
    });
});

app.listen(PORT, () => {
    console.log(`Shadow Backend is running on http://localhost:${PORT}`);
});
