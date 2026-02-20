# 💳 INTERNAL WALLET SERVICE

A high-performance, **Ledger-Based Credit Management System** built with Node.js and SQLite. This service handles virtual currencies with banking-grade data integrity.

---

## 🚀 NEW: Security & Route Service
This version introduces **JWT Authentication** and **Role-Based Access Control (RBAC)**.
* **Authentication**: Users must log in to receive a Bearer Token.
* **Route Protection**: Sensitive transactions (Top-up, Spend) now require the `Authorization` header.
* **Admin Roles**: The `/wallet/bonus` route is restricted to accounts with the `admin` role.

---

## **CORE API ENDPOINTS**

| Method | Endpoint | Description | Auth Required |
|:--- |:--- |:--- |:--- |
| **POST** | `/auth/login` | Returns a JWT token for valid credentials | No |
| **POST** | `/wallet/topup` | Converts real-world value to credits | **Yes** |
| **POST** | `/wallet/spend` | Deduct credits for services | **Yes** |
| **POST** | `/wallet/bonus` | Issues system-generated incentives (Admin Only) | **Yes (Admin)** |
| **GET** | `/wallet/balance` | Retrieves real-time audited balance for current user | **Yes** |

---

## 🛠️ CONCURRENCY & INTEGRITY STRATEGY
This is the core architecture designed to meet high-traffic constraints:

1. **ACID Transactions**: Every credit/debit uses `BEGIN TRANSACTION` and `COMMIT/ROLLBACK`. This ensures that a balance update never happens without a corresponding ledger entry.
2. **Idempotency**: Every request requires a `refId`. The database enforces a `UNIQUE` constraint on this ID to prevent accidental double-spending or duplicate credits during network retries.
3. **Double-Entry Ledger**: The system doesn't just "change a number." It records a full audit trail in the `transactions` table, moving value from the **Treasury** (ID 1) to users and vice versa.

---

## **GETTING STARTED**
**To install the necessary tools for ACID transactions.**
```
npm install express sqlite3 sqlite
```

### 1. Installation
```bash
npm install express sqlite3 sqlite jsonwebtoken bcryptjs
```

### 2. Database Initialization
```
node seed.js
```

### 3. Start Server
```
node index.js
```
### TESTING THE FLOW (cURL)

**Step 1: Login to get your Token**
```
 curl -X POST http://localhost:3000/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "User_1", "password": "your_password_here"}'
```

**Step 2: Check Balance (Authenticated)**
```
curl -X GET http://localhost:3000/wallet/balance \
-H "Authorization: Bearer <PASTE_TOKEN_HERE>"
```

**Step 3: To deduct 30 coins (Spend):**
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




**Check Balance (Protected):**
```
curl -X GET http://localhost:3000/wallet/balance \
-H "Authorization: Bearer PASTE_TOKEN_HERE"
```

__TRASH (Just for basic understanding)__

**Used SQLite**

-> Because it is a serverless, zero-config database that supports full ACID transactions.

**To reset the environment:**
```
rm -rf node_modules
rm wallet.db
```
