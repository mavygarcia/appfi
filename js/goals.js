
function renderGoals() {
  const container = document.getElementById('goals-list');

  if (!goals.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        Nenhuma meta criada ainda.<br>
        Clique abaixo para começar!
      </div>
    `;
    return;
  }

  container.innerHTML = goals.map(g => {
    const pct  = Math.min(100, Math.round((g.current / g.target) * 100));
    const dl   = new Date(g.deadline);
    const days = Math.max(0, Math.round((dl - new Date()) / (1000 * 60 * 60 * 24)));

    
    const barColor = pct >= 80 ? '#00b894' : pct >= 50 ? '#fdcb6e' : '#6C5CE7';

    // Badge de status
    const badge = getBadge(pct);

    return `
      <div class="goal-card">
        <div class="goal-top">
          <div class="goal-name">${g.name}</div>
          <div class="goal-badge" style="background:${badge.bg}; color:${badge.color}">
            ${badge.label}
          </div>
        </div>

        <div class="goal-progress">
          <div class="goal-fill" style="width:${pct}%; background:${barColor}"></div>
        </div>

        <div class="goal-vals">
          <span>${fmt(g.current)}</span>
          <span style="font-weight:600; color:${barColor}">${pct}%</span>
          <span>${fmt(g.target)}</span>
        </div>

        <div class="goal-footer">
          <span>${days === 0 ? '🏁 Prazo hoje!' : days + ' dias restantes'}</span>
          <button class="remove-btn" onclick="deleteGoal(${g.id})">Remover</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Retorna dados do badge conforme percentual de conclusão
 * @param {number} pct
 * @returns {{ bg, color, label }}
 */
function getBadge(pct) {
  if (pct >= 100) return { bg: '#e8f8f5', color: '#00b894', label: '🎉 Concluída!' };
  if (pct >= 80)  return { bg: '#e8f8f5', color: '#00b894', label: '🔥 Quase lá!' };
  if (pct >= 50)  return { bg: '#fff8e5', color: '#e67e22', label: '⚡ Metade lá' };
  return              { bg: '#f0eeff', color: '#6C5CE7', label: 'Em andamento' };
}

/**
 * Remove uma meta pelo id
 * @param {number} id
 */
function deleteGoal(id) {
  if (!confirm('Tem certeza que deseja remover esta meta?')) return;
  goals = goals.filter(g => g.id !== id);
  renderGoals();
  showToast('Meta removida');
}
/* 
   MODAL — CRIAR META
 */

/** Abre o modal de criação de meta */
function openGoalModal() {
  document.getElementById('g-name').value    = '';
  document.getElementById('g-target').value  = '';
  document.getElementById('g-current').value = '0';
  document.getElementById('g-date').value    = '2027-12-31';
  document.getElementById('goal-modal').classList.add('open');
}

/** Fecha o modal de meta */
function closeGoalModal() {
  document.getElementById('goal-modal').classList.remove('open');
}

/**
 * Valida e salva uma nova meta,
 * respeitando o limite de 5 metas simultâneas
 */
function saveGoal() {
  const name    = document.getElementById('g-name').value.trim();
  const target  = parseFloat(document.getElementById('g-target').value);
  const current = parseFloat(document.getElementById('g-current').value) || 0;
  const deadline= document.getElementById('g-date').value;

  if (!name)         { showToast(' Informe o nome da meta!');   return; }
  if (!target || target <= 0) { showToast(' Informe um valor alvo válido!'); return; }
  if (!deadline)     { showToast(' Informe o prazo!');          return; }
  if (current > target) { showToast(' Valor atual maior que o alvo!'); return; }

  if (goals.length >= 5) {
    showToast(' Máximo de 5 metas simultâneas atingido!');
    return;
  }

  goals.push({
    id: Date.now(),
    name,
    target,
    current,
    deadline,
  });

  closeGoalModal();
  renderGoals();
  showToast('Meta criada com sucesso!');
}
