const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Middleware: check login
  function requireLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
  }

  // GET alle notities
  router.get('/', requireLogin, (req, res) => {
    db.all('SELECT * FROM notes WHERE user_id = ?', [req.session.user.id], (err, notes) => {
      if (err) notes = [];
      res.render('notes', { notes });
    });
  });

  // POST nieuwe notitie (alleen titel nodig)
  router.post('/notes', requireLogin, (req, res) => {
    const { title } = req.body;
    if (!title) return res.redirect('/');

    db.run('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)', [req.session.user.id, title, ''], err => {
      res.redirect('/');
    });
  });

  // GET notitie detail (bewerken)
  router.get('/notes/:id', requireLogin, (req, res) => {
    const noteId = req.params.id;
    db.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [noteId, req.session.user.id], (err, note) => {
      if (err || !note) return res.redirect('/');
      res.render('note-edit', { note });
    });
  });

  // POST notitie bewerken
  router.post('/notes/:id', requireLogin, (req, res) => {
    const noteId = req.params.id;
    const { title, content } = req.body;
    if (!title || !content) return res.redirect(`/notes/${noteId}`);

    db.run('UPDATE notes SET title = ?, content = ? WHERE id = ? AND user_id = ?', [title, content, noteId, req.session.user.id], err => {
      res.redirect('/');
    });
  });

  // POST notitie verwijderen
  router.post('/notes/delete/:id', requireLogin, (req, res) => {
    const noteId = req.params.id;
    db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, req.session.user.id], err => {
      res.redirect('/');
    });
  });

  return router;
};
