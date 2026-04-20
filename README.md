# Banking Ledger

A full-stack banking ledger application with secure authentication, account management, transfers/deposits, and transaction history.

---

## Overview

`Banking-Ledger` is split into two apps:

- `Backend/` → Node.js + Express + MongoDB API
- `Frontend/` → React + Vite web application

It supports:

- User registration/login/logout with JWT cookie auth
- Profile fetch and profile edit (with old-password verification)
- Multi-account support per user
- Role-aware flows:
  - Standard users can transfer funds
  - System users can deposit funds
- Idempotent transaction execution
- Ledger-based balance computation
- Paginated transaction history UI

---

## Tech Stack

### Backend

- Node.js (ESM)
- Express 5
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Cookie parsing (`cookie-parser`)
- Logging (`morgan`)
- Email via Gmail OAuth2 (`nodemailer`)

### Frontend

- React 19
- React Router
- Vite
- Tailwind CSS v4 plugin integration
- Custom dark theme + animated topology background

---

## Repository Structure

```text
Banking-Ledger/
├─ Backend/
│  ├─ server.js
│  ├─ package.json
│  └─ src/
│     ├─ app.js
│     ├─ configs/config.js
│     ├─ controllers/
│     ├─ middlewares/
│     ├─ models/
│     ├─ routes/
│     ├─ services/
│     └─ utils/
└─ Frontend/
   ├─ package.json
   ├─ vite.config.js
   └─ src/
      ├─ App.jsx
      ├─ api/
      ├─ components/
      ├─ context/
      ├─ pages/
      └─ utils/
```

---

## Features

### Authentication & Session

- Register with `name`, `mobileNo`, `email`, `password`
- Login with `email`, `password`
- JWT token is stored in an HTTP-only cookie (`token`)
- `/api/auth/me` returns current authenticated user
- `/api/auth/logout` blacklists token and clears cookie

### Profile Management

- View profile details
- Edit profile with mandatory `oldPassword`
- Optional password change via `newPassword`

### Accounts

- Create account (`currency`, optional `status` at API level)
- Fetch all accounts for authenticated user
- Select account in UI and fetch balance/history

### Transactions

- Transfer (`fromAccount`, `toAccount`, `amount`, `idempotencyKey`)
- Deposit (system-user only)
- Fetch account transaction history
- Idempotency checks prevent duplicate execution
- Ledger entries are immutable and used for balance computation

---

## Backend Details

### API Base URL

- Local: `http://localhost:<PORT>`
- All routes are prefixed by `/api`

### Authentication Middleware

- `verifyToken`: validates JWT + blacklist + user existence
- `verifySystemUser`: same as above + `isSystemUser === true`

### Data Model Highlights

- **User**
  - `name`, `mobileNo` (unique), `email` (unique), `passwordHash`, `isSystemUser`
- **Account**
  - `user`, `status` (`ACTIVE|FROZEN|CLOSED`), `currency` (ISO code, default `INR`)
- **Transaction**
  - `fromAccount`, `toAccount`, `amount`, `status`, `idempotencyKey` (unique)
- **Ledger**
  - immutable debit/credit entries per transaction
- **TokenBlacklist**
  - tokens auto-expire after 24h (TTL index)

### Backend Routes

#### Auth Routes (`/api/auth`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register user + set cookie |
| POST | `/login` | No | Login + set cookie |
| GET | `/me` | Yes | Get current user |
| PUT | `/edit-profile` | Yes | Update profile; requires old password |
| POST | `/logout` | Optional token source | Logout + blacklist token |

#### Account Routes (`/api/account`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/create` | Yes | Create account for logged-in user |
| GET | `/allAccounts` | Yes | List all user accounts |

#### Transaction Routes (`/api/transaction`)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/get-balance` | Yes | Get balance for selected account |
| POST | `/transfer` | Yes | Transfer funds |
| POST | `/deposit` | System user only | Deposit funds |
| POST | `/transaction-history` | Yes | Account history |

---

## Frontend Details

### Frontend Route Map

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | User login |
| `/register` | Public | User registration |
| `/dashboard` | Protected | Accounts, balance, transfer/deposit actions |
| `/transactions` | Protected | Paginated transaction history |
| `/profile` | Protected | Profile + account creation UI |
| `/edit-profile` | Protected | Profile update form |

### Auth Flow (Frontend)

- `AuthContext` bootstraps user via `/api/auth/me`
- Requests use `credentials: 'include'`
- Role check uses deposit endpoint behavior to infer system-user UI capability

### API Client

- `Frontend/src/api/client.js` uses:
  - `VITE_API_BASE_URL` if set
  - otherwise relative paths (works with local Vite proxy)

### Background/Theme

- Global animated background is mounted once in `App.jsx` (persists across route changes)
- Dark UI theme with Montserrat typography

---

## Environment Variables

### Backend (`Backend/.env`)

Required by `Backend/src/configs/config.js`:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_ID`
- `CLIENT_SECRET`
- `REFRESH_TOKEN`
- `ACCESS_TOKEN`
- `GOOGLE_ID`

> `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`, `ACCESS_TOKEN`, and `GOOGLE_ID` are used for Gmail OAuth2 email delivery.

### Frontend

Optional:

- `VITE_API_BASE_URL` → full backend URL for deployed frontend
- `VITE_PROXY_TARGET` → local dev proxy target in Vite (`vite.config.js`)

---

## Local Development

### 1) Install dependencies

```bash
cd Backend
npm install
```

```bash
cd Frontend
npm install
```

### 2) Configure environment

- Create/update `Backend/.env` with all required keys.

### 3) Run backend

```bash
cd Backend
node server.js
```

### 4) Run frontend

```bash
cd Frontend
npm run dev
```

Frontend runs on Vite dev server (typically `http://localhost:5173`).

---

## Build

```bash
cd Frontend
npm run build
```

---

## Deployment (Free-tier Friendly)

Recommended:

- **Database**: MongoDB Atlas (free tier)
- **Backend**: Render Web Service
- **Frontend**: Vercel

### Backend (Render)

- Root directory: `Backend`
- Start command: `node server.js`
- Set backend env vars from `.env`

### Frontend (Vercel)

- Root directory: `Frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Set:
  - `VITE_API_BASE_URL=https://<your-render-backend-domain>`

### Production Auth/CORS Note

The app currently sets cookies with `sameSite: "strict"` and uses generic `cors()`.
For cross-domain frontend/backend deployments, you may need production-specific CORS + cookie configuration (`credentials`, allowed origin, and cookie policy) to ensure auth cookies are sent properly.

---

## Known Notes

- Backend `package.json` does not currently include dedicated `dev`/`start` scripts.
- Email sending depends on valid Gmail OAuth2 credentials.
- Deposit endpoint is restricted to users with `isSystemUser = true`.

---

## Author

**Joy Sarkar**

- GitHub: https://github.com/joysarkar83
- LinkedIn: https://www.linkedin.com/in/joy-sarkar-169059306
- X: https://x.com/joyxdev
