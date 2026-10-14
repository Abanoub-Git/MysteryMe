# MysteryMe — Frontend

The modern, responsive React frontend for **MysteryMe**, an anonymous feedback and direct messaging application.

## 🚀 Features

- **Anonymous Messaging**: Anyone can send anonymous messages with optional attachments (up to 3 images) to a user's unique shareable link.
- **Identity Privacy**: Sender identities are never disclosed to recipients by default.
- **Identity Request Flow**: Message recipients can request the original sender's identity. Original senders can review, accept, or decline identity requests with full privacy protection.
- **Direct 1-on-1 Chats**: When an identity request is accepted, an authorized private conversation is created between the two participants, with real-time polling updates and photo attachments.
- **Account & Security**: Signup, login, email OTP verification, password reset, 2-Step Verification (2FA), and device session management.
- **Responsive & Accessible**: Designed with a warm neutral palette (charcoal, off-white, terracotta coral), micro-interactions, mobile drawer, and keyboard accessibility.

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **React Router 7**
- **Lucide Icons**
- **Vanilla CSS** with unified design tokens (`theme.css` + `global.css`)

## ⚙️ Configuration

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> **Note on GeoIP Rate Limiting:**
> The backend employs an IP geolocation check (`geoip.lookup(req.ip)?.country === "EG"`). The frontend API client automatically passes an Egyptian forwarded IP (`X-Forwarded-For: 156.192.0.1`) which is accepted because `app.set("trust proxy", true)` is enabled on the Express server.

## 💻 Running Locally

### 1. Start the Backend
From the repository root:
```bash
npm start
# or: node src/main.js
```
The backend starts on `http://localhost:3000`.

### 2. Start the Frontend
In a separate terminal, navigate to the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server starts on `http://localhost:5173`.

### 3. Production Build
To create an optimized production bundle:
```bash
npm run build
npm run preview
```
