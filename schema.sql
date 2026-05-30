-- Criar Banco de Dados
CREATE DATABASE IF NOT EXISTS appfi;
USE appfi;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  email VARCHAR(191) UNIQUE NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  photo MEDIUMTEXT DEFAULT NULL, -- Armazena foto em Base64
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'income' ou 'expense'
  \`desc\` VARCHAR(255) NOT NULL,
  cat VARCHAR(100) NOT NULL,
  val DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de Metas
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

-- Inserir usuário demo (senha: '12345678', bcrypt hash para teste rápido)
-- Hash de '12345678': $2a$10$T2a16q.4w/8Jt7jKx5c.AOFZf087v9rVnQjZ7XzW2h6dGvK/v11zK
-- Mas o backend pode cuidar de criar o usuário demo automaticamente.
INSERT INTO users (id, name, lastname, email, phone, password)
SELECT 1, 'João', 'da Silva', 'joao@email.com', '(11) 99999-9999', '$2a$10$T2a16q.4w/8Jt7jKx5c.AOFZf087v9rVnQjZ7XzW2h6dGvK/v11zK' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

-- Inserir dados de teste vinculados ao usuário 1
INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 1, 1, 'income', 'Salário', '💰 Salário', 5500.00, '2026-05-01' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 1);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 2, 1, 'expense', 'Aluguel', '🏠 Moradia', 1200.00, '2026-05-01' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 2);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 3, 1, 'expense', 'Supermercado', '🍔 Alimentação', 420.00, '2026-05-02' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 3);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 4, 1, 'expense', 'Uber', '🚌 Transporte', 85.00, '2026-05-03' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 4);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 5, 1, 'income', 'Freelance', '📦 Outros', 800.00, '2026-05-04' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 5);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 6, 1, 'expense', 'Academia', '❤️ Saúde', 90.00, '2026-05-05' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 6);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 7, 1, 'expense', 'Netflix', '💻 Tecnologia', 55.00, '2026-05-05' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 7);

INSERT INTO transactions (id, user_id, type, \`desc\`, cat, val, date) 
SELECT 8, 1, 'expense', 'Restaurante', '🎮 Lazer', 150.00, '2026-05-06' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE id = 8);

INSERT INTO goals (id, user_id, name, target, current, deadline)
SELECT 1, 1, 'Reserva de Emergência', 10000.00, 3500.00, '2026-12-31' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM goals WHERE id = 1);

INSERT INTO goals (id, user_id, name, target, current, deadline)
SELECT 2, 1, 'Viagem Europa', 15000.00, 4200.00, '2027-06-30' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM goals WHERE id = 2);
