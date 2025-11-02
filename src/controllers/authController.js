// authController.js
let usuarios = [
  { id: 1, nome: 'Admin', email: 'admin@email.com', senha: '123456' }
];
let nextUserId = 2;

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = (req, res) => {
    const { email, senha } = req.body;
    const user = usuarios.find(u => u.email === email && u.senha === senha);
    if (!user) {
        return res.redirect('/');
    }
    req.session.userId = user.id;
    req.session.userName = user.nome;
    res.redirect('/home');
};

exports.getCadastro = (req, res) => {
  res.render("cadastro", { error: null });
};

exports.postCadastro = (req, res) => {
    const { nome, email, senha } = req.body;
    if (usuarios.find(u => u.email === email)) {
        return res.redirect('/');
    }
    usuarios.push({ id: nextUserId++, nome, email, senha });
    res.redirect('/');
};
