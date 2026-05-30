# Guia de Teste de APIs com Postman ou Insomnia

Para testar as requisições (GET, POST, PUT, DELETE) do projeto, nós criamos uma coleção pré-configurada no arquivo **`appfi_api_collection.json`** localizado na pasta raiz do seu projeto.

Abaixo está o passo a passo para importar e testar no **Postman** ou **Insomnia**.

---

## 📥 1. Como Importar a Coleção

### No Postman:
1. Abra o **Postman**.
2. Clique no botão **"Import"** (no canto superior esquerdo).
3. Selecione o arquivo **`appfi_api_collection.json`** na pasta do seu projeto (`C:\Users\marya\OneDrive\Desktop\appfi`).
4. Clique em **Import**. A coleção **"AppFi API - Personal Finance"** aparecerá na sua barra lateral esquerda.

### No Insomnia:
1. Abra o **Insomnia**.
2. Clique em **"Create"** ou na opção de importar no canto superior direito e selecione **"Import From File"**.
3. Escolha o arquivo **`appfi_api_collection.json`** na pasta do seu projeto.
4. Importe como um novo "Design Document" ou "Request Collection".

---

## 🔐 2. Fluxo de Teste com Autenticação (JWT)

Como as rotas de Transações, Metas e Perfil são protegidas por segurança, você precisa primeiro fazer o login para obter um token de acesso:

### Passo 1: Cadastro e Login
1. Abra a pasta **"Autenticação"** na coleção importada.
2. Selecione a requisição **"Login de Usuário"** e clique em **Send** (Enviar).
   - *Nota: Já está configurada por padrão para enviar o login da usuária de teste `maria@email.com` que criamos.*
3. No painel de resposta (Response), copie o texto do **`token`** gerado (uma longa linha de caracteres que começa com `eyJhbGci...`).

### Passo 2: Configurar a Variável de Token
1. Clique no nome da coleção principal **"AppFi API - Personal Finance"** (na barra lateral do Postman).
2. Vá na aba **Variables** (Variáveis).
3. Na linha da variável **`token`**, cole o código que você copiou no campo **Current Value** (Valor Atual).
4. Clique em **Save** (Salvar) no topo direito.
   - *Pronto! Todas as outras requisições da coleção já estão configuradas para usar essa variável automaticamente no cabeçalho Authorization.*

---

## 🚀 3. Testando as Requisições

Agora você pode testar as funcionalidades principais:

### 👤 Perfil
* **Obter Dados do Perfil (GET):** Mostra os dados do usuário autenticado.
* **Atualizar Perfil (PUT):** Atualiza nome, sobrenome, telefone ou foto do usuário.

### 💰 Transações (CRUD)
* **Criar Transação (POST):** Envia uma nova despesa ou receita. O corpo do JSON (Body) já vem com um modelo pronto.
* **Listar Transações (GET):** Retorna apenas as transações do usuário logado.
* **Editar Transação (PUT):** Atualiza os valores de uma transação específica informando o ID na URL (ex: `/api/transactions/1`).
* **Deletar Transação (DELETE):** Exclui a transação com o ID informado na URL.

### 🎯 Metas
* **Criar Meta (POST):** Cadastra uma meta financeira (limite de até 5 metas).
* **Listar Metas (GET):** Exibe as metas do usuário.
* **Deletar Meta (DELETE):** Exclui a meta selecionada pelo ID.
