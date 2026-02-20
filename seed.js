const bcrypt = require('bcryptjs');

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function setup() {
    const db = await open({ filename: './wallet.db', driver: sqlite3.Database });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS assets (id INTEGER PRIMARY KEY, name TEXT UNIQUE);
        CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY, owner_name TEXT, balance REAL DEFAULT 0.0);
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY, 
            from_wallet_id INTEGER, 
            to_wallet_id INTEGER, 
            asset_id INTEGER, 
            amount REAL, 
            reference_id TEXT UNIQUE
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
        );
`   );

    // Seed the Data 
    const hashedPassword = await bcrypt.hash('your_password_here', 10);

    await db.run(
        "INSERT OR IGNORE INTO users (id, username, password, role) VALUES (?, ?, ?, ?)", 
        [2, 'User_1', hashedPassword, 'user']
    );
    
    await db.run(
        "INSERT OR IGNORE INTO users (id, username, password, role) VALUES (?, ?, ?, ?)", 
        [1, 'Admin_User', hashedPassword, 'admin'] // Added an admin for testing /bonus
    );
    
    console.log("Database Seeded Successfully.");
}

setup().catch(err => console.error(err));