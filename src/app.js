const express = require("express");
const path = require("path");
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
    secret: 'um-segredo-muito-forte-e-diferente',
    resave: false,
    saveUninitialized: true,
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

app.use('/', authRoutes);
app.use('/api', productRoutes);

app.get("/home", authMiddleware, (req, res) => {
    res.render("home", { nomeUsuario: req.session.userName });
});

app.post("/login", (req, res) => {
  const { email, senha } = req.body;
  // Aqui você pode adicionar a lógica para autenticar o usuário com email e senha
  console.log("Email:", email);
  console.log("Senha:", senha);
  res.redirect("/home");
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/sobre", (req, res) => {
  res.render("sobre");
});

app.get("/contato", (req, res) => {
  res.render("contato");
});

app.post("/contato", (req, res) => {
  const { nome, email, mensagem } = req.body;
  // Aqui você pode adicionar a lógica para processar o formulário de contato
  console.log("Nome:", nome);
  console.log("Email:", email);
  console.log("Mensagem:", mensagem);
  res.redirect("/contato");
});

// 404 e 500
app.use((req, res, next) => {
    res.status(404).render("404");
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("500");
});

module.exports = app;
