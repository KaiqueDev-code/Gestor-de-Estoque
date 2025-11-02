const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'seu_usuario',      // Troque para seu usuário MySQL
  password: 'sua_senha',    // Troque para sua senha MySQL
  database: 'gestao_vendas'
});

module.exports = pool.promise();