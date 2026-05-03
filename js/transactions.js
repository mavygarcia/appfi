

let txFilter = 'all';  // filtro atual: 'all' | 'income' | 'expense'
let editId   = null;   // id da transação em edição (null = nova)
let txType   = 'income'; // tipo selecionado no modal



/**
 * Renderiza o hero com saldo, receita, despesa
 * e lista as 5 últimas transações
 */
function renderHome() {
  const all = getTxsForPeriod();

  const totalInc = all
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.val, 0);

  const totalExp = all
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.val, 0);

  // Atualiza cards do hero
  document.getElementById('hero-balance').textContent = fmt(totalInc - totalExp);
  document.getElementById('hero-inc').textContent     = fmt(totalInc);
  document.getElementById('hero-exp').textContent     = fmt(totalExp);

  // Últimas 5 transações (ordenadas por data)
  const recent = [...txs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  document.getElementById('home-txs').innerHTML =
    recent.length
      ? recent.map(t => txCard(t)).join('')
      : '<div class="empty-state"><div class="empty-state-icon">💸</div>Nenhuma transação ainda</div>';
}

/* --------------------------------------------------
   RENDERIZAÇÃO — EXTRATO (pg-txs)
-------------------------------------------------- */

/**
 * Atualiza label do período e renderiza a lista filtrada
 */
function renderTxPage() {
  const MONTHS = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  document.getElementById('period-label').textContent =
    MONTHS[currentPeriod.m - 1] + ' ' + currentPeriod.y;

  const query = (document.getElementById('tx-search')?.value || '').toLowerCase();

  const list = getTxsForPeriod()
    .filter(t => txFilter === 'all' || t.type === txFilter)
    .filter(t => t.desc.toLowerCase().includes(query))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById('page-txs').innerHTML =
    list.length
      ? list.map(t => txCard(t)).join('')
      : '<div class="empty-state"><div class="empty-state-icon">🔍</div>Nenhuma transação encontrada</div>';
}

/**
 * Navega para o mês anterior ou próximo
 * @param {number} dir  -1 (anterior) | +1 (próximo)
 */
function changePeriod(dir) {
  currentPeriod.m += dir;
  if (currentPeriod.m > 12) { currentPeriod.m = 1;  currentPeriod.y++; }
  if (currentPeriod.m < 1)  { currentPeriod.m = 12; currentPeriod.y--; }
  renderTxPage();
}

/**
 * Aplica filtro de tipo e atualiza botões de aba
 * @param {Element} btn
 * @param {string}  filter
 */
function setFilter(btn, filter) {
  txFilter = filter;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTxPage();
}

/* --------------------------------------------------
   MODAL — ABRIR / FECHAR / TIPO
-------------------------------------------------- */

/**
 * Abre o modal. Se id for fornecido, entra em modo edição.
 * @param {string} type  'income' | 'expense'
 * @param {number|null} id
 */
function openModal(type = 'income', id = null) {
  editId = id;
  setType(type);

  if (id) {
    // MODO EDIÇÃO
    const t = txs.find(x => x.id === id);
    if (t) {
      document.getElementById('modal-title').textContent       = 'Editar Transação';
      document.getElementById('modal-submit-btn').textContent  = 'Salvar Alterações';
      setType(t.type);
      document.getElementById('f-val').value  = t.val;
      document.getElementById('f-desc').value = t.desc;
      document.getElementById('f-cat').value  = t.cat;
      document.getElementById('f-date').value = t.date;
    }
  } else {
    // MODO CRIAÇÃO
    document.getElementById('modal-title').textContent      = 'Nova Transação';
    document.getElementById('modal-submit-btn').textContent = 'Salvar Transação';
    document.getElementById('f-val').value  = '';
    document.getElementById('f-desc').value = '';
    document.getElementById('f-cat').value  = '💰 Salário';
    document.getElementById('f-date').value = new Date().toISOString().split('T')[0];
  }

  document.getElementById('tx-modal').classList.add('open');
}

/** Fecha o modal de transação */
function closeModal() {
  document.getElementById('tx-modal').classList.remove('open');
}

/**
 * Abre o modal em modo edição para a transação id
 * @param {number} id
 */
function editTx(id) {
  const t = txs.find(x => x.id === id);
  openModal(t?.type || 'expense', id);
}

/**
 * Alterna o tipo (receita / despesa) no modal
 * @param {string} type
 */
function setType(type) {
  txType = type;
  document.getElementById('btn-income').classList.toggle('active',  type === 'income');
  document.getElementById('btn-expense').classList.toggle('active', type === 'expense');
}

/* --------------------------------------------------
   SALVAR TRANSAÇÃO (criar ou editar)
-------------------------------------------------- */

/**
 * Lê os campos do modal, valida e persiste.
 * Atualiza todos os painéis em seguida.
 */
function saveTx() {
  const val  = parseFloat(document.getElementById('f-val').value);
  const desc = document.getElementById('f-desc').value.trim();
  const cat  = document.getElementById('f-cat').value;
  const date = document.getElementById('f-date').value;

  if (!val || val <= 0) { showToast('⚠️ Informe um valor válido!'); return; }
  if (!desc)            { showToast('⚠️ Informe uma descrição!');    return; }
  if (!date)            { showToast('⚠️ Informe uma data!');         return; }

  if (editId) {
    // Editar existente
    const idx = txs.findIndex(t => t.id === editId);
    txs[idx] = { ...txs[idx], type: txType, val, desc, cat, date };
    showToast('✅ Transação atualizada!');
    editId = null;
  } else {
    // Nova transação
    txs.push({ id: Date.now(), type: txType, desc, cat, val, date });
    showToast('✅ Transação salva!');
  }

  closeModal();
  renderAll();

  // Redesenha gráficos se a aba estiver visível
  if (document.getElementById('pg-charts').classList.contains('active')) {
    setTimeout(drawCharts, 50);
  }
}
