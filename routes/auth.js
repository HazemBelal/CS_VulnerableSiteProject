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
    const sql = `INSERT INTO users (username,password,email)
                 VALUES ('${username}','${password}','${email}')`;
    await db.query(sql);
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
  const [rows] = await db.query(
    `SELECT * FROM users 
     WHERE username='${username}' AND password='${password}'`
  );
  if (rows.length) {
    req.session.userId = rows[0].id;
    return res.redirect('/catalog');
  }
  // error rendered raw: reflected XSS
  res.render('signin', { error: 'Invalid credentials for '+ username });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/signin'));
});

module.exports = router;
