# 📋 Product Backlog — App de Controle Financeiro Pessoal

---

## 🎯 Visão do Produto
Aplicativo mobile-first de finanças pessoais que permite ao usuário registrar receitas e despesas, visualizar relatórios gráficos e tomar decisões financeiras mais conscientes.

---



## 📊 Priorização (MoSCoW)

| Épico | Prioridade |
|---|---|
| EP01 — Autenticação e Perfil |  Alta|
| EP02 — Registro de Transações |  Alta|
| EP03 — Dashboard |  Media |
| EP04 — Relatórios e Visualizações |  Baixa |
| EP05 — Metas Financeiras |  Baixa|
| EP06 — Notificações |  Baixa |

---

## 🏃 Planejamento de Sprints (MVP — 8 semanas)

| Sprint | Duração | Foco | User Stories |
|---|---|---|---|
| **Sprint 1** | 2 semanas | Fundação — Autenticação e estrutura | EP01-US01, EP01-US02, EP01-US03, EP01-US04 |
| **Sprint 2** | 2 semanas | Core — Registro e histórico de transações | EP02-US01, EP02-US02, EP02-US03, EP02-US04, EP02-US05 |
| **Sprint 3** | 2 semanas | Visibilidade — Dashboard e painel principal | EP03-US01, EP03-US02, EP03-US03, EP03-US04, EP03-US05 |
| **Sprint 4** | 2 semanas | Inteligência — Relatórios, metas e notificações | EP04-US01 a EP04-US06, EP05-US01 a EP05-US03, EP06-US01 a EP06-US02 |

---

## 🗂️ ÉPICOS E USER STORIES

---

## 🟣 SPRINT 1 — Fundação
> **Objetivo:** Usuário consegue criar conta, fazer login, recuperar senha e editar seu perfil. Base técnica do projeto configurada.
> **Duração:** 2 semanas | **Épico:** EP01 — Autenticação e Perfil

---

**EP01-US01** | Cadastro de usuário:
**Como** novo usuário,
**Quero** criar uma conta com nome, e-mail e senha,
**Para que** eu possa acessar o app com segurança.
**Critérios de aceitação:**
- Formulário valida e-mail e senha (mínimo 8 chars)
- Confirmação de e-mail enviada
- Erro amigável em caso de e-mail já cadastrado

---

**EP01-US02** | Login:
**Como** usuário cadastrado,
**Quero** fazer login com e-mail e senha,
**Para que** eu acesse minhas informações financeiras.
**Critérios de aceitação:**
- Token JWT armazenado com segurança
- Opção de "Lembrar-me"
- Mensagem de erro para credenciais inválidas

---

**EP01-US03** | Edição de perfil:
**Como** usuário autenticado,
**Quero** editar meu nome, foto e e-mail,
**Para que** meu perfil reflita minhas informações reais.
**Critérios de aceitação:**
- Campos editáveis: nome, sobrenome, e-mail, telefone
- Upload de foto de perfil
- Confirmação visual de alterações salvas

---

**EP01-US04** | Recuperação de senha:
**Como** usuário,
**Quero** recuperar minha senha por e-mail,
**Para que** eu não perca acesso à conta.
**Critérios de aceitação:**
- Link de redefinição enviado para o e-mail cadastrado
- Link expira em 1 hora
- Nova senha validada com confirmação

---

## 🟠 SPRINT 2 — Core
> **Objetivo:** Usuário consegue registrar, editar, excluir e listar todas as suas receitas e despesas com categorias e filtros.
> **Duração:** 2 semanas | **Épico:** EP02 — Registro de Transações

---

**EP02-US01** | Adicionar receita:
**Como** usuário,
**Quero** registrar uma receita informando valor, descrição, categoria e data,
**Para que** eu controle de onde vem meu dinheiro.
**Critérios de aceitação:**
- Campos obrigatórios: valor, descrição, categoria, data
- Valor aceita apenas números positivos
- Data padrão = hoje
- Confirmação visual após salvar (toast/snackbar)

---

**EP02-US02** | Adicionar despesa:
**Como** usuário,
**Quero** registrar uma despesa com valor, descrição, categoria e data,
**Para que** eu saiba para onde vai meu dinheiro.
**Critérios de aceitação:**
- Mesmos campos da receita
- Categorias pré-definidas: Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, Tecnologia, Outros
- Emoji visual por categoria

---

**EP02-US03** | Editar transação:
**Como** usuário,
**Quero** editar uma transação já registrada,
**Para que** eu corrija erros de digitação ou valores errados.
**Critérios de aceitação:**
- Todos os campos são editáveis após salvar
- Saldo atualizado imediatamente após edição
- Histórico indica data da última edição

---

**EP02-US04** | Excluir transação:
**Como** usuário,
**Quero** excluir uma transação incorreta,
**Para que** meu saldo seja atualizado corretamente.
**Critérios de aceitação:**
- Confirmação antes de excluir ("Tem certeza?")
- Saldo e relatórios atualizam imediatamente
- Ação irreversível com aviso claro

---

**EP02-US05** | Histórico de transações:
**Como** usuário,
**Quero** ver a lista de todas as minhas transações,
**Para que** eu revise meu histórico financeiro.
**Critérios de aceitação:**
- Filtragem por tipo (Receita / Despesa / Todas)
- Filtragem por período (mês, intervalo personalizado)
- Ordenação por data (mais recente primeiro)
- Busca por descrição

---

## 🟡 SPRINT 3 — Visibilidade
> **Objetivo:** Usuário tem uma tela inicial completa com saldo em tempo real, resumo mensal, ações rápidas e navegação por períodos.
> **Duração:** 2 semanas | **Épico:** EP03 — Painel Principal (Dashboard)

---

**EP03-US01** | Saldo total:
**Como** usuário,
**Quero** ver meu saldo total na tela inicial,
**Para que** eu tenha visão imediata da minha situação financeira.
**Critérios de aceitação:**
- Saldo = soma de receitas − soma de despesas
- Exibe receita e despesa do mês separadamente
- Atualiza em tempo real após novos lançamentos

---

**EP03-US02** | Resumo mensal:
**Como** usuário,
**Quero** ver o resumo do mês atual (receitas, despesas, saldo),
**Para que** eu acompanhe meu desempenho financeiro mensal.
**Critérios de aceitação:**
- Cards individuais para receita, despesa e saldo
- Indicador percentual de variação em relação ao mês anterior
- Atualização automática ao virar o mês

---

**EP03-US03** | Ações rápidas:
**Como** usuário,
**Quero** acessar botões de ação rápida,
**Para que** eu registre transações com menos cliques.
**Critérios de aceitação:**
- Mínimo 4 atalhos visíveis na tela inicial
- Cada ação abre a tela correspondente diretamente
- Ícones com labels claros e reconhecíveis

---

**EP03-US04** | Últimas transações:
**Como** usuário,
**Quero** ver as 5 últimas transações na tela inicial,
**Para que** eu tenha contexto recente sem navegar para outra aba.
**Critérios de aceitação:**
- Exibe emoji, descrição, data e valor
- Valor colorido: verde para receita, vermelho para despesa
- Link "Ver todas" navega para o extrato completo

---

**EP03-US05** | Seleção de período:
**Como** usuário,
**Quero** alternar entre meses diferentes no dashboard,
**Para que** eu compare períodos distintos.
**Critérios de aceitação:**
- Seletor de mês/ano acessível no topo da tela
- Todos os dados (saldo, resumo, transações) atualizam ao trocar o período
- Navegação por setas para mês anterior e próximo

---

## 🟢 SPRINT 4 — Inteligência
> **Objetivo:** Usuário visualiza relatórios gráficos completos, define metas financeiras e recebe alertas automáticos. Produto pronto para lançamento do MVP.
> **Duração:** 2 semanas | **Épicos:** EP04 — Relatórios · EP05 — Metas · EP06 — Notificações

---

### EP04 — Relatórios e Visualizações

**EP04-US01** | Gráfico de barras mensal:
**Como** usuário,
**Quero** ver um gráfico de barras comparando receitas e despesas dos últimos 6 meses,
**Para que** eu identifique tendências.
**Critérios de aceitação:**
- Barras coloridas distintas para receita (verde) e despesa (roxo)
- Eixo Y em reais (R$)
- Legenda visível e tooltip ao passar o cursor

---

**EP04-US02** | Gráfico de linha (evolução):
**Como** usuário,
**Quero** ver um gráfico de linha mostrando evolução de receitas e despesas ao longo do tempo,
**Para que** eu analise meu progresso financeiro.
**Critérios de aceitação:**
- Linha separada para receita e despesa
- Área preenchida abaixo da linha para melhor leitura
- Período ajustável: 3, 6 ou 12 meses

---

**EP04-US03** | Gráfico de rosca (categorias);
**Como** usuário,
**Quero** ver um gráfico de rosca com a distribuição percentual dos meus gastos por categoria,
**Para que** eu entenda onde gasto mais.
**Critérios de aceitação:**
- Cada categoria com cor distinta
- Percentual exibido no gráfico e em lista abaixo
- Clique na fatia filtra as transações daquela categoria

---

**EP04-US04** | Despesas por categoria (lista):
**Como** usuário,
**Quero** ver uma lista de categorias com valor gasto e percentual do total,
**Para que** eu compare categorias de gasto.
**Critérios de aceitação:**
- Barra de progresso visual por categoria
- Ordenado do maior para menor gasto
- Exibe ícone/emoji da categoria

---

**EP04-US05** | Métricas de resumo:
**Como** usuário,
**Quero** ver cards com: Receita Total, Gasto Total, Valor Economizado e Taxa de Poupança,
**Para que** eu avalie minha saúde financeira rapidamente.
**Critérios de aceitação:**
- 4 cards destacados no topo da tela de relatórios
- Indicador de variação percentual vs período anterior
- Taxa de poupança calculada automaticamente: (receita − despesa) / receita × 100

---

**EP04-US06** | Exportar relatório:
**Como** usuário,
**Quero** exportar meu relatório mensal em PDF ou CSV,
**Para que** eu arquive ou compartilhe minhas informações.
**Critérios de aceitação:**
- Opção de exportar em PDF (formatado) ou CSV (tabela)
- Inclui período selecionado, totais e lista de transações
- Download direto no dispositivo

---

### EP05 — Metas Financeiras

**EP05-US01** | Criar meta:
**Como** usuário,
**Quero** criar uma meta de economia com valor-alvo e prazo,
**Para que** eu tenha um objetivo financeiro claro.
**Critérios de aceitação:**
- Campos: nome da meta, valor-alvo, prazo (data), descrição opcional
- Meta aparece no dashboard com progresso
- Máximo de 5 metas simultâneas no plano gratuito

---

**EP05-US02** | Acompanhar meta:
**Como** usuário,
**Quero** ver o progresso das minhas metas com barra de progresso,
**Para que** eu saiba o quanto falta para atingir meu objetivo.
**Critérios de aceitação:**
- Barra de progresso visual (% concluída)
- Exibe valor atual, valor-alvo e dias restantes
- Cor da barra muda conforme proximidade do prazo (verde → amarelo → vermelho)

---

**EP05-US03** | Notificação de meta atingida:
**Como** usuário,
**Quero** receber notificação quando atingir uma meta,
**Para que** eu seja motivado a continuar.
**Critérios de aceitação:**
- Push notification enviado ao atingir 100% da meta
- Tela de celebração exibida no app
- Meta marcada como "concluída" no histórico

---

### EP06 — Notificações

**EP06-US01** | Alerta de gastos excessivos:
**Como** usuário,
**Quero** receber alerta quando meus gastos em uma categoria ultrapassarem 80% do orçamento,
**Para que** eu evite estourar o limite.
**Critérios de aceitação:**
- Alerta em tempo real ao registrar transação que ultrapasse 80%
- Push notification + badge na tela de relatórios
- Usuário pode definir orçamento por categoria nas configurações

---

**EP06-US02** | Lembrete de registro:
**Como** usuário,
**Quero** receber lembrete diário para registrar transações,
**Para que** eu mantenha meu controle financeiro atualizado.
**Critérios de aceitação:**
- Horário do lembrete configurável pelo usuário
- Notificação com ação rápida "Adicionar agora"
- Pode ser desativado nas configurações de perfil

---

## ✅ Resumo das Entregas por Sprint

| Sprint | Semanas | Épicos | User Stories | Entregáveis principais |
|---|---|---|---|---|
|  **Sprint 1 — Fundação** | 1–2 | EP01 | US01 a US04 | Cadastro, login, recuperação de senha, edição de perfil |
|  **Sprint 2 — Core** | 3–4 | EP02 | US01 a US05 | CRUD completo de transações, categorias, histórico com filtros e busca |
|  **Sprint 3 — Visibilidade** | 5–6 | EP03 | US01 a US05 | Dashboard, saldo em tempo real, resumo mensal, ações rápidas, seleção de período |
|  **Sprint 4 — Inteligência** | 7–8 | EP04, EP05, EP06 | US01 a US06 + US01 a US03 + US01 a US02 | Gráficos, relatórios, exportação, metas financeiras, alertas e lembretes |


## Como rodar no VS Code

### Opção 1 — Live Server (recomendado)
1. Instale a extensão **Live Server** no VS Code
2. Clique com botão direito em `index.html`
3. Selecione **"Open with Live Server"**

### Opção 2 — Abrir direto no navegador
1. Navegue até a pasta `financeiro-app`
2. Dê duplo clique em `index.html`

---

##  Funcionalidades

### 1. 📊 Dashboard com saldo em tempo real
- Saldo = Receitas − Despesas, calculado dinamicamente
- Cards de receita e despesa do mês
- 5 últimas transações na tela inicial
- Ações rápidas de navegação

### 2. 💳 Registro e histórico de transações
- **Criar** receitas e despesas pelo modal
- **Editar** qualquer transação (toque para abrir)
- **Filtrar** por tipo: Todas / Receitas / Despesas
- **Buscar** por descrição em tempo real
- **Navegar** por meses com setas ‹ ›

### 3. 📈 Análise mensal com gráficos
- 4 cards de métricas (receita, gasto, economizado, taxa de poupança)
- Gráfico de barras: Receitas vs Despesas dos últimos 8 meses
- Lista de categorias com barra de progresso proporcional

### 4. 🎯 Metas financeiras
- **Criar** metas com nome, valor-alvo, valor atual e prazo
- **Acompanhar** progresso com barra colorida
- **Badges** de status: Em andamento / Metade lá / Quase lá! / Concluída
- **Remover** metas com confirmação
- Limite de 5 metas simultâneas

---

## 🎨 Design

Inspirado nas telas do protótipo mobile com:
- Gradiente roxo no hero e cabeçalhos
- Tipografia Syne (display) + DM Sans (corpo)
- Cores semânticas: 🟢 verde = receita, 🔴 vermelho = despesa
- Cards com sombra suave e bordas arredondadas
- Animação slide-up nos modais

---


