const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { SECRET_KEY } = require('./auth');
const { verifyToken } = require('./auth');

const app = express();
app.use(express.json());

let db;

// Enhanced Initialization: Ensures DB is ready before server starts 
async function initializeDatabaseAndServer() {
    try {
        db = await open({
            filename: './wallet.db',
            driver: sqlite3.Database
        });
        console.log('API Server connected to database.');

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Wallet Service live at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

// Core Transaction Engine: Uses SQL transactions to guarantee atomic "all-or-nothing" updates, maintaining strict data integrity for financial movements.
async function executeTransaction(fromId, toId, assetId, amount, refId) {
    await db.run('BEGIN TRANSACTION');
    try {
        // 1. Balance Check: Pre-flight balance check to prevent overdrafts; ensures the source wallet has sufficient liquidity for the operation.
        const sender = await db.get('SELECT balance FROM wallets WHERE id = ?', [fromId]);
        if (fromId !== 1 && (!sender || sender.balance < amount)) {
            throw new Error("Insufficient funds");
        }

        // 2. Idempotency Layer: Creates an immutable ledger entry first; the UNIQUE constraint on reference_id prevents accidental duplicate charges on retries.
        await db.run(
            `INSERT INTO transactions (from_wallet_id, to_wallet_id, asset_id, amount, reference_id) 
             VALUES (?, ?, ?, ?, ?)`, 
            [fromId, toId, assetId, amount, refId]
        );

        // 3. State Synchronization: Updates both sender and receiver balances simultaneously within the transaction block to ensure the total system supply remains constant.
        await db.run('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, fromId]);
        await db.run('UPDATE wallets SET balance = balance + ? WHERE id = ?', [amount, toId]);

        await db.run('COMMIT');
        return { success: true };
    } 
    
    catch (err) {
        await db.run('ROLLBACK');
        return { success: false, error: err.message };
    }
}

// 1. Wallet Top-up Flow 
app.post('/wallet/topup', verifyToken, async (req, res) => {
    const { amount, refId } = req.body;
    // Use req.user.id from the JWT instead of trusting a userId in the body
    const result = await executeTransaction(1, req.user.id, 1, amount, refId);
    res.status(result.success ? 200 : 400).json(result);
});

// 2. Bonus/Incentive Flow 
app.post('/wallet/bonus', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }
    const { userId, amount, refId } = req.body;
    const result = await executeTransaction(1, userId, 1, amount, refId);
    res.status(result.success ? 200 : 400).json(result);
});

// 3. Purchase/Spend Flow 
app.post('/wallet/spend', verifyToken, async (req, res) => {
    const { amount, refId } = req.body;
    // req.user.id spends to Treasury (ID 1)
    const result = await executeTransaction(req.user.id, 1, 1, amount, refId);
    res.status(result.success ? 200 : 400).json(result);
});

// GET Balance for verification
app.get('/wallet/balance/:userId', async (req, res) => {
    const row = await db.get('SELECT balance FROM wallets WHERE id = ?', [req.params.userId]);
    row ? res.json(row) : res.status(404).json({ error: "User not found" });
});

// Authentication
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Protected Balance Check
app.get('/wallet/balance', verifyToken, async (req, res) => {
    // req.user.id comes from the verified JWT token
    const row = await db.get('SELECT balance FROM wallets WHERE id = ?', [req.user.id]);
    row ? res.json(row) : res.status(404).json({ error: "Wallet not found" });
});

initializeDatabaseAndServer();