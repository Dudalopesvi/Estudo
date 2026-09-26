let state = {
    user: null,
    tipoFiltro: 'todos',
    paginaAtual: 1
};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    await carregarEmpresa();
    await carregarAtividades();
}

function setupEventListeners() {
    document.getElementById('btnAuth').addEventListener('click', handleAuthButtonClick);
    document.getElementById('btnCloseModal').addEventListener('click', fecharModal);
    document.getElementById('btnCancelarLogin').addEventListener('click', fecharModal);
    document.getElementById('loginForm').addEventListener('submit', executarLogin);

    document.getElementById('loginModal').addEventListener('click', (e) => {
        if (e.target.id === 'loginModal') fecharModal();
        document.getElementById('btnNovaAtividade').addEventListener('click', () => {
            if (!state.user) {
                abrirModal();
                return;
            }
            abrirModalAtividade();
        });
        document.getElementById('btnCloseAtividadeModal').addEventListener('click', fecharModalAtividade);
        document.getElementById('btnCancelarAtividade').addEventListener('click', fecharModalAtividade);
        document.getElementById('atividadeForm').addEventListener('submit', criarAtividadeSubmit);

        document.getElementById('atividadeModal').addEventListener('click', (e) => {
            if (e.target.id === 'atividadeModal') fecharModalAtividade();
        });
    });

    document.querySelectorAll('.filtro-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filtro-item').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');
            state.tipoFiltro = e.target.dataset.tipo;
            state.paginaAtual = 1;
            carregarAtividades();
        });
    });
}

async function carregarEmpresa() {
    try {
        const res = await fetch('/empresa');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.length > 0) {
            const emp = data[0];
            const logoEl = document.getElementById('companyLogo');
            const nameEl = document.getElementById('companyName');
            const footerEl = document.getElementById('footerCompanyName');

            if (logoEl && emp.logo) logoEl.src = emp.logo;
            if (nameEl && emp.nome) nameEl.innerText = emp.nome;
            if (footerEl && emp.nome) footerEl.innerText = emp.nome;
        }
    } catch (err) {
        console.error('Erro ao carregar dados da empresa:', err);
    }
}

async function carregarAtividades() {
    const container = document.getElementById('activitiesContainer');
    try {
        const params = new URLSearchParams();
        params.set('pagina', state.paginaAtual);
        if (state.tipoFiltro !== 'todos') params.set('tipo', state.tipoFiltro);
        if (state.user) params.set('usuario_id', state.user.id);

        const res = await fetch(`/atividades?${params.toString()}`);
        if (!res.ok) throw new Error('Falha ao buscar atividades');

        const data = await res.json();
        // O backend pagina e filtra no banco; o frontend só renderiza o que recebeu.
        renderizarAtividades(data.atividades || [], data.totalPaginas || 1);
    } catch (err) {
        console.error('Erro ao carregar atividades:', err);
        if (container) {
            container.innerHTML = '<p class="listagem-vazia">Erro ao carregar as atividades do banco de dados.</p>';
        }
    }
}

function renderizarAtividades(atividades, totalPaginas) {
    const container = document.getElementById('activitiesContainer');
    if (!container) return;
    container.innerHTML = '';

    if (atividades.length === 0) {
        container.innerHTML = '<p class="listagem-vazia">Nenhuma atividade encontrada.</p>';
        renderizarPaginacao(totalPaginas || 1);
        return;
    }

    atividades.forEach(act => {
        const card = document.createElement('article');
        card.className = 'card-atividade';

        const avatarSrc = act.usuario_foto || './assets/icons/logo-placeholder.svg';
        card.innerHTML = `
      <h3 class="card-titulo">${act.titulo || 'Atividade'}</h3>
      
      <div class="card-corpo">
        <img src="${avatarSrc}" alt="${act.usuario_nome || 'Usuário'}" class="card-avatar" onerror="this.src='./assets/icons/logo-placeholder.svg'">
        <div class="card-info">
          <span class="card-usuario">${act.usuario_nome || 'Anônimo'}</span>
          <span class="card-detalhe">Distância: ${act.distancia || 0} km</span>
          <span class="card-detalhe">Duração: ${formatarDuracao(act.duracao)}</span>          <span class="card-data">${formatarData(act.data)}</span>
        </div>
      </div>

      <div class="card-interacoes">
              <button class="interacao-btn ${act.curtido ? 'curtido' : ''}" id="btn-curtir-${act.id}" onclick="interagir('like', ${act.id})">
          <svg class="icone-coracao" viewBox="0 0 24 24" width="18" height="18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
          </svg>
          <span id="likes-count-${act.id}">${act.likes || 0}</span>
        </button>
        <button class="interacao-btn" onclick="interagir('comentario', ${act.id})">
          <img src="./assets/icons/comentario.svg" alt="Comentar">
          <span id="comentarios-count-${act.id}">${act.comentarios || 0}</span>
        </button>
      </div>

      <div class="painel-comentarios hidden" id="painel-comentarios-${act.id}">
        <div class="lista-comentarios" id="lista-comentarios-${act.id}"></div>
        <form class="form-comentario" id="form-comentario-${act.id}" onsubmit="enviarComentario(event, ${act.id})">
          <textarea placeholder="Escreva um comentário..." id="input-comentario-${act.id}" rows="2"></textarea>
          <div class="comentario-erro hidden" id="erro-comentario-${act.id}"></div>
          <button type="submit" class="btn-comentar">Comentar</button>
        </form>
      </div>
    `;
        container.appendChild(card);
    });

    renderizarPaginacao(totalPaginas);
}

function renderizarPaginacao(totalPaginas) {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.className = `pagina-item ${i === state.paginaAtual ? 'ativo' : ''}`;
        btn.innerText = i;
        btn.addEventListener('click', () => {
            state.paginaAtual = i;
            carregarAtividades();
        });
        container.appendChild(btn);
    }
}

function interagir(tipo, id) {
    if (!state.user) {
        abrirModal();
        return;
    }

    if (tipo === 'like') {
        curtirAtividade(id);
    } else if (tipo === 'comentario') {
        toggleComentarios(id);
    }
}

async function curtirAtividade(id) {
    try {
        const res = await fetch(`/atividades/${id}/curtir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: state.user.id })
        });

        const data = await res.json();
        if (!res.ok) {
            console.error(data.message);
            return;
        }

        // Atualiza o ícone e o contador em tempo real, sem recarregar a lista inteira.
        // Atualiza o ícone (via CSS, pela classe) e o contador em tempo real,
        // sem recarregar a lista inteira.
        const botao = document.getElementById(`btn-curtir-${id}`);
        const contador = document.getElementById(`likes-count-${id}`);

        if (botao) botao.classList.toggle('curtido', data.curtido);
        if (contador) contador.innerText = data.likes;
    } catch (err) {
        console.error('Erro ao curtir atividade:', err);
    }
}

async function toggleComentarios(id) {
    const painel = document.getElementById(`painel-comentarios-${id}`);
    if (!painel) return;

    const estaEscondido = painel.classList.contains('hidden');
    painel.classList.toggle('hidden');

    if (estaEscondido) {
        await carregarComentarios(id);
    }
}

async function carregarComentarios(id) {
    const lista = document.getElementById(`lista-comentarios-${id}`);
    if (!lista) return;

    lista.innerHTML = '<p class="comentario-carregando">Carregando comentários...</p>';

    try {
        const res = await fetch(`/atividades/${id}/comentarios`);
        const comentarios = await res.json();

        if (!res.ok) throw new Error('Falha ao buscar comentários');

        if (comentarios.length === 0) {
            lista.innerHTML = '<p class="comentario-vazio">Nenhum comentário ainda. Seja o primeiro!</p>';
            return;
        }

        lista.innerHTML = comentarios.map(c => `
      <div class="comentario-item">
        <span class="comentario-autor">${c.usuario_nome}</span>
        <span class="comentario-texto">${escapeHtml(c.texto)}</span>
      </div>
    `).join('');
    } catch (err) {
        console.error('Erro ao carregar comentários:', err);
        lista.innerHTML = '<p class="comentario-vazio">Erro ao carregar comentários.</p>';
    }
}

async function enviarComentario(e, id) {
    e.preventDefault();

    const input = document.getElementById(`input-comentario-${id}`);
    const erroBox = document.getElementById(`erro-comentario-${id}`);
    const texto = input.value.trim();

    erroBox.classList.add('hidden');
    erroBox.innerText = '';

    if (texto.length === 0) {
        erroBox.innerText = 'O comentário não pode ficar vazio.';
        erroBox.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch(`/atividades/${id}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario_id: state.user.id, texto })
        });

        const data = await res.json();

        if (!res.ok) {
            erroBox.innerText = data.message || 'Não foi possível enviar o comentário.';
            erroBox.classList.remove('hidden');
            return;
        }

        input.value = '';
        await carregarComentarios(id);

        const contador = document.getElementById(`comentarios-count-${id}`);
        if (contador) contador.innerText = data.totalComentarios;
    } catch (err) {
        erroBox.innerText = 'Erro ao conectar ao servidor.';
        erroBox.classList.remove('hidden');
    }
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.innerText = texto;
    return div.innerHTML;
}

function formatarDuracao(minutosTotais) {
    const minutos = Number(minutosTotais) || 0;
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

function formatarData(dataIso) {
    if (!dataIso) return '';
    const d = new Date(dataIso);
    if (isNaN(d.getTime())) return dataIso;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${hh}:${mm} - ${dd}/${mes}/${yy}`;
}

function abrirModalAtividade() {
    const modal = document.getElementById('atividadeModal');
    if (modal) modal.classList.remove('hidden');
}

function fecharModalAtividade() {
    const modal = document.getElementById('atividadeModal');
    if (modal) modal.classList.add('hidden');
    limparErrosAtividade();
}

function limparErrosAtividade() {
    ['tituloInput', 'tipoInput', 'distanciaInput', 'duracaoInput'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('error');
    });
    const errBox = document.getElementById('atividadeError');
    if (errBox) {
        errBox.classList.add('hidden');
        errBox.innerText = '';
    }
}

function exibirErroAtividade(msg) {
    const errBox = document.getElementById('atividadeError');
    if (errBox) {
        errBox.innerText = msg;
        errBox.classList.remove('hidden');
    }
}

async function criarAtividadeSubmit(e) {
    e.preventDefault();
    limparErrosAtividade();

    const tituloEl = document.getElementById('tituloInput');
    const tipoEl = document.getElementById('tipoInput');
    const distanciaEl = document.getElementById('distanciaInput');
    const duracaoEl = document.getElementById('duracaoInput');

    const titulo = tituloEl.value.trim();
    const tipo = tipoEl.value;
    const distanciaMetros = distanciaEl.value;
    const duracaoMinutos = duracaoEl.value;

    let temErro = false;
    if (!titulo) {
        tituloEl.classList.add('error');
        temErro = true;
    }
    if (!tipo) {
        tipoEl.classList.add('error');
        temErro = true;
    }
    if (!distanciaMetros || Number(distanciaMetros) <= 0) {
        distanciaEl.classList.add('error');
        temErro = true;
    }
    if (!duracaoMinutos || Number(duracaoMinutos) <= 0) {
        duracaoEl.classList.add('error');
        temErro = true;
    }

    if (temErro) {
        exibirErroAtividade('Preencha todos os campos obrigatórios corretamente.');
        return;
    }

    try {
        const res = await fetch('/atividades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: state.user.id,
                titulo,
                tipo,
                distancia_metros: Number(distanciaMetros),
                duracao_minutos: Number(duracaoMinutos)
            })
        });

        const data = await res.json();

        if (!res.ok) {
            exibirErroAtividade(data.message || 'Não foi possível criar a atividade.');
            return;
        }

        fecharModalAtividade();
        document.getElementById('atividadeForm').reset();

        state.tipoFiltro = 'todos';
        state.paginaAtual = 1;
        document.querySelectorAll('.filtro-item').forEach(b => b.classList.remove('ativo'));
        const btnTodos = document.querySelector('.filtro-item[data-tipo="todos"]');
        if (btnTodos) btnTodos.classList.add('ativo');

        carregarAtividades();
    } catch (err) {
        exibirErroAtividade('Erro ao conectar ao servidor.');
    }
}

function abrirModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('hidden');
}

function fecharModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('hidden');
    limparErrosLogin();
}

function limparErrosLogin() {
    const emailInp = document.getElementById('emailInput');
    const senhaInp = document.getElementById('senhaInput');
    const errBox = document.getElementById('loginError');

    if (emailInp) emailInp.classList.remove('error');
    if (senhaInp) senhaInp.classList.remove('error');
    if (errBox) {
        errBox.classList.add('hidden');
        errBox.innerText = '';
    }
}

function handleAuthButtonClick() {
    if (state.user) {
        state.user = null;
        document.getElementById('btnAuth').innerText = 'Login';
        document.getElementById('profileName').innerText = 'Visitante';
        document.getElementById('profileStatsVal').innerText = '0';
        document.getElementById('profileAvatar').src = './assets/icons/logo-placeholder.svg';

        const btnMinhas = document.getElementById('btnMinhasAtividades');
        if (btnMinhas) btnMinhas.setAttribute('disabled', 'true');

        state.tipoFiltro = 'todos';
        state.paginaAtual = 1;
        carregarAtividades();
    } else {
        abrirModal();
    }
}

async function executarLogin(e) {
    e.preventDefault();
    limparErrosLogin();

    const email = document.getElementById('emailInput').value.trim();
    const senha = document.getElementById('senhaInput').value.trim();

    if (!email || !senha) {
        if (!email) document.getElementById('emailInput').classList.add('error');
        if (!senha) document.getElementById('senhaInput').classList.add('error');
        exibirErroLogin('email ou senha obrigatório');
        return;
    }

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (!res.ok) {
            document.getElementById('emailInput').classList.add('error');
            document.getElementById('senhaInput').classList.add('error');
            exibirErroLogin(data.message || 'email ou senha incorreta');
            return;
        }

        state.user = data.user;

        document.getElementById('btnAuth').innerText = 'Logout';
        document.getElementById('profileName').innerText = state.user.nome || 'Usuário';
        document.getElementById('profileStatsVal').innerText = state.user.total_calorias || 0;

        const avatarEl = document.getElementById('profileAvatar');
        if (avatarEl) {
            avatarEl.src = state.user.foto || './assets/icons/logo-placeholder.svg';
        }

        const btnMinhas = document.getElementById('btnMinhasAtividades');
        if (btnMinhas) btnMinhas.removeAttribute('disabled');

        const btnNova = document.getElementById('btnNovaAtividade');
        if (btnNova) btnNova.removeAttribute('disabled');

        fecharModal();
        carregarAtividades();

    } catch (err) {
        exibirErroLogin('Erro ao conectar ao servidor.');
    }
}

function exibirErroLogin(msg) {
    const errBox = document.getElementById('loginError');
    if (errBox) {
        errBox.innerText = msg;
        errBox.classList.remove('hidden');
    }
}

const btnMinhas = document.getElementById('btnMinhasAtividades');
if (btnMinhas) btnMinhas.setAttribute('disabled', 'true');

const btnNova = document.getElementById('btnNovaAtividade');
if (btnNova) btnNova.setAttribute('disabled', 'true');

state.tipoFiltro = 'todos';