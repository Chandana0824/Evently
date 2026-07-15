# Evently — Event Management System

A full-stack event booking platform. Users can browse events and book seats,
admins can create and manage events with live registration stats.


> Note: the backend is on a free hosting tier and sleeps when idle. The first
> request after inactivity can take 30–60 seconds to respond.

## Tech stack

- **Frontend:** HTML, CSS, JavaScript (no framework)
- **Backend:** Node.js, Express
- **Data:** In-memory (resets on server restart)

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@evently.com | admin123 |
| User | priya@example.com | priya123 |

## Features

- User signup and login
- Browse events with live seat availability
- Book a seat (prevents overbooking)
- View and cancel your bookings
- Admin dashboard: create events, view stats, delete events

## Running it locally

**Backend:**
```bash
cd evently/backend
npm install
npm start
```
Runs on `http://localhost:5050`.

**Frontend:**
In `evently/frontend/app.js`, set the API URL to your local backend:
```js
const API = 'http://localhost:5050/api';
```
Then open `evently/frontend/index.html` in your browser.

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/events` | List events |
| POST | `/api/events` | Create event (admin) |
| DELETE | `/api/events/:id` | Delete event (admin) |
| POST | `/api/events/:id/book` | Book a seat |
| DELETE | `/api/bookings/:id` | Cancel a booking |
| GET | `/api/users/:id/bookings` | Get user's bookings |
| GET | `/api/admin/dashboard` | Admin stats |

## Notes

- Passwords are stored in plain text for simplicity — not suitable for production.
- Data resets when the backend restarts, since it's stored in memory rather than a database.
