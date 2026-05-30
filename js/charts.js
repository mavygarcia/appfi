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
   DADOS HISTÓRICOS COMPARTILHADOS
-------------------------------------------------- */
const HISTORY_INC = [4200, 4800, 5100, 4600, 5200, 5500, 5300, 5500];
const HISTORY_EXP = [2800, 3100, 3600, 2900, 3200, 3400, 3100, 2100];
const HISTORY_LABELS = ['Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai'];

/**
 * Função principal para desenhar todos os gráficos
 */
function drawCharts() {
  // Atualiza último mês com dados reais da conta logada
  const realData = getTxsForPeriod();
  const realInc  = realData.filter(t => t.type === 'income').reduce((s, t) => s + t.val, 0);
  const realExp  = realData.filter(t => t.type === 'expense').reduce((s, t) => s + t.val, 0);
  HISTORY_INC[7] = realInc || 0;
  HISTORY_EXP[7] = realExp || 0;

  drawBarChart();
  drawLineChart();
  drawDoughnutChart(realData.filter(t => t.type === 'expense'));
}

/* --------------------------------------------------
   1. GRÁFICO DE BARRAS — Receitas vs Despesas
-------------------------------------------------- */
function drawBarChart() {
  const canvas = document.getElementById('barChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth || 340;
  const H   = 150;
  const PAD = 35;
  const BAR = 12;
  const COL = (W - PAD) / HISTORY_LABELS.length;

  canvas.width  = W;
  canvas.height = H;

  const maxVal = Math.max(...HISTORY_INC, ...HISTORY_EXP, 1000) * 1.15;

  ctx.clearRect(0, 0, W, H);

  // Linhas de grade
  [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
    const y = H - 20 - (H - 30) * ratio;
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

  // Barras
  HISTORY_LABELS.forEach((label, i) => {
    const cx = PAD + i * COL + COL / 2;
    const isLast = i === HISTORY_LABELS.length - 1;

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

  drawLegend(ctx, W, ['#6C5CE7', '#fd79a8'], ['Receita', 'Despesa']);
}

/* --------------------------------------------------
   2. GRÁFICO DE LINHA — Evolução do Saldo/Movimento
-------------------------------------------------- */
function drawLineChart() {
  const canvas = document.getElementById('lineChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth || 340;
  const H   = 150;
  const PAD = 35;
  const COL = (W - PAD) / HISTORY_LABELS.length;

  canvas.width  = W;
  canvas.height = H;

  const maxVal = Math.max(...HISTORY_INC, ...HISTORY_EXP, 1000) * 1.15;

  ctx.clearRect(0, 0, W, H);

  // Linhas de grade
  [0, 0.25, 0.5, 0.75, 1].forEach(ratio => {
    const y = H - 20 - (H - 30) * ratio;
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

  // Função para desenhar a linha e a área preenchida
  function drawLine(data, color, fillStyle) {
    const points = HISTORY_LABELS.map((_, i) => {
      const cx = PAD + i * COL + COL / 2;
      const cy = H - 20 - ((data[i] / maxVal) * (H - 30));
      return { x: cx, y: cy };
    });

    // 1. Desenhar a área preenchida abaixo da linha
    ctx.beginPath();
    ctx.moveTo(points[0].x, H - 20);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, H - 20);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;

    // 2. Desenhar a linha principal
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    // 3. Desenhar pontos circulares
    points.forEach((p, idx) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Círculo interno branco no último ponto
      if (idx === points.length - 1) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Desenha as linhas de Receita e Despesa
  drawLine(HISTORY_INC, '#6C5CE7', '#6C5CE7');
  drawLine(HISTORY_EXP, '#fd79a8', '#fd79a8');

  // Labels dos meses no rodapé
  HISTORY_LABELS.forEach((label, i) => {
    const cx = PAD + i * COL + COL / 2;
    ctx.fillStyle = '#b2bec3';
    ctx.font      = '9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, H - 4);
  });

  drawLegend(ctx, W, ['#6C5CE7', '#fd79a8'], ['Receita', 'Despesa']);
}

/* --------------------------------------------------
   3. GRÁFICO DE ROSCA — Distribuição por Categorias
-------------------------------------------------- */
function drawDoughnutChart(expenses) {
  const canvas = document.getElementById('doughnutChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W   = canvas.offsetWidth || 340;
  const H   = 160;
  const CX  = W / 2.6; // Centralizar ligeiramente para caber legenda
  const CY  = H / 2;
  const R   = Math.min(CX, CY) - 15;

  canvas.width  = W;
  canvas.height = H;

  ctx.clearRect(0, 0, W, H);

  const totalExp = expenses.reduce((s, t) => s + t.val, 0);

  if (totalExp === 0) {
    // Desenha círculo vazio (cinza)
    ctx.strokeStyle = '#eee';
    ctx.lineWidth   = 20;
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#636e72';
    ctx.font      = '11px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sem gastos no mês', CX, CY + 4);
    return;
  }

  // Agrupar por categorias
  const bycat = {};
  expenses.forEach(t => {
    bycat[t.cat] = (bycat[t.cat] || 0) + t.val;
  });

  const sorted = Object.entries(bycat).sort((a, b) => b[1] - a[1]);

  let startAngle = -Math.PI / 2;
  ctx.lineWidth = 18; // Espessura da rosca

  sorted.forEach(([cat, val]) => {
    const color = CATS_COLORS[cat] || '#b2bec3';
    const sliceAngle = (val / totalExp) * 2 * Math.PI;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(CX, CY, R, startAngle, startAngle + sliceAngle);
    ctx.stroke();

    startAngle += sliceAngle;
  });

  // Texto no centro da rosca
  ctx.fillStyle = '#2d3436';
  ctx.font      = 'bold 11px DM Sans, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total', CX, CY - 4);
  ctx.font      = '10px DM Sans, sans-serif';
  ctx.fillStyle = '#636e72';
  ctx.fillText(fmtShort(totalExp), CX, CY + 8);

  // Desenhar legenda com fatias coloridas ao lado direito do gráfico
  let lx = CX + R + 25;
  let ly = 25;

  // Mostra no máximo as 5 principais categorias na legenda lateral
  sorted.slice(0, 5).forEach(([cat, val]) => {
    const pct = Math.round((val / totalExp) * 100);
    const color = CATS_COLORS[cat] || '#b2bec3';
    const label = cat.split(' ').slice(1).join(' '); // Sem o emoji na legenda

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(lx, ly - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2d3436';
    ctx.font      = '9px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${label} (${pct}%)`, lx + 8, ly);

    ly += 22;
  });
}

/* --------------------------------------------------
   UTILITÁRIOS DE SUPORTE
-------------------------------------------------- */

function drawLegend(ctx, W, colors, labels) {
  let x = W - 4;
  colors.forEach((color, idx) => {
    const label = labels[idx];
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

/* --------------------------------------------------
   EXPORTAÇÃO DE RELATÓRIOS (CSV & PDF)
-------------------------------------------------- */

/**
 * Exporta as transações do período filtrado para um arquivo CSV
 */
function exportCSV() {
  const txs = getTxsForPeriod();
  if (txs.length === 0) {
    showToast('⚠️ Nenhuma transação encontrada no período.');
    return;
  }

  // Cabeçalho do CSV
  let csvContent = 'ID,Data,Descrição,Categoria,Tipo,Valor\n';

  txs.forEach(t => {
    const dateFormatted = new Date(t.date).toLocaleDateString('pt-BR');
    const typeLabel = t.type === 'income' ? 'Receita' : 'Despesa';
    // Remove o emoji da categoria para o CSV
    const catClean = t.cat.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
    
    // Escapar aspas duplas caso existam
    const descEscaped = t.desc.replace(/"/g, '""');

    csvContent += `${t.id},"${dateFormatted}","${descEscaped}","${catClean}","${typeLabel}",${t.val}\n`;
  });

  // Download usando Blob para suportar acentuação UTF-8
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const currentLabel = document.getElementById('chart-period-label')?.textContent || 'Relatorio';
  const fileName = `AppFi_Relatorio_${currentLabel.replace(' ', '_')}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('📥 Arquivo CSV baixado com sucesso!');
}

/**
 * Imprime os relatórios formatados em PDF usando a janela nativa
 */
function exportPDF() {
  showToast('📄 Preparando impressão em PDF...');
  setTimeout(() => {
    window.print();
  }, 500);
}

// Redesenha os gráficos ao redimensionar janela
window.addEventListener('resize', () => {
  if (document.getElementById('pg-charts').classList.contains('active')) {
    drawCharts();
  }
});
