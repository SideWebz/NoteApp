const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Middleware: check login
  function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
  }

  router.get('/', requireLogin, (req, res) => {
    db.all('SELECT * FROM notes WHERE user_id = ?', [req.session.user.id], (err, notes) => {
      if (err) notes = [];
      res.render('notes', { notes });
    });
  });

  router.post('/notes', requireLogin, (req, res) => {
    const { content } = req.body;
    if (!content) return res.redirect('/notes');

    db.run('INSERT INTO notes (user_id, content) VALUES (?, ?)', [req.session.user.id, content], err => {
      res.redirect('/notes');
    });
  });

  router.post('/notes/delete/:id', requireLogin, (req, res) => {
    const noteId = req.params.id;
    db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, req.session.user.id], err => {
      res.redirect('/notes');
    });
  });

  return router;
};
