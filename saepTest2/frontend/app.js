const API_URL = 'http://localhost:3000';

const btnLogin = document.getElementById('#btn-login');
const email = document.getElementById('input-email').value.trim();
const senha = document.getElementById('input-senha').value.trim();
const inputEmail = document.getElementById('input-email');
const inputSenha = document.getElementById('input-senha');
const erroMsg = document.getElementById('erro-login');

if (!email || !senha) {
  erroMsg.innerText = 'email ou senha obrigatórios';
}

try {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json();

  if (!res.ok) {
    erroMsg.innerText = 'Erro de Log';
  }

  fazerLogin;
} catch (error) {}
