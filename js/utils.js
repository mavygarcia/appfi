

/**
 * Formata um número como moeda brasileira
 * @param {number} v
 * @returns {string} Ex: "R$ 1.234,56"
 */
function fmt(v) {
  return 'R$ ' + v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata número de forma curta 
 * @param {number} v
 * @returns {string}
 */
function fmtShort(v) {
  if (v >= 1000) return 'R$' + (v / 1000).toFixed(1) + 'k';
  return 'R$' + v;
}

/**
 * Exibe um toast de feedback por 2.5 segundos
 * @param {string} msg
 */
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

/**
 * Retorna as transações do período selecionado
 * @returns {Array}
 */
function getTxsForPeriod() {
  return txs.filter(t => {
    const d = new Date(t.date);
    return (
      d.getFullYear() === currentPeriod.y &&
      d.getMonth() + 1 === currentPeriod.m
    );
  });
}

/**
 * Gera o HTML de um card de transação
 * @param {Object} t  objeto de transação
 * @returns {string}  HTML string
 */
function txCard(t) {
  const emoji = t.cat.split(' ')[0];
  const bgColor = (CATS_COLORS[t.cat] || '#b2bec3') + '22';
  const catLabel = t.cat.split(' ').slice(1).join(' ');
  const dateStr = new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR');

  return `
    <div class="tx-item" onclick="editTx(${t.id})">
      <div class="tx-icon" style="background:${bgColor}">${emoji}</div>
      <div class="tx-info">
        <div class="name">${t.desc}</div>
        <div class="date">${catLabel} · ${dateStr}</div>
      </div>
      <div class="tx-val ${t.type === 'income' ? 'inc' : 'exp'}">
        ${t.type === 'income' ? '+' : '-'}${fmt(t.val)}
      </div>
    </div>
  `;
}

/**
 * Troca a página visível e atualiza o nav ativo
 * @param {string} pageId   id da div .page
 * @param {Element} [btn]   botão do nav clicado (opcional)
 */
function switchPage(pageId, btn) {
  // Esconde todas as páginas
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  // Atualiza nav
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const pageIndex = { 'pg-home': 0, 'pg-txs': 1, 'pg-charts': 2, 'pg-goals': 3 };
    const idx = pageIndex[pageId] ?? 0;
    document.querySelectorAll('.nav-btn')[idx].classList.add('active');
  }

  // Desenha gráficos se for a aba de gráficos
  if (pageId === 'pg-charts') {
    setTimeout(drawCharts, 100);
  }

  renderAll();
}
