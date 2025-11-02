const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Login
router.get('/', authController.getLogin);
router.post('/login', authController.postLogin);

// Cadastro
router.post('/cadastro', authController.postCadastro);

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.redirect('/home');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;
