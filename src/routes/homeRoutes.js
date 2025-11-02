const express = require('express');
const router = express.Router();

// Rota principal (home)
router.get("/", (req, res) => {
  res.render("home", { nomeUsuario: req.session.userName });
});

module.exports = router;
