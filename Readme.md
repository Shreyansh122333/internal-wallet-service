<!-- INTERNAL WALLET SERVICE : -->
 -> A high-performance, _Ledger-Based Credit Management System_ built using Node.js and SQLite. This service is designed 
    to handle virtual currencies as a banking system.

<!-- CORE API ENDPOINTS :  -->

    Method Endpoint Description
    POST  ->  /wallet/topup          -> Converts real-world value to credits [ + WALLET ]
    POST  ->  /wallet/spend          -> Deduct credits for services [ - WALLET ]
    POST  ->  /wallet/bonus          -> Issues system-generated incentives
    GET   ->  /wallet/balance/:id    -> Retrieves real-time audited balance

Used SQLite -> Because it is a serverless, zero-config database that supports full ACID transactions.

<!-- To install the necessary tools for ACID transactions. -->
 -> npm install express sqlite3 sqlite

<!-- Database Initialization (seed.js) -->
 -> seed.js implements a Ledger-Based Architecture. It creates the tables and seeds them with the required Asset Types, 
    Accounts, and User Accounts.

<!-- The API Server (index.js) -->
 -> index.js handles the Functional Logic for Top-ups, Bonus, and Spending. It uses transactions to ensure Data Integrity

<!-- To deduct 30 coins (Spend): -->
curl -X POST http://localhost:3000/wallet/spend \
-H "Content-Type: application/json" \
-d '{"userId": 2, "amount": 30, "refId": "order_001"}'

<!-- To add 200 coins (Top-up): -->
curl -X POST http://localhost:3000/wallet/topup \
-H "Content-Type: application/json" \
-d '{"userId": 2, "amount": 200, "refId": "change_test_01"}'  

<!-- To delete node_modules -->
 -> rm -rf node_modules
