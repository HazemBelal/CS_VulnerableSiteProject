const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET signup form
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// POST signup (SQLi vulnerability via string concat)
router.post('/signup', async (req, res) => {
  const { username, password, email } = req.body;
  try {
   await db.query(
    'INSERT INTO users (username,password,email) VALUES (?,?,?)',
    [username, password, email]
    );
    res.redirect('/signin');
  } catch (err) {
    res.render('signup', { error: err.message });
  }
});

// GET signin form
router.get('/signin', (req, res) => {
  res.render('signin', { error: null });
});

// POST signin (no password hashing; XSS in error)
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;
  
    try {
// Perform the (vulnerable) SQL query
        const [rows] = await db.query(
        'SELECT id FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
  
      if (rows.length) {
        // Successful login
        req.session.userId = rows[0].id;
        return res.redirect('/catalog');
      }
  
      // Failed login — trigger reflected XSS if username contains <script>…
      return res.render('signin', { error: `Invalid credentials for ${username}` });
    } 
    catch (err) {               // <-- Make sure you capture the exception here
      console.error(err);
      // Show the raw SQL error (unescaped) for XSS demo
      return res.render('signin', { error: err.message });
    }
  });

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/signin'));
});

module.exports = router;
