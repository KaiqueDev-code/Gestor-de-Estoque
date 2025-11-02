// VARIÁVEIS GLOBAIS //

const API_BASE_URL = 'http://localhost:3001/api';
let produtos = [];
let produtosFiltrados = [];
let paginaAtual = 1;
let itensPorPagina = 5;
let produtoEditando = null;
let charts = {}; // Armazenar instâncias dos gráficos

// ELEMENTOS DO DOM //

function getElements() {
    return {
        // Modais
        modalAdd: document.getElementById('modalAddProduct'),
        modalEdit: document.getElementById('modalEditProduct'),
        modalProfile: document.getElementById('modalEditProfile'),
        
        // Botões
        btnAbrirModalAdd: document.getElementById('btnAddProduct'),
        btnFecharModalAdd: document.getElementById('closeModalAdd'),
        btnFecharModalEdit: document.getElementById('closeModalEdit'),
        btnFecharModalProfile: document.getElementById('closeModalProfile'),
        btnLogout: document.getElementById('btnLogout'),
        
        // Formulários
        formAdd: document.getElementById('formAddProduct'),
        formEdit: document.getElementById('formEditProduct'),
        formProfile: document.getElementById('formEditProfile'),
        
        // Tabelas e listas
        tabelaBody: document.getElementById('tabelaBody'),
        destaquesBody: document.getElementById('destaquesBody'),
        
        // Controles
        campoPesquisa: document.getElementById('pesquisa'),
        selectItensPagina: document.getElementById('itensPorPagina'),
        paginacao: document.getElementById('paginacao'),
        
        // Estatísticas
        totalProdutos: document.getElementById('totalProdutos'),
        totalVendido: document.getElementById('totalVendido'),
        totalLucrado: document.getElementById('totalLucrado'),
        totalEstoqueBaixo: document.getElementById('totalEstoqueBaixo'),
        infoTotalProdutos: document.getElementById('infoTotalProdutos'),
        
        // Perfil do usuário
        userProfile: document.getElementById('userProfile'),
        userDropdown: document.getElementById('userDropdown'),
        btnProfile: document.getElementById('btnProfile'),
        fotoInput: document.getElementById('fotoInput'),
        previewFoto: document.getElementById('previewFoto'),
        nomeInput: document.getElementById('nomeInput'),
        emailInput: document.getElementById('emailInput'),
        
        // Configurações
        notificacoesEmail: document.getElementById('notificacoesEmail'),
        modoEscuro: document.getElementById('modoEscuro'),
        configItensPagina: document.getElementById('configItensPagina'),
        dataAtualizacao: document.getElementById('dataAtualizacao')
    };
}

let elements;

// ======================== //
// FUNÇÕES DA API //
// ======================== //

async function carregarProdutosAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`);
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        return await response.json();
    } catch (error) {
        console.error('Erro API:', error);
        throw error;
    }
}

async function adicionarProdutoAPI(produto) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produto)
        });
        
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao adicionar produto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro API:', error);
        throw error;
    }
}

async function atualizarProdutoAPI(id, produto) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(produto)
        });
        
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao atualizar produto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro API:', error);
        throw error;
    }
}

async function excluirProdutoAPI(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao excluir produto');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro API:', error);
        throw error;
    }
}

async function carregarEstatisticasAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/estoque/estatisticas`);
        if (!response.ok) throw new Error('Erro ao carregar estatísticas');
        return await response.json();
    } catch (error) {
        console.error('Erro API:', error);
        throw error;
    }
}

// ======================== //
// SISTEMA DE NAVEGAÇÃO //
// ======================== //

function inicializarNavegacao() {
    // Menu lateral
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            navegarParaPagina(pageId);
        });
    });

    // Menu superior
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            navegarParaPagina(pageId);
        });
    });
}

function navegarParaPagina(pageId) {
    // Esconder todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Remover classe active de todos os itens do menu
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Mostrar página selecionada
    const activePage = document.getElementById(`${pageId}-page`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Ativar item do menu selecionado
    const activeMenuItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }
    
    // Executar ações específicas da página
    executarAcoesPagina(pageId);
}

function executarAcoesPagina(pageId) {
    switch(pageId) {
        case 'dashboard':
            carregarDadosDashboard();
            break;
        case 'relatorios':
            carregarRelatorios();
            break;
        case 'produtos':
            // Já é carregado automaticamente
            break;
        case 'configuracoes':
            carregarConfiguracoes();
            break;
    }
}

// ======================== //
// INICIALIZAÇÃO DOS EVENT LISTENERS //
// ======================== //

function inicializarEventListeners() {
    elements = getElements();
    
    console.log('Inicializando event listeners...');

    // Modal - Adicionar Produto
    if (elements.btnAbrirModalAdd) {
        elements.btnAbrirModalAdd.addEventListener('click', () => {
            elements.modalAdd.style.display = 'block';
        });
    }

    if (elements.btnFecharModalAdd) {
        elements.btnFecharModalAdd.addEventListener('click', () => {
            elements.modalAdd.style.display = 'none';
        });
    }

    // Modal - Editar Produto
    if (elements.btnFecharModalEdit) {
        elements.btnFecharModalEdit.addEventListener('click', () => {
            elements.modalEdit.style.display = 'none';
        });
    }

    // Modal - Perfil
    if (elements.btnFecharModalProfile) {
        elements.btnFecharModalProfile.addEventListener('click', () => {
            elements.modalProfile.style.display = 'none';
        });
    }

    // Fechar modais ao clicar fora
    window.addEventListener('click', (event) => {
        if (elements.modalAdd && event.target === elements.modalAdd) elements.modalAdd.style.display = 'none';
        if (elements.modalEdit && event.target === elements.modalEdit) elements.modalEdit.style.display = 'none';
        if (elements.modalProfile && event.target === elements.modalProfile) elements.modalProfile.style.display = 'none';
    });

    // Formulários
    if (elements.formAdd) {
        elements.formAdd.addEventListener('submit', adicionarProduto);
    }

    if (elements.formEdit) {
        elements.formEdit.addEventListener('submit', editarProduto);
    }

    if (elements.formProfile) {
        elements.formProfile.addEventListener('submit', salvarPerfil);
    }

    // Pesquisa e paginação
    if (elements.campoPesquisa) {
        elements.campoPesquisa.addEventListener('input', () => {
            filtrarProdutos();
            renderizarTabela();
            renderizarPaginacao();
        });
    }

    if (elements.selectItensPagina) {
        elements.selectItensPagina.addEventListener('change', () => {
            itensPorPagina = parseInt(elements.selectItensPagina.value);
            paginaAtual = 1;
            renderizarTabela();
            renderizarPaginacao();
        });
    }

    // Perfil do usuário
    if (elements.userProfile && elements.userDropdown) {
        elements.userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.userDropdown.style.display = elements.userDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            if (elements.userDropdown) {
                elements.userDropdown.style.display = 'none';
            }
        });
    }

    if (elements.btnProfile) {
        elements.btnProfile.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalPerfil();
        });
    }

    if (elements.btnLogout) {
        elements.btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    if (elements.fotoInput) {
        elements.fotoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    elements.previewFoto.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Configurações
    if (elements.configItensPagina) {
        elements.configItensPagina.addEventListener('change', (e) => {
            itensPorPagina = parseInt(e.target.value);
            elements.selectItensPagina.value = itensPorPagina;
            paginaAtual = 1;
            renderizarTabela();
            renderizarPaginacao();
        });
    }

    // Inicializar navegação
    inicializarNavegacao();
}

// ======================== //
// FUNÇÕES DE PRODUTOS //
// ======================== //

async function adicionarProduto(e) {
    e.preventDefault();
    
    const nome = document.getElementById('productName').value.trim();
    const quantidade = parseInt(document.getElementById('productQty').value);
    const preco = parseFloat(document.getElementById('productPrice').value);
    const categoria = document.getElementById('productCategoria').value.trim() || 'Geral';

    if (!nome || isNaN(quantidade) || quantidade < 0 || isNaN(preco) || preco <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    try {
        const novoProduto = await adicionarProdutoAPI({
            nome,
            quantidade,
            preco,
            categoria
        });

        produtos.push(novoProduto);
        filtrarProdutos();
        renderizarTabela();
        renderizarPaginacao();
        
        elements.formAdd.reset();
        elements.modalAdd.style.display = 'none';
        
        alert('Produto adicionado com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar produto: ' + error.message);
    }
}

async function editarProduto(e) {
    e.preventDefault();
    
    if (!produtoEditando) return;

    const nome = document.getElementById('editName').value.trim();
    const quantidade = parseInt(document.getElementById('editQty').value);
    const preco = parseFloat(document.getElementById('editPrice').value);
    const categoria = document.getElementById('editCategoria').value.trim() || 'Geral';

    try {
        const produtoAtualizado = await atualizarProdutoAPI(produtoEditando.id, {
            nome,
            quantidade,
            preco,
            categoria
        });

        // Atualizar localmente
        const produtoIndex = produtos.findIndex(p => p.id === produtoEditando.id);
        if (produtoIndex !== -1) {
            produtos[produtoIndex] = produtoAtualizado;
        }

        filtrarProdutos();
        renderizarTabela();
        renderizarPaginacao();
        
        elements.modalEdit.style.display = 'none';
        produtoEditando = null;
        
        alert('Produto atualizado com sucesso!');
    } catch (error) {
        alert('Erro ao atualizar produto: ' + error.message);
    }
}

function abrirModalEdicao(id) {
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    produtoEditando = produto;
    document.getElementById('editName').value = produto.nome;
    document.getElementById('editQty').value = produto.quantidade;
    document.getElementById('editPrice').value = produto.preco;
    document.getElementById('editCategoria').value = produto.categoria || '';
    elements.modalEdit.style.display = 'block';
}

async function removerProduto(id) {
    if (confirm('Deseja realmente excluir este produto?')) {
        try {
            await excluirProdutoAPI(id);
            produtos = produtos.filter(p => p.id !== id);
            filtrarProdutos();
            renderizarTabela();
            renderizarPaginacao();
            alert('Produto removido com sucesso!');
        } catch (error) {
            alert('Erro ao excluir produto: ' + error.message);
        }
    }
}

// ======================== //
// FUNÇÕES DO DASHBOARD //
// ======================== //

async function carregarDadosDashboard() {
    renderizarDestaques();
    await atualizarEstatisticas();
}

function renderizarDestaques() {
    if (!elements.destaquesBody) return;
    
    // Produtos com estoque baixo (menos de 10 unidades)
    const produtosEstoqueBaixo = produtos.filter(p => p.quantidade < 10)
                                       .sort((a, b) => a.quantidade - b.quantidade);
    
    elements.destaquesBody.innerHTML = '';
    
    if (produtosEstoqueBaixo.length === 0) {
        elements.destaquesBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 1rem;">
                    <i class="fas fa-check-circle" style="color: #28a745;"></i>
                    Nenhum produto com estoque baixo
                </td>
            </tr>
        `;
        return;
    }
    
    produtosEstoqueBaixo.forEach(produto => {
        const tr = document.createElement('tr');
        let status, statusClass;
        
        if (produto.quantidade === 0) {
            status = 'Esgotado';
            statusClass = 'status-esgotado';
        } else if (produto.quantidade < 5) {
            status = 'Estoque Baixo';
            statusClass = 'status-baixo';
        } else {
            status = 'Atenção';
            statusClass = 'status-atencao';
        }
        
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>
                <button class="btn-edit" onclick="abrirModalEdicao(${produto.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        elements.destaquesBody.appendChild(tr);
    });
}


// FUNÇÕES DE RELATÓRIOS //


function carregarRelatorios() {
    inicializarGraficosRelatorios();
}

function inicializarGraficosRelatorios() {

    const vendasCtx = document.getElementById('vendasChart');
    if (vendasCtx) {
        if (charts.vendas) charts.vendas.destroy();
        
        charts.vendas = new Chart(vendasCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                    label: 'Vendas (R$)',
                    data: [1200, 1900, 1500, 2200, 1800, 2500, 3000, 2800, 3200, 2900, 3500, 4000],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

}

function gerarRelatorioVendas() {
    const periodo = document.getElementById('periodoVendas').value;
    alert(`Relatório de vendas gerado para os últimos ${periodo} dias!`);
    // Aqui você implementaria a geração real do PDF
}

function gerarRelatorioEstoque() {
    alert('Relatório de estoque gerado com sucesso!');
    // Aqui você implementaria a geração real do PDF
}

function gerarRelatorioFinanceiro() {
    const mes = document.getElementById('mesFinanceiro').value;
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    alert(`Relatório financeiro gerado para ${meses[mes-1]}!`);
    // Aqui você implementaria a geração real do PDF
}

// ======================== //
// FUNÇÕES DE CONFIGURAÇÕES //
// ======================== //

function carregarConfiguracoes() {
    // Carregar configurações salvas
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes')) || {};
    
    if (elements.notificacoesEmail) {
        elements.notificacoesEmail.checked = configuracoes.notificacoesEmail !== false;
    }
    
    if (elements.modoEscuro) {
        elements.modoEscuro.checked = configuracoes.modoEscuro || false;
    }
    
    if (elements.configItensPagina) {
        elements.configItensPagina.value = configuracoes.itensPorPagina || itensPorPagina;
    }
    
    // Atualizar informações do sistema
    if (elements.dataAtualizacao) {
        elements.dataAtualizacao.textContent = new Date().toLocaleDateString('pt-BR');
    }
    
    if (elements.infoTotalProdutos) {
        elements.infoTotalProdutos.textContent = produtos.length;
    }
}

function salvarConfiguracoesUsuario() {
    const configuracoes = {
        notificacoesEmail: elements.notificacoesEmail.checked,
        modoEscuro: elements.modoEscuro.checked,
        itensPorPagina: parseInt(elements.configItensPagina.value)
    };
    
    localStorage.setItem('configuracoes', JSON.stringify(configuracoes));
    
    // Aplicar configurações
    itensPorPagina = configuracoes.itensPorPagina;
    if (elements.selectItensPagina) {
        elements.selectItensPagina.value = itensPorPagina;
    }
    
    // Aplicar modo escuro se necessário
    if (configuracoes.modoEscuro) {
        document.body.classList.add('modo-escuro');
    } else {
        document.body.classList.remove('modo-escuro');
    }
    
    alert('Configurações salvas com sucesso!');
    renderizarTabela();
    renderizarPaginacao();
}

async function exportarDados() {
    try {
        const response = await fetch(`${API_BASE_URL}/estoque/download`);
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'estoque.json';
            a.click();
            URL.revokeObjectURL(url);
            alert('Dados exportados com sucesso!');
        } else {
            throw new Error('Erro ao exportar dados');
        }
    } catch (error) {
        alert('Erro ao exportar dados: ' + error.message);
    }
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                if (dados.produtos && Array.isArray(dados.produtos)) {
                    if (confirm('Deseja importar os dados? Isso substituirá os dados atuais.')) {
                        // Enviar cada produto para a API
                        for (const produto of dados.produtos) {
                            await adicionarProdutoAPI(produto);
                        }
                        alert('Dados importados com sucesso!');
                        await carregarDadosIniciais();
                    }
                } else {
                    alert('Arquivo inválido!');
                }
            } catch (error) {
                alert('Erro ao importar dados: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

async function limparDados() {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema. Isso não pode ser desfeito. Deseja continuar?')) {
        if (confirm('TEM CERTEZA? Todos os produtos e configurações serão perdidos.')) {
            try {
                // Excluir todos os produtos via API
                for (const produto of produtos) {
                    await excluirProdutoAPI(produto.id);
                }
                localStorage.clear();
                alert('Todos os dados foram removidos. A página será recarregada.');
                location.reload();
            } catch (error) {
                alert('Erro ao limpar dados: ' + error.message);
            }
        }
    }
}

// ======================== //
// FUNÇÕES DE PERFIL //
// ======================== //

function abrirModalPerfil() {
    // Carregar dados atuais do usuário
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {
        nome: 'Fulana',
        email: '',
        foto: 'img/do-utilizador.png'
    };
    
    elements.nomeInput.value = usuario.nome;
    elements.emailInput.value = usuario.email || '';
    elements.previewFoto.src = usuario.foto;
    
    if (elements.userDropdown) {
        elements.userDropdown.style.display = 'none';
    }
    elements.modalProfile.style.display = 'block';
}

function salvarPerfil(e) {
    e.preventDefault();
    
    const usuario = {
        nome: elements.nomeInput.value.trim(),
        email: elements.emailInput.value.trim(),
        foto: elements.previewFoto.src
    };
    
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    // Atualizar header
    document.getElementById('userName').textContent = usuario.nome;
    document.getElementById('userPhoto').src = usuario.foto;
    
    elements.modalProfile.style.display = 'none';
    alert('Perfil atualizado com sucesso!');
}

function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        // Aqui você pode adicionar lógica de logout
        alert('Logout realizado com sucesso!');
        // Redirecionar para página de login se necessário
        window.location.href = 'login.html';
    }
}

// FUNÇÕES DE FILTRO E PAGINAÇÃO //


function filtrarProdutos() {
    const termo = elements.campoPesquisa.value.toLowerCase();
    produtosFiltrados = produtos.filter(p => 
        p.nome.toLowerCase().includes(termo) ||
        (p.categoria && p.categoria.toLowerCase().includes(termo))
    );
    paginaAtual = 1;
}

function renderizarPaginacao() {
    if (!elements.paginacao) return;
    
    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
    elements.paginacao.innerHTML = '';

    if (totalPaginas <= 1) return;

    // Botão anterior
    if (paginaAtual > 1) {
        const btnPrev = document.createElement('button');
        btnPrev.innerHTML = '<i class="fas fa-chevron-left"></i>';
        btnPrev.classList.add('btn-pagina');
        btnPrev.addEventListener('click', () => {
            paginaAtual--;
            renderizarTabela();
            renderizarPaginacao();
        });
        elements.paginacao.appendChild(btnPrev);
    }

    // Botões de página
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaAtual - 1 && i <= paginaAtual + 1)) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.classList.add('btn-pagina');
            if (i === paginaAtual) btn.classList.add('ativo');
            
            btn.addEventListener('click', () => {
                paginaAtual = i;
                renderizarTabela();
                renderizarPaginacao();
            });
            
            elements.paginacao.appendChild(btn);
        } else if (i === paginaAtual - 2 || i === paginaAtual + 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.classList.add('pagination-ellipsis');
            elements.paginacao.appendChild(ellipsis);
        }
    }

    // Botão próximo
    if (paginaAtual < totalPaginas) {
        const btnNext = document.createElement('button');
        btnNext.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnNext.classList.add('btn-pagina');
        btnNext.addEventListener('click', () => {
            paginaAtual++;
            renderizarTabela();
            renderizarPaginacao();
        });
        elements.paginacao.appendChild(btnNext);
    }
}

// ======================== //
// RENDERIZAÇÃO DA TABELA //
// ======================== //

function renderizarTabela() {
    if (!elements.tabelaBody) return;
    
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const produtosPagina = produtosFiltrados.slice(inicio, fim);
    
    elements.tabelaBody.innerHTML = '';

    if (produtosPagina.length === 0) {
        elements.tabelaBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #6c757d; margin-bottom: 1rem;"></i>
                    <br>
                    Nenhum produto encontrado
                </td>
            </tr>
        `;
        return;
    }

    produtosPagina.forEach(produto => {
        const tr = document.createElement('tr');
        
        let status, statusClass;
        if (produto.quantidade === 0) {
            status = 'Esgotado';
            statusClass = 'status-esgotado';
        } else if (produto.quantidade < 5) {
            status = 'Baixo';
            statusClass = 'status-baixo';
        } else if (produto.quantidade < 10) {
            status = 'Atenção';
            statusClass = 'status-atencao';
        } else {
            status = 'Normal';
            statusClass = 'status-normal';
        }
        
        tr.innerHTML = `
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>
                <button class="btn-edit" onclick="abrirModalEdicao(${produto.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="removerProduto(${produto.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        elements.tabelaBody.appendChild(tr);
    });
}


// ATUALIZAÇÃO DE ESTATÍSTICAS //


async function atualizarEstatisticas() {
    try {
        const estatisticas = await carregarEstatisticasAPI();
        
        // Total de produtos
        if (elements.totalProdutos) {
            elements.totalProdutos.textContent = estatisticas.totalProdutos;
        }
        
        // Produtos com estoque baixo
        if (elements.totalEstoqueBaixo) {
            elements.totalEstoqueBaixo.textContent = estatisticas.produtosEstoqueBaixo;
        }
        
        // Calcular totais baseados nas estatísticas
        const totalVendido = estatisticas.totalValorEstoque * 0.3; // Simula 30% de vendas
        const totalLucrado = totalVendido * 0.4; // Simula 40% de lucro
        
        if (elements.totalVendido) {
            elements.totalVendido.textContent = `R$ ${totalVendido.toFixed(2)}`;
        }
        
        if (elements.totalLucrado) {
            elements.totalLucrado.textContent = `R$ ${totalLucrado.toFixed(2)}`;
        }
        
        if (elements.infoTotalProdutos) {
            elements.infoTotalProdutos.textContent = estatisticas.totalProdutos;
        }
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Fallback para cálculo local
        const totalProdutos = produtos.length;
        const estoqueBaixo = produtos.filter(p => p.quantidade < 10).length;
        
        if (elements.totalProdutos) {
            elements.totalProdutos.textContent = totalProdutos;
        }
        
        if (elements.totalEstoqueBaixo) {
            elements.totalEstoqueBaixo.textContent = estoqueBaixo;
        }
        
        if (elements.infoTotalProdutos) {
            elements.infoTotalProdutos.textContent = totalProdutos;
        }
    }
}


// INICIALIZAÇÃO //

async function carregarDadosIniciais() {
    try {
        console.log(' Conectando com a API...');
        produtos = await carregarProdutosAPI();
        produtosFiltrados = [...produtos];
        await atualizarEstatisticas();
        renderizarTabela();
        renderizarPaginacao();
        renderizarDestaques();
        console.log(' Dados carregados com sucesso');
    } catch (error) {
        console.error(' Erro ao carregar dados:', error);
        alert('Erro ao conectar com o servidor. Verifique se a API está rodando.');
    }
}

function inicializar() {
    console.log('Inicializando aplicação...');
    inicializarEventListeners();
    carregarDadosIniciais();
    carregarConfiguracoes();
    
    // Inicializar perfil do usuário
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        document.getElementById('userName').textContent = usuario.nome;
        document.getElementById('userPhoto').src = usuario.foto;
    }
    
    console.log('Aplicação inicializada com sucesso!');
}

// Iniciar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializar);