
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
  renderAll();
  console.log(' App Financeiro iniciado com sucesso!');
});
