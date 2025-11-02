const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'estoque.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Variáveis globais
let produtos = [];
let nextId = 1;

// Carregar dados do arquivo JSON
async function carregarDados() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const jsonData = JSON.parse(data);
        produtos = jsonData.produtos || [];
        nextId = jsonData.nextId || (produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1);
        console.log('📂 Dados carregados do arquivo estoque.json');
        console.log(`📊 ${produtos.length} produtos carregados`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Arquivo não existe, criar estrutura inicial
            console.log('📝 Arquivo estoque.json não encontrado. Criando novo...');
            produtos = [
                { 
                    id: 1, 
                    nome: "Notebook Dell", 
                    quantidade: 10, 
                    preco: 2500.00, 
                    categoria: "Eletrônicos",
                    dataCriacao: new Date().toISOString(),
                    dataModificacao: new Date().toISOString()
                },
                { 
                    id: 2, 
                    nome: "Mouse Logitech", 
                    quantidade: 5, 
                    preco: 89.90, 
                    categoria: "Periféricos",
                    dataCriacao: new Date().toISOString(),
                    dataModificacao: new Date().toISOString()
                },
                { 
                    id: 3, 
                    nome: "Teclado Mecânico", 
                    quantidade: 20, 
                    preco: 299.00, 
                    categoria: "Periféricos",
                    dataCriacao: new Date().toISOString(),
                    dataModificacao: new Date().toISOString()
                },
                { 
                    id: 4, 
                    nome: 'Monitor 24"', 
                    quantidade: 8, 
                    preco: 899.00, 
                    categoria: "Eletrônicos",
                    dataCriacao: new Date().toISOString(),
                    dataModificacao: new Date().toISOString()
                }
            ];
            nextId = 5;
            await salvarDados();
        } else {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }
}

// Salvar dados no arquivo JSON
async function salvarDados() {
    try {
        const data = {
            produtos,
            nextId,
            dataAtualizacao: new Date().toISOString(),
            totalProdutos: produtos.length,
            valorTotalEstoque: produtos.reduce((total, p) => total + (p.quantidade * p.preco), 0)
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('💾 Dados salvos em estoque.json');
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        throw error;
    }
}

// Função auxiliar para validar produto
function validarProduto(produto) {
    if (!produto.nome || typeof produto.nome !== 'string' || produto.nome.trim().length === 0) {
        return { erro: 'Nome é obrigatório' };
    }
    if (produto.quantidade === undefined || produto.quantidade === null || isNaN(parseInt(produto.quantidade)) || parseInt(produto.quantidade) < 0) {
        return { erro: 'Quantidade deve ser um número maior ou igual a 0' };
    }
    if (produto.preco === undefined || produto.preco === null || isNaN(parseFloat(produto.preco)) || parseFloat(produto.preco) <= 0) {
        return { erro: 'Preço deve ser um número maior que 0' };
    }
    return null;
}

// ======================== //
// ROTAS DA API - CRUD COMPLETO //
// ======================== //

// GET: Listar todos os produtos
app.get('/api/produtos', (req, res) => {
    console.log('📥 GET /api/produtos - Listando todos os produtos');
    res.json(produtos);
});

// GET: Obter produto por ID
app.get('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`📥 GET /api/produtos/${id} - Buscando produto`);
    
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        console.log('❌ Produto não encontrado');
        return res.status(404).json({ erro: 'Produto não encontrado' });
    }

    console.log('✅ Produto encontrado:', produto.nome);
    res.json(produto);
});

// POST: Adicionar novo produto
app.post('/api/produtos', async (req, res) => {
    console.log('📤 POST /api/produtos - Adicionando novo produto');
    console.log('Dados recebidos:', req.body);
    
    try {
        const validacao = validarProduto(req.body);
        if (validacao) {
            console.log('❌ Validação falhou:', validacao.erro);
            return res.status(400).json({ erro: validacao.erro });
        }

        const novoProduto = {
            id: nextId++,
            nome: req.body.nome.trim(),
            quantidade: parseInt(req.body.quantidade),
            preco: parseFloat(req.body.preco),
            categoria: req.body.categoria || 'Geral',
            dataCriacao: new Date().toISOString(),
            dataModificacao: new Date().toISOString()
        };

        console.log('➕ Novo produto:', novoProduto);
        produtos.push(novoProduto);
        
        await salvarDados();
        
        console.log('✅ Produto adicionado com sucesso');
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('❌ Erro ao adicionar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// PUT: Atualizar produto por ID
app.put('/api/produtos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`✏️ PUT /api/produtos/${id} - Atualizando produto`);
    console.log('Dados recebidos:', req.body);
    
    try {
        const produtoIndex = produtos.findIndex(p => p.id === id);

        if (produtoIndex === -1) {
            console.log('❌ Produto não encontrado');
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        const validacao = validarProduto(req.body);
        if (validacao) {
            console.log('❌ Validação falhou:', validacao.erro);
            return res.status(400).json({ erro: validacao.erro });
        }

        const produtoAtualizado = {
            ...produtos[produtoIndex],
            nome: req.body.nome.trim(),
            quantidade: parseInt(req.body.quantidade),
            preco: parseFloat(req.body.preco),
            categoria: req.body.categoria || produtos[produtoIndex].categoria,
            dataModificacao: new Date().toISOString()
        };

        produtos[produtoIndex] = produtoAtualizado;
        await salvarDados();

        console.log('✅ Produto atualizado com sucesso:', produtoAtualizado.nome);
        res.json(produtoAtualizado);
    } catch (error) {
        console.error('❌ Erro ao atualizar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// DELETE: Deletar produto por ID
app.delete('/api/produtos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    console.log(`🗑️ DELETE /api/produtos/${id} - Excluindo produto`);
    
    try {
        const produtoIndex = produtos.findIndex(p => p.id === id);

        if (produtoIndex === -1) {
            console.log('❌ Produto não encontrado');
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }

        const produtoDeletado = produtos.splice(produtoIndex, 1)[0];
        await salvarDados();
        
        console.log('✅ Produto excluído com sucesso:', produtoDeletado.nome);
        res.json({ 
            mensagem: 'Produto deletado com sucesso', 
            produto: produtoDeletado 
        });
    } catch (error) {
        console.error('❌ Erro ao deletar produto:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// GET: Estatísticas do estoque
app.get('/api/estoque/estatisticas', (req, res) => {
    console.log('📊 GET /api/estoque/estatisticas - Gerando estatísticas');
    
    const totalProdutos = produtos.length;
    const totalValorEstoque = produtos.reduce((total, p) => total + (p.quantidade * p.preco), 0);
    const produtosEstoqueBaixo = produtos.filter(p => p.quantidade <= 5).length;
    const produtosEsgotados = produtos.filter(p => p.quantidade === 0).length;

    const estatisticas = {
        totalProdutos,
        totalValorEstoque: parseFloat(totalValorEstoque.toFixed(2)),
        produtosEstoqueBaixo,
        produtosEsgotados,
        dataConsulta: new Date().toISOString()
    };

    console.log('📈 Estatísticas:', estatisticas);
    res.json(estatisticas);
});

// Servir o HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Servir outras páginas
app.get('/produtos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'produtos.html'));
});

app.get('/relatorios', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'relatorios.html'));
});

// Download do arquivo estoque.json
app.get('/api/estoque/download', (req, res) => {
    console.log('📥 GET /api/estoque/download - Download do arquivo');
    res.download(DATA_FILE, 'estoque.json', (err) => {
        if (err) {
            console.error('❌ Erro ao fazer download:', err);
            res.status(500).json({ erro: 'Erro ao fazer download do arquivo' });
        }
    });
});

// Rota de saúde da API
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        totalProdutos: produtos.length,
        versao: '1.0.0'
    });
});

// Tratamento de erro 404 para rotas não encontradas
app.use((req, res) => {
    console.log('❌ Rota não encontrada:', req.url);
    res.status(404).json({ erro: 'Rota não encontrada' });
});

// Middleware de tratamento de erro global
app.use((error, req, res, next) => {
    console.error('❌ Erro não tratado:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
});

// ✅ SERVIDOR ROBUSTO COM TRATAMENTO DE ERRO DE PORTA
async function startServer(port) {
    try {
        // Carregar dados antes de iniciar o servidor
        await carregarDados();
        
        const server = app.listen(port, () => {
            console.log(`\n🚀 Servidor rodando em http://localhost:${port}`);
            console.log(`📊 API disponível em http://localhost:${port}/api/produtos`);
            console.log(`🩺 Health check: http://localhost:${port}/api/health`);
            console.log(`📁 Dados armazenados em: ${DATA_FILE}`);
            console.log(`🛍️  ${produtos.length} produtos carregados`);
            console.log(`💾 Próximo ID: ${nextId}`);
            console.log('=========================================\n');
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(` Porta ${port} ocupada. Tentando porta ${port + 1}...`);
                startServer(port + 1);
            } else {
                console.error(' Erro no servidor:', err);
            }
        });

        return server;
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Iniciar servidor
console.log('🔄 Iniciando servidor e carregando dados...');
startServer(PORT);

// Para parar o servidor graciosamente (Ctrl+C)
process.on('SIGINT', async () => {
    console.log('\n Salvando dados antes de encerrar...');
    try {
        await salvarDados();
        console.log(' Dados salvos com sucesso');
    } catch (error) {
        console.error(' Erro ao salvar dados:', error);
    }
    console.log(' Servidor encerrado.');
    process.exit(0);
});