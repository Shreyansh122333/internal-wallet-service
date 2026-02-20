# 💳 INTERNAL WALLET SERVICE :

A high-performance, _Ledger-Based Credit Management System_ built using Node.js and SQLite. This service is designed to handle virtual currencies as a banking system.

## **CORE API ENDPOINTS :**
__Method Endpoint Description__
```
    POST  ->  /wallet/topup          -> Converts real-world value to credits [ + WALLET ]
    POST  ->  /wallet/spend          -> Deduct credits for services [ - WALLET ]
    POST  ->  /wallet/bonus          -> Issues system-generated incentives
    GET   ->  /wallet/balance/:id    -> Retrieves real-time audited balance
```

**Used SQLite**. Because it is a serverless, zero-config database that supports full ACID transactions.

**To install the necessary tools for ACID transactions.**
```
npm install express sqlite3 sqlite
```
**Database Initialization (seed.js)**

-> seed.js implements a Ledger-Based Architecture. It creates the tables and seeds them with the required Asset Types, Accounts, and User Accounts.

**The API Server (index.js)**

-> index.js handles the Functional Logic for Top-ups, Bonus, and Spending. It uses transactions to ensure Data Integrity

**To deduct 30 coins (Spend):**
```
curl -X POST http://localhost:3000/wallet/spend \
-H "Content-Type: application/json" \
-d '{"userId": 2, "amount": 30, "refId": "order_001"}'
```

**To deduct 30 coins (Spend) with Auth:**
```
curl -X POST http://localhost:3000/wallet/spend \
-H "Content-Type: application/json" \
-H "Authorization: Bearer PASTE_TOKEN_HERE" \
-d '{"amount": 30, "refId": "order_001"}'
```

**To add 200 coins (Top-up):**
```
curl -X POST http://localhost:3000/wallet/topup \
-H "Content-Type: application/json" \
-d '{"userId": 2, "amount": 200, "refId": "change_test_01"}' 
``` 

**To add 200 coins (Top-up) with auth:**
```
curl -X POST http://localhost:3000/wallet/topup \
-H "Content-Type: application/json" \
-H "Authorization: Bearer PASTE_TOKEN_HERE" \
-d '{"amount": 30, "refId": "change_test_01"}'
```

**To delete node_modules**
```
rm -rf node_modules
```

**My used token**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzE1ODMzMjYsImV4cCI6MTc3MTU4NjkyNn0.ROHtV0gZya3e9ysnuYEQ0GjdKmwHeb3dtuFloQqcIIc
```

**Login (Get Token):**
```
 curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "User_1", "password": "your_password_here"}'
```

**Check Balance (Protected):**
```
curl -X GET http://localhost:3000/wallet/balance \
-H "Authorization: Bearer PASTE_TOKEN_HERE"
```