const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = (db) => {
  const router = express.Router();

  router.get('/register', (req, res) => {
    res.render('register');
  });

  router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.render('register', { error: 'Vul alle velden in' });
    }

    const hashed = bcrypt.hashSync(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], function(err) {
      if (err) {
        return res.render('register', { error: 'Gebruikersnaam bestaat al' });
      }
      res.redirect('/login');
    });
  });

  router.get('/login', (req, res) => {
    res.render('login');
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err || !user) {
        return res.render('login', { error: 'Onbekende gebruiker' });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return res.render('login', { error: 'Wachtwoord fout' });
      }

      req.session.user = { id: user.id, username: user.username };
      res.redirect('/');
    });
  });

  router.get('/logout', (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });

  return router;
};
