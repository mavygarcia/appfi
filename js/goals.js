
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
 * Remove uma meta pelo id via DELETE
 * @param {number} id
 */
async function deleteGoal(id) {
  if (!confirm('Tem certeza que deseja remover esta meta?')) return;
  try {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      showToast('Meta removida com sucesso!');
      await loadData();
    } else {
      showToast('❌ Erro ao remover meta.');
    }
  } catch (err) {
    console.error('Erro ao deletar meta:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
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
 * Valida e salva uma nova meta no backend via POST
 */
async function saveGoal() {
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

  const payload = { name, target, current, deadline };

  try {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Meta criada com sucesso!');
      if (current >= target) {
        setTimeout(() => {
          alert(`🎉 PARABÉNS! Você atingiu 100% da sua meta "${name}"!\nObjetivo alcançado: R$ ${target.toFixed(2)} guardados! 🏆`);
        }, 600);
      }
      closeGoalModal();
      await loadData();
    } else {
      const errData = await res.json();
      showToast('❌ ' + (errData.error || 'Erro ao salvar meta.'));
    }
  } catch (err) {
    console.error('Erro ao salvar meta:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
}
