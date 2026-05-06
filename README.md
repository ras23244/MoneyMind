# MoneyMind

MoneyMind is a personal finance web application for tracking spending, managing budgets and goals, organizing bills and notes, and staying informed with real-time notifications. It includes a React + Vite frontend and an Express + MongoDB backend with Google OAuth and AI support.

## Features

- Financial dashboard with charts and summaries
- Transaction tracking with categories, tags, and linked accounts
- Budget and goal management
- Notes and bill tracking
- JWT authentication and Google OAuth login
- Real-time notifications via Socket.io
- AI-enabled backend support using Google Generative AI
- Responsive UI for desktop and mobile

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Radix UI components
- Recharts for visualizations
- React Query for data fetching
- Socket.io-client for live updates

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Passport.js for Google OAuth
- JSON Web Tokens for authentication
- Socket.io for websocket events
- Nodemailer for email notifications
- Google Generative AI integration

## Prerequisites

- Node.js v18 or newer
- npm or yarn
- MongoDB (local or Atlas)

## Setup

### Clone repository

```bash
git clone <your-repository-url>
cd MoneyMind
```

### Backend

```bash
cd Backend
npm install
```

Create a `Backend/.env` file with:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/MoneyMind
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_google_generative_api_key
APP_PASSWORD=your_email_app_password
```

Start the backend:

```bash
node server.js
```

> Note: Backend defaults to port `3000`. If you select a different port, update `BACKEND_URL` and the frontend API URL accordingly.

### Frontend

```bash
cd ../Frontend
npm install
```

Create a `Frontend/.env` file if you need a custom API endpoint:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

### Open the app

Visit the Vite URL shown in the terminal, typically `http://localhost:5173`.

## Environment Variables

Backend variables:

- `PORT` — backend port
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `REFRESH_TOKEN_SECRET` — refresh token signing secret (optional)
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret
- `BACKEND_URL` — backend base URL for callback redirects
- `FRONTEND_URL` — frontend URL for CORS and redirects
- `GEMINI_API_KEY` — Google Generative AI key
- `APP_PASSWORD` — email provider app password for sending mail

## Repository Structure

- `Backend/` — API server, controllers, routes, models, middleware, and socket logic
- `Frontend/` — React app, components, pages, assets, and styles

## Notes

- Keep `.env` secrets out of source control.
- Align `BACKEND_URL`, `FRONTEND_URL`, and `VITE_API_URL` for local development.
- The backend currently uses `node server.js` instead of a dedicated dev script.

## License

This project is licensed under the ISC License.
