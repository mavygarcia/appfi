
function renderAll() {
  renderHome();
  renderTxPage();
  renderMetrics();
  renderGoals();
}

/* 
   INICIALIZAÇÃO
 */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  console.log(' App Financeiro iniciado com sucesso!');
});
