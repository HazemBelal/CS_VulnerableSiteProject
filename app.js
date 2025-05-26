// app.js
const express        = require('express');
const expressLayouts = require('express-ejs-layouts');
const path           = require('path');
const csurf          = require('csurf');
const cookieParser   = require('cookie-parser');
const session        = require('express-session');
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
app.use(express.json());                            // for JSON (fetch)

// 4) Cookie parser & Sessions
app.use(cookieParser());
app.use(session({
  secret:            cfg.secret,
  resave:            cfg.resave,
  saveUninitialized: cfg.saveUninitialized,
  cookie:            cfg.cookie
}));
// 4b) CSRF middleware (must come _after_ cookie/session)
app.use(csurf({ cookie: true }));

// Expose CSRF token to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
// 5) Expose current user to all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId || null;
  next();
});

// 6) Routes
app.use(authRoutes);
app.use(shopRoutes);

// 7) Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CyberShop running on http://localhost:${PORT}`));
