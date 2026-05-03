

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
let txs = [
  { id: 1, type: 'income',  desc: 'Salário',      cat: '💰 Salário',     val: 5500, date: '2026-05-01' },
  { id: 2, type: 'expense', desc: 'Aluguel',       cat: '🏠 Moradia',     val: 1200, date: '2026-05-01' },
  { id: 3, type: 'expense', desc: 'Supermercado',  cat: '🍔 Alimentação', val:  420, date: '2026-05-02' },
  { id: 4, type: 'expense', desc: 'Uber',           cat: '🚌 Transporte',  val:   85, date: '2026-05-03' },
  { id: 5, type: 'income',  desc: 'Freelance',     cat: '📦 Outros',      val:  800, date: '2026-05-04' },
  { id: 6, type: 'expense', desc: 'Academia',      cat: '❤️ Saúde',       val:   90, date: '2026-05-05' },
  { id: 7, type: 'expense', desc: 'Netflix',       cat: '💻 Tecnologia',  val:   55, date: '2026-05-05' },
  { id: 8, type: 'expense', desc: 'Restaurante',   cat: '🎮 Lazer',       val:  150, date: '2026-05-06' },
];

/**
 * Metas financeiras iniciais (demo)
 */
let goals = [
  { id: 1, name: 'Reserva de Emergência', target: 10000, current: 3500,  deadline: '2026-12-31' },
  { id: 2, name: 'Viagem Europa',          target: 15000, current: 4200,  deadline: '2027-06-30' },
];

/**
 * Estado global do período selecionado
 */
let currentPeriod = { y: 2026, m: 5 };
