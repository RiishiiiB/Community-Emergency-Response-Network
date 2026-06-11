# Real-Time Emergency SOS System

A polished MERN emergency response app with JWT auth, a shared citizen/responder dashboard, MongoDB alert history, and Socket.IO realtime updates.

## Highlights

- Auth for signed-in users
- Realtime SOS creation and responder status updates with Socket.IO
- Shared dashboard where every user can create SOS alerts and accept or resolve open alerts
- Geolocation-assisted SOS alerts
- Dark mode, loading skeletons, error banners, and responsive layouts
- Deployment-ready structure for Render, Vercel, Docker, and MongoDB Atlas

## Tech Stack

- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Socket.IO
- JWT + bcrypt
- Docker Compose

## Project Structure

```text
emergency-sos-mern/
  client/          React app
  server/          Express API and Socket.IO server
  docker-compose.yml
  render.yaml
  README.md
```

## Local Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start MongoDB locally or use Docker:

```bash
docker compose up mongo
```

4. Run the app:

```bash
npm run dev
```

Client: `http://localhost:5173`

API: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Run Everything With Docker

```bash
docker compose up --build
```

## Demo Flow

1. Sign up or log in with any account.
2. Trigger an SOS from the left-side console.
3. Open another browser or incognito session and log in with another account.
4. Watch the alert arrive live in the shared queue.
5. Click `Accept` to assign yourself as responder.
6. Click `Resolve` and watch both sessions update in realtime.

## API Endpoints

### Auth

| Method | Route | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a citizen, responder, or admin account |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/auth/me` | Fetch current user profile |

### Alerts

All alert routes require `Authorization: Bearer <token>`.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/alerts` | List alerts visible to all authenticated users |
| GET | `/api/alerts/stats` | Get active, acknowledged, resolved, and total counts |
| POST | `/api/alerts` | Create an SOS alert as the authenticated user |
| PATCH | `/api/alerts/:id/acknowledge` | Assign the authenticated user as responder and mark acknowledged |
| PATCH | `/api/alerts/:id/resolve` | Mark alert resolved as the authenticated user |

## Socket Events

The client connects with:

```js
io(SOCKET_URL, {
  auth: { token }
});
```

Server events:

| Event | Payload | Description |
| --- | --- | --- |
| `socket:ready` | `{ user, connectedAt }` | Confirms authenticated socket connection |
| `alert:new` | `{ alert }` | Broadcasts a newly created SOS |
| `alert:update` | `{ alert }` | Broadcasts acknowledgement or resolution |

## Deployment

### Database

Create a MongoDB Atlas database and copy the connection string into `MONGO_URI`.

### Server on Render

Use the included `render.yaml`, or configure manually:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health path: `/health`
- Environment variables:
  - `NODE_ENV=production`
  - `MONGO_URI=<your MongoDB Atlas URI>`
  - `JWT_SECRET=<long random secret>`
  - `CLIENT_URL=<your deployed client URL>`

### Client on Vercel

Set the root directory to `client`.

Environment variables:

- `VITE_API_URL=https://your-api.onrender.com/api`
- `VITE_SOCKET_URL=https://your-api.onrender.com`

The included `vercel.json` handles SPA routing.

## Production Notes

- Use a strong `JWT_SECRET`.
- Restrict `CLIENT_URL` to deployed domains.
- Add organization-level authorization before using this in a real dispatch environment.
- Add SMS or push notifications for guardians and dispatch teams.
- Add audit logging if this becomes a compliance-sensitive system.
