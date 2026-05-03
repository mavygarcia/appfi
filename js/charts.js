
/**
 * Atualiza os 4 cards de métricas e a lista de categorias
 */
function renderMetrics() {
  const all    = getTxsForPeriod();
  const income = all.filter(t => t.type === 'income').reduce((s, t) => s + t.val, 0);
  const expense= all.filter(t => t.type === 'expense').reduce((s, t) => s + t.val, 0);
  const saved  = income - expense;
  const rate   = income > 0 ? Math.round((saved / income) * 100) : 0;

  document.getElementById('m-inc').textContent  = fmtShort(income);
  document.getElementById('m-exp').textContent  = fmtShort(expense);
  document.getElementById('m-sav').textContent  = fmtShort(Math.max(0, saved));
  document.getElementById('m-rate').textContent = rate + '%';

  renderCats(all.filter(t => t.type === 'expense'));
}

/* 
   LISTA DE CATEGORIAS COM BARRA DE PROGRESSO
 */

/**
 * Renderiza as categorias de despesas ordenadas do maior para menor
 * @param {Array} expenses  array de transações do tipo 'expense'
 */
function renderCats(expenses) {
  const totalExp = expenses.reduce((s, t) => s + t.val, 0);

  // Agrupa por categoria
  const bycat = {};
  expenses.forEach(t => {
    bycat[t.cat] = (bycat[t.cat] || 0) + t.val;
  });

  const sorted = Object.entries(bycat).sort((a, b) => b[1] - a[1]);

  document.getElementById('cat-list').innerHTML = sorted.length
    ? sorted.map(([cat, val]) => {
        const pct   = totalExp > 0 ? Math.round((val / totalExp) * 100) : 0;
        const color = CATS_COLORS[cat] || '#b2bec3';
        const emoji = cat.split(' ')[0];
        const label = cat.split(' ').slice(1).join(' ');

        return `
          <div class="cat-item">
            <div class="cat-top">
              <div class="cat-name">
                <span style="font-size:16px">${emoji}</span>${label}
              </div>
              <div class="cat-val">${fmt(val)}</div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${pct}%; background:${color}"></div>
            </div>
            <div class="cat-pct">${pct}% do total de despesas</div>
          </div>
        `;
      }).join('')
    : '<div class="empty-state"><div class="empty-state-icon">📊</div>Sem despesas no período</div>';
}

/* --------------------------------------------------
   GRÁFICO DE BARRAS — Receitas vs Despesas
-------------------------------------------------- */

/**
 * Histórico base dos últimos 8 meses (dados de demonstração)
 * O último mês é sempre sobrescrito com dados reais
 */
const HISTORY_INC = [4200, 4800, 5100, 4600, 5200, 5500, 5300, 5500];
const HISTORY_EXP = [2800, 3100, 3600, 2900, 3200, 3400, 3100, 2100];
const HISTORY_LABELS = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

/**
 * Desenha o gráfico de barras no canvas #barChart
 */
function drawCharts() {
  const canvas = document.getElementById('barChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Atualiza último mês com dados reais
  const realData = getTxsForPeriod();
  const realInc  = realData.filter(t => t.type === 'income').reduce((s, t) => s + t.val, 0);
  const realExp  = realData.filter(t => t.type === 'expense').reduce((s, t) => s + t.val, 0);
  HISTORY_INC[7] = realInc || 5500;
  HISTORY_EXP[7] = realExp || 2100;

  // Dimensões responsivas
  const W   = canvas.offsetWidth || 340;
  const H   = 150;
  const PAD = 32;          // espaço à esquerda para labels Y
  const BAR = 14;          // largura de cada barra
  const COL = (W - PAD) / HISTORY_LABELS.length; // largura de cada coluna

  canvas.width  = W;
  canvas.height = H;

  const maxVal = Math.max(...HISTORY_INC, ...HISTORY_EXP) * 1.15;

  ctx.clearRect(0, 0, W, H);

  // --- Linhas de grade ---
  [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
    const y = H - 20 - (H - 20 - 10) * ratio;
    ctx.strokeStyle = '#eee';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y);
    ctx.lineTo(W - 4, y);
    ctx.stroke();

    ctx.fillStyle = '#b2bec3';
    ctx.font      = '9px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('R$' + Math.round(maxVal * ratio / 1000) + 'k', PAD - 4, y + 3);
  });

  // --- Barras ---
  HISTORY_LABELS.forEach((label, i) => {
    const cx = PAD + i * COL + COL / 2;  // centro da coluna
    const isLast = i === HISTORY_LABELS.length - 1;

    // Altura das barras
    const hI = ((HISTORY_INC[i] / maxVal) * (H - 30));
    const hE = ((HISTORY_EXP[i] / maxVal) * (H - 30));

    // Barra de RECEITA (roxa)
    ctx.globalAlpha = isLast ? 1 : 0.55;
    ctx.fillStyle   = '#6C5CE7';
    roundRect(ctx, cx - BAR - 2, H - 20 - hI, BAR, hI, 3);
    ctx.fill();

    // Barra de DESPESA (rosa)
    ctx.fillStyle = '#fd79a8';
    roundRect(ctx, cx + 2, H - 20 - hE, BAR, hE, 3);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Label do mês
    ctx.fillStyle = '#b2bec3';
    ctx.font      = '9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, H - 4);
  });

  // --- Legenda ---
  drawLegend(ctx, W);
}

/**
 * Desenha legenda no canto superior direito do canvas
 */
function drawLegend(ctx, W) {
  const items = [
    { color: '#6C5CE7', label: 'Receita' },
    { color: '#fd79a8', label: 'Despesa' },
  ];

  let x = W - 4;
  items.reverse().forEach(({ color, label }) => {
    ctx.font      = '9px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#636e72';
    ctx.fillText(label, x, 12);
    x -= ctx.measureText(label).width + 4;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 8, 4, 0, Math.PI * 2);
    ctx.fill();
    x -= 16;
  });
}

/**
 * Desenha um retângulo com bordas arredondadas no topo
 */
function roundRect(ctx, x, y, w, h, r) {
  if (h < r) r = h;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Redesenha ao redimensionar janela
window.addEventListener('resize', () => {
  if (document.getElementById('pg-charts').classList.contains('active')) {
    drawCharts();
  }
});
