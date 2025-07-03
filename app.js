const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { engine } = require('express-handlebars');

const app = express();
const PORT = 64545;

// Database setup
const db = new sqlite3.Database('./database.sqlite');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// View engine setup
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Static files (voor Bootstrap CSS via CDN, dus geen eigen css nodig, maar kan hier)
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  store: new SQLiteStore,
  secret: 'supergeheimsessie',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24*60*60*1000 } // 1 dag
}));

// Middleware om user info beschikbaar te maken in templates
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Routes importeren
const authRoutes = require('./routes/auth')(db);
const notesRoutes = require('./routes/notes')(db);

app.use('/', authRoutes);
app.use('/', notesRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
