const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

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
app.post('/wallet/topup', async (req, res) => {
    const { userId, amount, refId } = req.body;
    const result = await executeTransaction(1, userId, 1, amount, refId);
    res.status(result.success ? 200 : 400).json(result);
});

// 2. Bonus/Incentive Flow 
app.post('/wallet/bonus', async (req, res) => {
    const { userId, amount, refId } = req.body;
    const result = await executeTransaction(1, userId, 1, amount, refId);
    res.status(result.success ? 200 : 400).json(result);
});

// 3. Purchase/Spend Flow 
app.post('/wallet/spend', async (req, res) => {
    const { userId, amount, refId } = req.body;
    const result = await executeTransaction(userId, 1, 1, amount, refId);
    res.status(result.success ? 200 : 400).json(result);
});

// GET Balance for verification
app.get('/wallet/balance/:userId', async (req, res) => {
    const row = await db.get('SELECT balance FROM wallets WHERE id = ?', [req.params.userId]);
    row ? res.json(row) : res.status(404).json({ error: "User not found" });
});

initializeDatabaseAndServer();