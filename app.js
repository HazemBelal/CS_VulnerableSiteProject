// app.js
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { session: cfg } = require('./config');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

const app = express();

// 1) View engine + layouts
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'partials/layout');

// 2) Static files
app.use(express.static(path.join(__dirname, 'public')));

// 3) Body parsers
app.use(express.urlencoded({ extended: false }));  // for HTML forms
app.use(express.json());                          // for JSON (fetch)

// 4) Cookie parser & Sessions
app.use(cookieParser());
app.use(session({
  secret: cfg.secret,
  resave: cfg.resave,
  saveUninitialized: cfg.saveUninitialized,
  cookie: cfg.cookie
}));

// 5) CSRF protection (must come after cookie/session middleware)
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// 6) Expose variables to all views
app.use((req, res, next) => {
  // CSRF token for forms and AJAX requests
  res.locals.csrfToken = req.csrfToken();
  // Current user information
  res.locals.user = req.session.userId || null;
  next();
});

// 7) Routes
app.use(authRoutes);
app.use(shopRoutes);

// 8) Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 9) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CyberShop running on http://localhost:${PORT}`));