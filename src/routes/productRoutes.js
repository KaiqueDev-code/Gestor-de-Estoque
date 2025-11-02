const express = require('express');
const router = express.Router();

let mockProducts = [
    { id: 1, nome: 'Notebook Gamer', quantidade: 15, preco: 7500.00 },
    { id: 2, nome: 'Mouse sem Fio', quantidade: 50, preco: 120.50 },
    { id: 3, nome: 'Teclado Mecânico', quantidade: 30, preco: 350.75 },
    { id: 4, nome: 'Monitor 27" 4K', quantidade: 20, preco: 2200.00 }
];
let nextProductId = 5;

router.get('/produtos', (req, res) => res.json(mockProducts));
router.post('/produtos', (req, res) => {
    const { nome, quantidade, preco } = req.body;
    const newProduct = {
        id: nextProductId++,
        nome,
        quantidade: parseInt(quantidade, 10),
        preco: parseFloat(preco)
    };
    mockProducts.push(newProduct);
    res.status(201).json(newProduct);
});
router.put('/produtos/:id', (req, res) => {
    const { nome, preco } = req.body;
    const id = parseInt(req.params.id, 10);
    const productIndex = mockProducts.findIndex(p => p.id === id);
    if (productIndex !== -1) {
        mockProducts[productIndex].nome = nome;
        mockProducts[productIndex].preco = parseFloat(preco);
        res.json(mockProducts[productIndex]);
    } else {
        res.status(404).json({ error: 'Produto não encontrado' });
    }
});
router.delete('/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const initialLength = mockProducts.length;
    mockProducts = mockProducts.filter(p => p.id !== id);
    if (mockProducts.length < initialLength) {
        res.json({ message: 'Produto excluído com sucesso!' });
    } else {
        res.status(404).json({ error: 'Produto não encontrado' });
    }
});
module.exports = router;
