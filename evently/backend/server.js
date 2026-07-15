const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// ---------- In-memory data store ----------
let users = [
  { id: 1, name: 'Admin User', email: 'admin@evently.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', password: 'priya123', role: 'user' },
];

let events = [
  {
    id: 1,
    title: 'Tech Innovators Summit 2026',
    description: 'A gathering of developers, founders, and product leaders to discuss the future of AI-driven software.',
    date: '2026-08-14',
    time: '10:00 AM',
    location: 'Bengaluru Convention Center',
    category: 'Technology',
    capacity: 200,
    image: 'tech-summit.jpg',
  },
  {
    id: 2,
    title: 'Campus Cultural Fest',
    description: 'Annual inter-college cultural festival featuring music, dance, and drama competitions.',
    date: '2026-09-02',
    time: '4:00 PM',
    location: 'Main Auditorium',
    category: 'Cultural',
    capacity: 500,
    image: 'cultural-fest.jpg',
  },
  {
    id: 3,
    title: 'Startup Pitch Night',
    description: 'Early-stage founders pitch their ideas to a panel of investors and mentors.',
    date: '2026-07-28',
    time: '6:30 PM',
    location: 'Innovation Hub, Koramangala',
    category: 'Business',
    capacity: 100,
    image: 'pitch-night.jpg',
  },
];

let bookings = [
  { id: 1, eventId: 1, userId: 2, bookedAt: '2026-07-01T10:12:00Z', status: 'confirmed' },
];

let nextUserId = 3;
let nextEventId = 4;
let nextBookingId = 2;

// ---------- Auth ----------
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
  if (users.find(u => u.email === email)) return res.status(409).json({ message: 'Email already registered' });
  const user = { id: nextUserId++, name, email, password, role: 'user' };
  users.push(user);
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: `mock-token-${user.id}` });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: `mock-token-${user.id}` });
});

// ---------- Events ----------
app.get('/api/events', (req, res) => {
  const enriched = events.map(e => ({
    ...e,
    booked: bookings.filter(b => b.eventId === e.id && b.status === 'confirmed').length,
  }));
  res.json(enriched);
});

app.post('/api/events', (req, res) => {
  const { title, description, date, time, location, category, capacity } = req.body;
  const event = { id: nextEventId++, title, description, date, time, location, category, capacity: Number(capacity) };
  events.push(event);
  res.status(201).json(event);
});

// ---------- Bookings / RSVP ----------
app.post('/api/events/:id/book', (req, res) => {
  const eventId = Number(req.params.id);
  const { userId } = req.body;
  const event = events.find(e => e.id === eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const confirmedCount = bookings.filter(b => b.eventId === eventId && b.status === 'confirmed').length;
  if (confirmedCount >= event.capacity) return res.status(400).json({ message: 'Event is full' });

  if (bookings.find(b => b.eventId === eventId && b.userId === userId && b.status === 'confirmed')) {
    return res.status(409).json({ message: 'Already booked' });
  }

  const booking = { id: nextBookingId++, eventId, userId, bookedAt: new Date().toISOString(), status: 'confirmed' };
  bookings.push(booking);
  res.status(201).json(booking);
});

app.get('/api/users/:id/bookings', (req, res) => {
  const userId = Number(req.params.id);
  const myBookings = bookings
    .filter(b => b.userId === userId && b.status === 'confirmed')
    .map(b => ({ ...b, event: events.find(e => e.id === b.eventId) }));
  res.json(myBookings);
});

app.delete('/api/bookings/:id', (req, res) => {
  const bookingId = Number(req.params.id);
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = 'cancelled';
  res.json({ message: 'Booking cancelled' });
});

// ---------- Event management ----------
app.delete('/api/events/:id', (req, res) => {
  const eventId = Number(req.params.id);
  const idx = events.findIndex(e => e.id === eventId);
  if (idx === -1) return res.status(404).json({ message: 'Event not found' });
  events.splice(idx, 1);
  bookings = bookings.filter(b => b.eventId !== eventId);
  res.json({ message: 'Event deleted' });
});

// ---------- Admin ----------
app.get('/api/admin/dashboard', (req, res) => {
  const totalEvents = events.length;
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalBookings = bookings.filter(b => b.status === 'confirmed').length;
  const eventStats = events.map(e => ({
    id: e.id,
    title: e.title,
    capacity: e.capacity,
    booked: bookings.filter(b => b.eventId === e.id && b.status === 'confirmed').length,
  }));
  res.json({ totalEvents, totalUsers, totalBookings, eventStats });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`EMS backend running on http://localhost:${PORT}`));
