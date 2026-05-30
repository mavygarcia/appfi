// Estado de autenticação global
let token = null;
let currentUser = null;

// Ao inicializar o script, verifica se há token salvo
document.addEventListener('DOMContentLoaded', () => {
  checkAuthOnInit();
});

/**
 * Verifica se o usuário já possui um token salvo
 */
async function checkAuthOnInit() {
  token = localStorage.getItem('appfi_token') || sessionStorage.getItem('appfi_token');
  const savedUser = localStorage.getItem('appfi_user') || sessionStorage.getItem('appfi_user');

  const navEl = document.querySelector('.nav');

  if (token && savedUser) {
    currentUser = JSON.parse(savedUser);
    if (navEl) navEl.style.display = 'flex'; // Exibe a barra de navegação
    
    // Atualiza saudação e avatar no dashboard
    updateDashboardProfileUI();
    
    // Carrega dados do backend
    await loadData();
    switchPage('pg-home');
  } else {
    if (navEl) navEl.style.display = 'none'; // Oculta barra de navegação
    switchPage('pg-auth');
  }
}

/**
 * Controla qual formulário de autenticação deve ser exibido
 * @param {string} mode - 'login', 'register', 'forgot', 'reset'
 */
function showAuthForm(mode) {
  const loginWrap = document.getElementById('auth-login-wrap');
  const registerWrap = document.getElementById('auth-register-wrap');
  const forgotWrap = document.getElementById('auth-forgot-wrap');
  const resetWrap = document.getElementById('auth-reset-wrap');

  // Ocultar todos primeiro
  loginWrap.style.display = 'none';
  registerWrap.style.display = 'none';
  forgotWrap.style.display = 'none';
  resetWrap.style.display = 'none';

  // Mostrar o selecionado
  if (mode === 'login') loginWrap.style.display = 'block';
  else if (mode === 'register') registerWrap.style.display = 'block';
  else if (mode === 'forgot') forgotWrap.style.display = 'block';
  else if (mode === 'reset') resetWrap.style.display = 'block';
}

/**
 * Realiza o login (POST /api/auth/login)
 */
async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember').checked;

  if (!email || !password) {
    showToast('⚠️ Informe e-mail e senha!');
    return;
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      token = data.token;
      currentUser = data.user;

      // Persistir token e usuário
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('appfi_token', token);
      storage.setItem('appfi_user', JSON.stringify(currentUser));

      showToast('🔑 Login efetuado com sucesso!');
      
      // Exibe barra de navegação e redireciona
      const navEl = document.querySelector('.nav');
      if (navEl) navEl.style.display = 'flex';
      
      updateDashboardProfileUI();
      await loadData();
      switchPage('pg-home');
    } else {
      showToast('❌ ' + (data.error || 'Credenciais inválidas!'));
    }
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
}

/**
 * Realiza o cadastro (POST /api/auth/register)
 */
async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const lastname = document.getElementById('reg-lastname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-password-confirm').value;

  if (!name || !lastname || !email || !password) {
    showToast('⚠️ Preencha os campos obrigatórios!');
    return;
  }

  if (password.length < 8) {
    showToast('⚠️ A senha deve ter pelo menos 8 caracteres!');
    return;
  }

  if (password !== confirmPassword) {
    showToast('⚠️ As senhas não coincidem!');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, lastname, email, phone, password })
    });

    const data = await res.json();

    if (res.ok) {
      showToast('✅ Conta criada com sucesso!');
      showAuthForm('login');
      // Preencher o e-mail de login para facilitar
      document.getElementById('login-email').value = email;
      document.getElementById('login-password').value = '';
    } else {
      showToast('❌ ' + (data.error || 'Erro ao cadastrar usuário!'));
    }
  } catch (err) {
    console.error('Erro no cadastro:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
}

/**
 * Solicita recuperação de senha (POST /api/auth/forgot-password)
 */
async function handleForgotPassword() {
  const email = document.getElementById('forgot-email').value.trim();

  if (!email) {
    showToast('⚠️ Informe seu e-mail!');
    return;
  }

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      showToast('✉️ Token gerado com sucesso!');
      if (data.resetToken) {
        // Exibe o token gerado para que o usuário possa copiar e testar facilmente
        setTimeout(() => {
          alert(`Código de recuperação gerado:\n\n${data.resetToken}\n\nCopie o código acima e cole na tela a seguir.`);
          showAuthForm('reset');
          document.getElementById('reset-token').value = data.resetToken;
        }, 500);
      }
    } else {
      showToast('❌ ' + (data.error || 'Erro ao solicitar recuperação.'));
    }
  } catch (err) {
    console.error('Erro ao solicitar token:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
}

/**
 * Executa a redefinição de senha (POST /api/auth/reset-password)
 */
async function handleResetPassword() {
  const tokenVal = document.getElementById('reset-token').value.trim();
  const password = document.getElementById('reset-password').value;
  const confirmPassword = document.getElementById('reset-password-confirm').value;

  if (!tokenVal || !password) {
    showToast('⚠️ Informe o token e a nova senha!');
    return;
  }

  if (password.length < 8) {
    showToast('⚠️ A nova senha deve ter pelo menos 8 caracteres!');
    return;
  }

  if (password !== confirmPassword) {
    showToast('⚠️ As senhas não coincidem!');
    return;
  }

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenVal, password })
    });

    const data = await res.json();

    if (res.ok) {
      showToast('✅ Senha redefinida com sucesso!');
      showAuthForm('login');
    } else {
      showToast('❌ ' + (data.error || 'Erro ao redefinir a senha!'));
    }
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
}

/**
 * Logout do usuário
 */
function handleLogout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('appfi_token');
  localStorage.removeItem('appfi_user');
  sessionStorage.removeItem('appfi_token');
  sessionStorage.removeItem('appfi_user');

  // Limpa campos do login
  document.getElementById('login-password').value = '';

  // Oculta a barra de navegação
  const navEl = document.querySelector('.nav');
  if (navEl) navEl.style.display = 'none';

  showToast('🔒 Sessão encerrada!');
  showAuthForm('login');
  switchPage('pg-auth');
}

/**
 * Atualiza elementos de perfil na interface
 */
function updateDashboardProfileUI() {
  if (!currentUser) return;

  // Atualiza saudação
  const greetingEl = document.getElementById('hero-name');
  if (greetingEl) {
    greetingEl.textContent = `${currentUser.name} ${currentUser.lastname}!`;
  }

  // Abreviação das iniciais para o avatar
  const initials = (currentUser.name[0] || '') + (currentUser.lastname[0] || '');
  const avatarBtn = document.getElementById('avatar-btn');
  const profPreview = document.getElementById('profile-avatar-preview');

  if (avatarBtn) {
    if (currentUser.photo) {
      avatarBtn.innerHTML = `<img src="${currentUser.photo}" style="width:100%; height:100%; object-fit:cover;" />`;
    } else {
      avatarBtn.textContent = initials.toUpperCase() || 'U';
    }
  }

  if (profPreview) {
    if (currentUser.photo) {
      profPreview.innerHTML = `<img src="${currentUser.photo}" style="width:100%; height:100%; object-fit:cover;" />`;
    } else {
      profPreview.textContent = initials.toUpperCase() || 'U';
    }
  }

  // Preenche formulário de edição de perfil
  const pName = document.getElementById('prof-name');
  const pLastname = document.getElementById('prof-lastname');
  const pEmail = document.getElementById('prof-email');
  const pPhone = document.getElementById('prof-phone');

  if (pName) pName.value = currentUser.name;
  if (pLastname) pLastname.value = currentUser.lastname;
  if (pEmail) pEmail.value = currentUser.email;
  if (pPhone) pPhone.value = currentUser.phone || '';

  // Preenche configurações adicionais
  const remindersEnabled = localStorage.getItem('appfi_reminders') === 'true';
  const remindersInput = document.getElementById('sett-reminders');
  if (remindersInput) remindersInput.checked = remindersEnabled;

  const categoryBudget = localStorage.getItem('appfi_budget') || '1000';
  const budgetInput = document.getElementById('sett-budget');
  if (budgetInput) budgetInput.value = categoryBudget;
}

/**
 * Converte upload de imagem em base64 e exibe preview
 */
function handleProfilePhotoUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64Image = e.target.result;
      
      // Atualiza o preview em memória e na tela temporariamente
      currentUser.photo = base64Image;
      const profPreview = document.getElementById('profile-avatar-preview');
      if (profPreview) {
        profPreview.innerHTML = `<img src="${base64Image}" style="width:100%; height:100%; object-fit:cover;" />`;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

/**
 * Salva as alterações de perfil no backend (PUT /api/profile)
 */
async function saveProfile() {
  const name = document.getElementById('prof-name').value.trim();
  const lastname = document.getElementById('prof-lastname').value.trim();
  const email = document.getElementById('prof-email').value.trim();
  const phone = document.getElementById('prof-phone').value.trim();
  const photo = currentUser ? currentUser.photo : null;

  if (!name || !lastname || !email) {
    showToast('⚠️ Nome, Sobrenome e E-mail são obrigatórios!');
    return;
  }

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, lastname, email, phone, photo })
    });

    const data = await res.json();

    if (res.ok) {
      showToast('👤 Perfil atualizado com sucesso!');
      currentUser = data.user;

      // Salva no storage apropriado
      const storage = localStorage.getItem('appfi_token') ? localStorage : sessionStorage;
      storage.setItem('appfi_user', JSON.stringify(currentUser));

      updateDashboardProfileUI();
    } else {
      showToast('❌ ' + (data.error || 'Erro ao atualizar perfil!'));
    }
  } catch (err) {
    console.error('Erro ao salvar perfil:', err);
    showToast('❌ Erro de conexão com o servidor.');
  }
}

/**
 * Habilita/Desabilita lembretes diários
 */
function toggleReminders(checkbox) {
  localStorage.setItem('appfi_reminders', checkbox.checked);
  showToast(checkbox.checked ? '🔔 Lembretes diários ativados!' : '🔕 Lembretes desativados.');
}

/**
 * Salva o orçamento limite para categorias
 */
function saveCategoryBudget(val) {
  const budgetVal = parseFloat(val) || 1000;
  localStorage.setItem('appfi_budget', budgetVal);
  showToast(`💰 Orçamento definido para R$ ${budgetVal.toFixed(2)}`);
}
