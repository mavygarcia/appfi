

/**
 * Cores por categoria para ícones e gráficos
 */
const CATS_COLORS = {
  '💰 Salário':    '#00b894',
  '🏠 Moradia':    '#6C5CE7',
  '🍔 Alimentação':'#fd79a8',
  '🚌 Transporte': '#fdcb6e',
  '❤️ Saúde':      '#e17055',
  '🎮 Lazer':      '#74b9ff',
  '📚 Educação':   '#a29bfe',
  '💻 Tecnologia': '#55efc4',
  '📦 Outros':     '#b2bec3',
};

/**
 * Transações iniciais (demo)
 */
let txs = [];
let goals = [];

/**
 * Estado global do período selecionado
 */
let currentPeriod = { y: 2026, m: 5 };

/**
 * Carrega dados do backend de forma assíncrona
 */
async function loadData() {
  if (!token) return;

  try {
    const resTxs = await fetch('/api/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resTxs.status === 401) {
      handleLogout();
      return;
    }

    if (resTxs.ok) {
      txs = await resTxs.json();
    } else {
      console.error('Erro ao buscar transações da API');
    }

    const resGoals = await fetch('/api/goals', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (resGoals.status === 401) {
      handleLogout();
      return;
    }

    if (resGoals.ok) {
      goals = await resGoals.json();
    } else {
      console.error('Erro ao buscar metas da API');
    }
  } catch (err) {
    console.error('Erro de conexão ao carregar dados:', err);
  }
  
  // Atualiza todas as exibições no frontend
  renderAll();
}

