# Guia de Acesso ao Banco de Dados no MySQL Workbench

Este guia descreve como configurar a conexão e consultar os dados do aplicativo **AppFi** utilizando a ferramenta **MySQL Workbench**.

---

## 🔌 1. Configurando a Conexão

Ao abrir o **MySQL Workbench**, siga os passos abaixo para cadastrar o banco de dados local:

1. Na tela inicial, clique no botão **"+"** (ao lado de *MySQL Connections*) para criar uma nova conexão.
2. Preencha os campos com as seguintes informações baseadas nas configurações do seu projeto:
   - **Connection Name:** `AppFi Local` (ou qualquer nome de sua preferência)
   - **Connection Method:** `Standard (TCP/IP)`
   - **Hostname:** `localhost`
   - **Port:** `3306`
   - **Username:** `root`
3. No campo **Password**, clique em **"Store in Vault..."** (ou *Store in Keychain* no Mac) e digite a senha do seu banco de dados:
   - Senha: `Vitoria.1405`
4. No campo **Default Schema**, digite o nome do banco:
   - Schema: `appfi`
5. Clique em **"Test Connection"** no canto inferior direito para confirmar que os dados estão corretos. Se aparecer a mensagem de sucesso, clique em **OK** para salvar.

---

## 🔍 2. Consultando as Tabelas e Dados

Uma vez conectado, dê um duplo clique no card da conexão **"AppFi Local"** para abrir a interface gráfica de consultas.

### Visualizando a Estrutura (Schemas)
No painel esquerdo, selecione a aba **"Schemas"**. Você verá o banco `appfi` listado. Ao expandir o item **Tables**, você verá as 3 tabelas criadas automaticamente pelo servidor:
- 👥 `users` (Dados cadastrais dos usuários e fotos de perfil)
- 💰 `transactions` (Receitas e despesas associadas aos usuários)
- 🎯 `goals` (Metas financeiras individuais)

---

## 💻 3. Consultas SQL Úteis para Testar

Você pode abrir uma nova aba de consulta (ícone de folha com um raio no topo esquerdo) e executar as seguintes queries para verificar o funcionamento do app:

### Verificar os usuários cadastrados:
```sql
SELECT id, name, lastname, email, phone FROM users;
```

### Visualizar as transações e o isolamento por usuário:
Você verá que cada transação possui a coluna `user_id` correspondente ao id do usuário que a inseriu.
```sql
SELECT t.id, u.name AS usuario, t.type, t.desc, t.cat, t.val, t.date 
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.date DESC;
```

### Visualizar as metas criadas e seu progresso:
```sql
SELECT g.id, u.name AS usuario, g.name AS meta, g.target, g.current, g.deadline 
FROM goals g
JOIN users u ON g.user_id = u.id;
```
