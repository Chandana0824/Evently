# Evently — Event Management System

A full-stack event management platform: browse events, book seats with live
capacity tracking, manage your bookings, and an admin dashboard to create
events and monitor registrations.

**Stack:** Node.js + Express (backend, in-memory data) · Vanilla JS/HTML/CSS (frontend)

## Features

- Sign up / log in (separate admin and user roles)
- Browse events with live seat capacity bars
- Book a seat (blocks double-booking and overfull events)
- My Bookings — view and cancel your reservations
- Admin dashboard — live stats, create new events, delete events

## Run it locally

You need [Node.js](https://nodejs.org) installed (v18+).

**1. Start the backend**
```bash
cd backend
npm install
npm start
```
This runs the API at `http://localhost:5050`.

**2. Open the frontend**
Just open `frontend/index.html` directly in your browser (double-click it),
or serve it so relative paths behave consistently:
```bash
cd frontend
npx serve .
```

**3. Log in with a demo account**
```
Admin → admin@evently.com / admin123
User  → priya@example.com / priya123
```
Or sign up as a new user from the login screen.

## Project structure

```
evently/
├── backend/
│   ├── server.js       # Express API — auth, events, bookings, admin
│   └── package.json
└── frontend/
    ├── index.html
    ├── app.js           # Client-side router + all views
    └── style.css
```

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/events` | List all events with live booking counts |
| POST | `/api/events` | Create an event (admin) |
| DELETE | `/api/events/:id` | Delete an event (admin) |
| POST | `/api/events/:id/book` | Book a seat |
| DELETE | `/api/bookings/:id` | Cancel a booking |
| GET | `/api/users/:id/bookings` | Get a user's bookings |
| GET | `/api/admin/dashboard` | Admin stats + per-event fill rate |

## Notes

- Data is stored **in-memory** — restarting the backend resets everything to
  the seed data. Good for demos, not for production use.
- Passwords are stored in plaintext for demo simplicity — do not reuse real
  passwords, and don't do this in a real production app (use bcrypt + a
  real database like PostgreSQL/MongoDB for that).

## What a production version would add

- A real database (PostgreSQL/MongoDB) instead of in-memory arrays
- Password hashing (bcrypt) and real JWT-based auth instead of mock tokens
- Image upload for event banners
- Email confirmations for bookings
- Waitlists for full events
