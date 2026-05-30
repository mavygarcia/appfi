require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_12345';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Permitir upload de fotos base64 maiores
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir arquivos estáticos do frontend (pasta raiz)
app.use(express.static(path.join(__dirname)));

// Pool de conexão do banco de dados
let pool;

/**
 * Inicializa o banco de dados e cria as tabelas
 */
async function initializeDB() {
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  try {
    // 1. Conecta temporariamente sem banco de dados
    const tempConnection = await mysql.createConnection(connectionConfig);
    const dbName = process.env.DB_NAME || 'appfi';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await tempConnection.end();

    // 2. Conecta ao pool definitivo com o banco selecionado
    pool = mysql.createPool({
      ...connectionConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(` Conectado com sucesso ao MySQL na porta ${connectionConfig.port}, banco: ${dbName}`);

    // 3. Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        photo MEDIUMTEXT DEFAULT NULL,
        reset_token VARCHAR(255) DEFAULT NULL,
        reset_token_expires DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Tabela de transações vinculada ao usuário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(10) NOT NULL,
        \`desc\` VARCHAR(255) NOT NULL,
        cat VARCHAR(100) NOT NULL,
        val DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tentar adicionar a coluna user_id caso a tabela de transações já existisse sem ela
    try {
      await pool.query('ALTER TABLE transactions ADD COLUMN user_id INT NOT NULL AFTER id');
      await pool.query('ALTER TABLE transactions ADD CONSTRAINT fk_transactions_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    } catch (e) {
      // Ignorar se a coluna/constraint já existir
    }

    // 5. Tabela de metas vinculada ao usuário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        target DECIMAL(10, 2) NOT NULL,
        current DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        deadline DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Tentar adicionar a coluna user_id caso a tabela de metas já existisse sem ela
    try {
      await pool.query('ALTER TABLE goals ADD COLUMN user_id INT NOT NULL AFTER id');
      await pool.query('ALTER TABLE goals ADD CONSTRAINT fk_goals_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    } catch (e) {
      // Ignorar se a coluna/constraint já existir
    }

    // 6. Inserir usuário demo se a tabela users estiver vazia
    const [rowsUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rowsUsers[0].count === 0) {
      console.log(' Semeando banco com usuário demo...');
      const hashedPassword = await bcrypt.hash('12345678', 10);
      const [resUser] = await pool.query(
        'INSERT INTO users (id, name, lastname, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'João', 'da Silva', 'joao@email.com', '(11) 99999-9999', hashedPassword]
      );

      // Semeando transações demo vinculadas ao usuário 1
      console.log(' Semeando banco com transações demo...');
      const seedTxs = [
        [1, 'income', 'Salário', '💰 Salário', 5500.00, '2026-05-01'],
        [1, 'expense', 'Aluguel', '🏠 Moradia', 1200.00, '2026-05-01'],
        [1, 'expense', 'Supermercado', '🍔 Alimentação', 420.00, '2026-05-02'],
        [1, 'expense', 'Uber', '🚌 Transporte', 85.00, '2026-05-03'],
        [1, 'income', 'Freelance', '📦 Outros', 800.00, '2026-05-04'],
        [1, 'expense', 'Academia', '❤️ Saúde', 90.00, '2026-05-05'],
        [1, 'expense', 'Netflix', '💻 Tecnologia', 55.00, '2026-05-05'],
        [1, 'expense', 'Restaurante', '🎮 Lazer', 150.00, '2026-05-06']
      ];
      for (const tx of seedTxs) {
        await pool.query(
          'INSERT INTO transactions (user_id, type, `desc`, cat, val, date) VALUES (?, ?, ?, ?, ?, ?)',
          tx
        );
      }

      // Semeando metas demo vinculadas ao usuário 1
      console.log(' Semeando banco com metas demo...');
      const seedGoals = [
        [1, 'Reserva de Emergência', 10000.00, 3500.00, '2026-12-31'],
        [1, 'Viagem Europa', 15000.00, 4200.00, '2027-06-30']
      ];
      for (const g of seedGoals) {
        await pool.query(
          'INSERT INTO goals (user_id, name, target, current, deadline) VALUES (?, ?, ?, ?, ?)',
          g
        );
      }
    }

    console.log(' Banco de dados pronto e inicializado.');
  } catch (error) {
    console.error('❌ Erro crítico ao inicializar o banco de dados:', error);
    process.exit(1);
  }
}

/* ==========================================
   MIDDLEWARE DE AUTENTICAÇÃO
   ========================================== */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Armazena { id, email, name, lastname }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/* ==========================================
   ROTAS DE AUTENTICAÇÃO (SPl01-US01 a US04)
   ========================================== */

// US01: Cadastro de usuário
app.post('/api/auth/register', async (req, res) => {
  const { name, lastname, email, phone, password } = req.body;

  if (!name || !lastname || !email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve possuir no mínimo 8 caracteres' });
  }

  try {
    // Verificar se o e-mail já existe
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, lastname, email, phone, password) VALUES (?, ?, ?, ?, ?)',
      [name, lastname, email, phone || null, hashedPassword]
    );

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: {
        id: result.insertId,
        name,
        lastname,
        email,
        phone
      }
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// US02: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT (expira em 24 horas)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, lastname: user.lastname },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        photo: user.photo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// US04: Recuperação de Senha (solicitação de link/token)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'O e-mail é obrigatório' });
  }

  try {
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Por segurança, retorna mensagem de sucesso mesmo se e-mail não existir
      return res.json({ message: 'Se o e-mail estiver cadastrado, um link de redefinição foi enviado!' });
    }

    const userId = rows[0].id;
    // Gerar token simples de recuperação (ou JWT curto)
    const resetToken = jwt.sign({ id: userId, purpose: 'reset-password' }, JWT_SECRET, { expiresIn: '1h' });
    const expiresDate = new Date(Date.now() + 3600000); // 1 hora de validade

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expiresDate, userId]
    );

    // Retorna o token na resposta para facilitar os testes e fluxo local
    res.json({
      message: 'Link de redefinição de senha gerado!',
      resetToken,
      info: 'Em produção, este token seria enviado via e-mail.'
    });
  } catch (error) {
    console.error('Erro ao solicitar redefinição de senha:', error);
    res.status(500).json({ error: 'Erro no servidor ao solicitar redefinição de senha' });
  }
});

// US04: Redefinição de Senha (aplicação da nova senha)
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve possuir no mínimo 8 caracteres' });
  }

  try {
    // Validar JWT do token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const [rows] = await pool.query(
      'SELECT id, reset_token, reset_token_expires FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    // Adicionalmente verifica se o token é exatamente o mesmo salvo no banco
    if (user.reset_token !== token || new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

/* ==========================================
   ROTAS DE PERFIL (SP01-US03)
   ========================================== */

// GET Perfil do usuário logado
app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, lastname, email, phone, photo FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
  }
});

// PUT Atualizar perfil do usuário logado
app.put('/api/profile', requireAuth, async (req, res) => {
  const { name, lastname, email, phone, photo } = req.body;

  if (!name || !lastname || !email) {
    return res.status(400).json({ error: 'Nome, Sobrenome e E-mail são obrigatórios' });
  }

  try {
    // Validar unicidade do e-mail (caso tenha sido alterado)
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está sendo utilizado por outro usuário' });
    }

    // Se houver alteração de foto (base64)
    await pool.query(
      'UPDATE users SET name = ?, lastname = ?, email = ?, phone = ?, photo = ? WHERE id = ?',
      [name, lastname, email, phone || null, photo || null, req.user.id]
    );

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: {
        id: req.user.id,
        name,
        lastname,
        email,
        phone,
        photo
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados do perfil' });
  }
});

/* ==========================================
   ROTAS DE TRANSAÇÕES (FILTRADAS POR USUÁRIO)
   ========================================== */

// GET todas do usuário autenticado
app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, type, `desc`, cat, CAST(val AS DOUBLE) AS val, DATE_FORMAT(date, "%Y-%m-%d") AS date FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações no banco de dados' });
  }
});

// POST criar vinculada ao usuário
app.post('/api/transactions', requireAuth, async (req, res) => {
  const { type, desc, cat, val, date } = req.body;
  if (!type || !desc || !cat || val === undefined || !date) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO transactions (user_id, type, `desc`, cat, val, date) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, type, desc, cat, val, date]
    );
    res.status(201).json({
      id: result.insertId,
      type,
      desc,
      cat,
      val: parseFloat(val),
      date
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao salvar transação no banco de dados' });
  }
});

// PUT editar vinculada ao usuário
app.put('/api/transactions/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { type, desc, cat, val, date } = req.body;

  if (!type || !desc || !cat || val === undefined || !date) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE transactions SET type = ?, `desc` = ?, cat = ?, val = ?, date = ? WHERE id = ? AND user_id = ?',
      [type, desc, cat, val, date, id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transação não encontrada ou acesso negado' });
    }

    res.json({
      id: parseInt(id),
      type,
      desc,
      cat,
      val: parseFloat(val),
      date
    });
  } catch (error) {
    console.error('Erro ao editar transação:', error);
    res.status(500).json({ error: 'Erro ao atualizar transação no banco de dados' });
  }
});

// DELETE excluir vinculada ao usuário
app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transação não encontrada ou acesso negado' });
    }

    res.json({ success: true, message: 'Transação excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({ error: 'Erro ao deletar transação no banco de dados' });
  }
});

/* ==========================================
   ROTAS DE METAS (FILTRADAS POR USUÁRIO)
   ========================================== */

// GET todas do usuário
app.get('/api/goals', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, CAST(target AS DOUBLE) AS target, CAST(current AS DOUBLE) AS current, DATE_FORMAT(deadline, "%Y-%m-%d") AS deadline FROM goals WHERE user_id = ? ORDER BY deadline ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas no banco de dados' });
  }
});

// POST criar vinculada ao usuário (limite de 5 metas)
app.post('/api/goals', requireAuth, async (req, res) => {
  const { name, target, current, deadline } = req.body;
  if (!name || target === undefined || !deadline) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  try {
    // Verificar se já tem 5 metas
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM goals WHERE user_id = ?', [req.user.id]);
    if (countRows[0].count >= 5) {
      return res.status(400).json({ error: 'Máximo de 5 metas simultâneas atingido!' });
    }

    const [result] = await pool.query(
      'INSERT INTO goals (user_id, name, target, current, deadline) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, target, current || 0, deadline]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      target: parseFloat(target),
      current: parseFloat(current || 0),
      deadline
    });
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao salvar meta no banco de dados' });
  }
});

// DELETE excluir vinculada ao usuário
app.delete('/api/goals/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM goals WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Meta não encontrada ou acesso negado' });
    }

    res.json({ success: true, message: 'Meta excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    res.status(500).json({ error: 'Erro ao deletar meta no banco de dados' });
  }
});

// Rota coringa para fallback do frontend (SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inicialização do banco e depois escuta do servidor
initializeDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Servidor rodando em http://localhost:${PORT}`);
  });
});
