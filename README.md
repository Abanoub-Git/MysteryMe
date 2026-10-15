# 🚀 MysteryMe — Anonymous Messaging Platform

MysteryMe is a full-stack web application that allows users to receive anonymous messages through shareable links, request to discover the sender's identity, and connect through private chats.

## ✨ Features

- **Anonymous Messaging:** Receive anonymous messages through a personal shareable link.
- **Identity Discovery Requests:** Request to discover who sent an anonymous message.
- **Private Conversations:** Connect and chat privately with other users.
- **Authentication:** Register using email and password or sign in with Google.
- **Email Verification:** Verify accounts using email OTP.
- **Password Reset:** Recover accounts securely.
- **Two-Step Verification:** Optional additional account security.
- **Token Management:** Access and refresh tokens for authentication sessions.
- **Profile Image Uploads:** Upload profile pictures using Multer.
- **Caching:** Redis caching to improve performance.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Context API
- Custom Hooks
- Reusable Components
- Vite

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- Modular Architecture
- Repositories and Middleware
- Zod Validation
- Multer
- Redis
- bcrypt
- Google OAuth
- JWT Access & Refresh Tokens

## 📁 Project Structure

```text
MysteryMe/
├── frontend/          # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── src/               # Express backend
│   ├── common/
│   ├── DB/
│   ├── middleware/
│   ├── modules/
│   ├── config.js
│   └── main.js
├── assets/            # Uploaded files
├── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB connection
- Redis, if using the caching features
- Google OAuth credentials, if using Google Login

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd MysteryMe
```

### 2. Set Up the Backend

Install dependencies from the project root:

```bash
npm install
```

Create a `.env` file in the root directory and configure the environment variables required by the backend. Use `.env.example` as a reference if available.

Start the backend in development mode:

```bash
npm run start:dev
```

The backend runs locally at:

**http://localhost:3000**

### 3. Set Up the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `frontend/.env` file and configure the required frontend environment variables. For example:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal, usually:

**http://localhost:5173**

### 4. Run Both Applications

Keep both terminals running:

| Application | Command | Local URL |
|---|---|---|
| Backend | `npm run start:dev` | `http://localhost:3000` |
| Frontend | `npm run dev` inside `frontend/` | `http://localhost:5173` |

> **Note:** Make sure the backend environment variables, MongoDB connection, Redis configuration, Google OAuth settings, and frontend API URL are configured correctly for your local environment.

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** AWS EC2 (Ubuntu)
- **Process Management:** PM2

## 🔗 Live Demo

[Try MysteryMe](https://mystery-me-eta.vercel.app/)

---

Built with ❤️ as part of my Full-Stack Development journey.
