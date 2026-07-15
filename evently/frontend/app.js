const API = 'https://evently-mu1d.onrender.com/api';
const app = document.getElementById('app');

let state = {
  view: 'login', // login | signup | events | mybookings | admin
  user: JSON.parse(localStorage.getItem('ems_user') || 'null'),
  events: [],
  myBookings: [],
  adminData: null,
  error: '',
};

function setState(patch){ state = { ...state, ...patch }; render(); }

async function fetchEvents(){
  const res = await fetch(`${API}/events`);
  state.events = await res.json();
}
async function fetchMyBookings(){
  if(!state.user) return;
  const res = await fetch(`${API}/users/${state.user.id}/bookings`);
  state.myBookings = await res.json();
}
async function fetchAdmin(){
  const res = await fetch(`${API}/admin/dashboard`);
  state.adminData = await res.json();
}

function fmtDate(d){
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function nav(active){
  const isAdmin = state.user?.role === 'admin';
  return `
  <div class="nav">
    <div class="nav-brand">Evently<span class="dot">.</span></div>
    <div class="nav-links">
      <button class="linklike ${active==='events'?'active':''}" onclick="goTo('events')">Browse Events</button>
      ${!isAdmin ? `<button class="linklike ${active==='mybookings'?'active':''}" onclick="goTo('mybookings')">My Bookings</button>` : ''}
      ${isAdmin ? `<button class="linklike ${active==='admin'?'active':''}" onclick="goTo('admin')">Admin Dashboard</button>` : ''}
    </div>
    <div class="nav-user">
      ${isAdmin ? `<span class="nav-badge">Admin</span>` : ''}
      <span style="font-size:13.5px; opacity:0.85;">${state.user.name}</span>
      <button class="btn-ghost" onclick="logout()">Log out</button>
    </div>
  </div>`;
}

async function goTo(view){
  state.view = view;
  if(view === 'events') await fetchEvents();
  if(view === 'mybookings') await fetchMyBookings();
  if(view === 'admin') await fetchAdmin();
  render();
}

function logout(){
  localStorage.removeItem('ems_user');
  setState({ user: null, view: 'login', error: '' });
}

// ---------- Auth views ----------
function renderLogin(){
  app.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">Evently<span class="dot">.</span></div>
      <div class="auth-sub">Sign in to manage and book campus & community events.</div>
      ${state.error ? `<div class="error-msg">${state.error}</div>` : ''}
      <div class="field"><label>Email</label><input id="email" type="email" placeholder="you@example.com" /></div>
      <div class="field"><label>Password</label><input id="password" type="password" placeholder="••••••••" /></div>
      <button class="btn-primary" onclick="doLogin()">Log in</button>
      <div class="auth-switch">New here? <button onclick="setState({view:'signup', error:''})">Create an account</button></div>
      <div class="auth-demo">DEMO ACCOUNTS<br/>Admin → admin@evently.com / admin123<br/>User → priya@example.com / priya123</div>
    </div>
  </div>`;
}

function renderSignup(){
  app.innerHTML = `
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">Evently<span class="dot">.</span></div>
      <div class="auth-sub">Create an account to start booking events.</div>
      ${state.error ? `<div class="error-msg">${state.error}</div>` : ''}
      <div class="field"><label>Full name</label><input id="name" placeholder="Your name" /></div>
      <div class="field"><label>Email</label><input id="email" type="email" placeholder="you@example.com" /></div>
      <div class="field"><label>Password</label><input id="password" type="password" placeholder="Create a password" /></div>
      <button class="btn-primary" onclick="doSignup()">Sign up</button>
      <div class="auth-switch">Already have an account? <button onclick="setState({view:'login', error:''})">Log in</button></div>
    </div>
  </div>`;
}

async function doLogin(){
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
  const data = await res.json();
  if(!res.ok){ setState({ error: data.message }); return; }
  localStorage.setItem('ems_user', JSON.stringify(data));
  await goTo(data.role === 'admin' ? 'admin' : 'events');
  setState({ user: data, error: '' });
}

async function doSignup(){
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API}/auth/signup`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password}) });
  const data = await res.json();
  if(!res.ok){ setState({ error: data.message }); return; }
  localStorage.setItem('ems_user', JSON.stringify(data));
  await goTo('events');
  setState({ user: data, error: '' });
}

// ---------- Events view ----------
function renderEvents(){
  const cards = state.events.map(e => {
    const pct = Math.min(100, Math.round((e.booked / e.capacity) * 100));
    const full = e.booked >= e.capacity;
    return `
    <div class="ticket">
      <div class="ticket-top">
        <span class="ticket-category">${e.category}</span>
        <div class="ticket-title">${e.title}</div>
        <div class="ticket-desc">${e.description}</div>
        <div class="ticket-meta">
          <div><span class="icon">◆</span> ${fmtDate(e.date)} · ${e.time}</div>
          <div><span class="icon">◈</span> ${e.location}</div>
        </div>
      </div>
      <div class="ticket-stub">
        <div class="capacity-bar">
          <div class="capacity-track"><div class="capacity-fill" style="width:${pct}%"></div></div>
          <div class="capacity-label">${e.booked} / ${e.capacity} booked</div>
        </div>
        <button class="${full?'btn-book':'btn-book'}" ${full?'disabled':''} onclick="bookEvent(${e.id})">${full?'Full':'Book seat'}</button>
      </div>
    </div>`;
  }).join('');

  app.innerHTML = `
    ${nav('events')}
    <div class="page">
      <div class="eyebrow">Upcoming</div>
      <h1 class="page-title">Browse events</h1>
      <div class="page-sub">Discover and reserve your seat at tech, cultural, and business events happening near you.</div>
      <div class="event-grid">${cards}</div>
    </div>`;
}

async function bookEvent(id){
  const res = await fetch(`${API}/events/${id}/book`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: state.user.id }) });
  const data = await res.json();
  if(!res.ok){ alert(data.message); return; }
  await goTo('events');
}

// ---------- My bookings ----------
function renderMyBookings(){
  const items = state.myBookings.length ? state.myBookings.map(b => `
    <div class="booking-item">
      <div>
        <div class="b-title">${b.event.title}</div>
        <div class="b-meta">${fmtDate(b.event.date)} · ${b.event.time} · ${b.event.location}</div>
      </div>
      <span class="status-confirmed">Confirmed</span>
      <button class="btn-ghost" onclick="cancelBooking(${b.id})">Cancel</button>
    </div>`).join('') : `
    <div class="empty-state">
      <div class="icon">◇</div>
      <div>No bookings yet. Head to Browse Events to reserve a seat.</div>
    </div>`;

  app.innerHTML = `
    ${nav('mybookings')}
    <div class="page">
      <div class="eyebrow">Your seats</div>
      <h1 class="page-title">My bookings</h1>
      <div class="page-sub">Events you've reserved a seat for.</div>
      ${items}
    </div>`;
}

async function cancelBooking(bookingId){
  if(!confirm('Cancel this booking?')) return;
  await fetch(`${API}/bookings/${bookingId}`, { method:'DELETE' });
  await goTo('mybookings');
}

// ---------- Admin dashboard ----------
function renderAdmin(){
  const d = state.adminData;
  const rows = d.eventStats.map(e => {
    const pct = Math.min(100, Math.round((e.booked/e.capacity)*100));
    const full = e.booked >= e.capacity;
    return `
    <div class="admin-row">
      <div>${e.title}</div>
      <div>${e.booked} / ${e.capacity}</div>
      <div><div class="fill-bar"><div style="width:${pct}%"></div></div></div>
      <div class="${full?'tag-full':'tag-ok'}">${full?'FULL':'OPEN'}</div>
      <div><button class="btn-ghost" onclick="deleteEvent(${e.id})">Delete</button></div>
    </div>`;
  }).join('');

  app.innerHTML = `
    ${nav('admin')}
    <div class="page">
      <div class="eyebrow">Overview</div>
      <h1 class="page-title">Admin dashboard</h1>
      <div class="page-sub">Monitor registrations and manage events across the platform.</div>

      <div class="stat-row">
        <div class="stat-card"><div class="stat-num">${d.totalEvents}</div><div class="stat-label">Live Events</div></div>
        <div class="stat-card"><div class="stat-num">${d.totalUsers}</div><div class="stat-label">Registered Users</div></div>
        <div class="stat-card"><div class="stat-num">${d.totalBookings}</div><div class="stat-label">Total Bookings</div></div>
      </div>

      <div class="panel">
        <div class="panel-title">Create new event</div>
        <div class="form-grid">
          <div class="field"><label>Title</label><input id="ne-title" placeholder="Event title" /></div>
          <div class="field"><label>Category</label><input id="ne-category" placeholder="e.g. Technology" /></div>
          <div class="field"><label>Date</label><input id="ne-date" type="date" /></div>
          <div class="field"><label>Time</label><input id="ne-time" placeholder="e.g. 5:00 PM" /></div>
          <div class="field"><label>Location</label><input id="ne-location" placeholder="Venue" /></div>
          <div class="field"><label>Capacity</label><input id="ne-capacity" type="number" placeholder="100" /></div>
          <div class="field full"><label>Description</label><input id="ne-desc" placeholder="Short description" /></div>
        </div>
        <button class="btn-book" onclick="createEvent()">+ Create event</button>
      </div>

      <div class="admin-table">
        <div class="admin-table-head"><div>Event</div><div>Booked</div><div>Fill rate</div><div>Status</div><div></div></div>
        ${rows}
      </div>
    </div>`;
}

async function deleteEvent(id){
  if(!confirm('Delete this event? This cannot be undone.')) return;
  await fetch(`${API}/events/${id}`, { method:'DELETE' });
  await goTo('admin');
}

async function createEvent(){
  const body = {
    title: document.getElementById('ne-title').value.trim(),
    category: document.getElementById('ne-category').value.trim(),
    date: document.getElementById('ne-date').value,
    time: document.getElementById('ne-time').value.trim(),
    location: document.getElementById('ne-location').value.trim(),
    capacity: document.getElementById('ne-capacity').value,
    description: document.getElementById('ne-desc').value.trim(),
  };
  if(!body.title || !body.date || !body.time || !body.location || !body.capacity){
    alert('Please fill in title, date, time, location and capacity.');
    return;
  }
  try{
    const res = await fetch(`${API}/events`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!res.ok){
      const err = await res.json().catch(()=>({message:'Unknown server error'}));
      alert('Failed to create event: ' + (err.message || res.status));
      return;
    }
  }catch(e){
    alert('Could not reach the server. It may still be waking up (Render free tier) — wait 30-60s and try again.\n\n' + e.message);
    return;
  }
  await goTo('admin');
}

// ---------- Router ----------
function render(){
  if(!state.user){
    if(state.view === 'signup') renderSignup(); else renderLogin();
    return;
  }
  if(state.view === 'events') renderEvents();
  else if(state.view === 'mybookings') renderMyBookings();
  else if(state.view === 'admin') renderAdmin();
  else renderEvents();
}

// ---------- Init ----------
(async function init(){
  if(state.user){
    await goTo(state.user.role === 'admin' ? 'admin' : 'events');
  } else {
    render();
  }
})();
