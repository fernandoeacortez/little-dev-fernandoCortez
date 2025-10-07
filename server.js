const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// 1. CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456', // Use sua senha (123456)
    database: 'materiais_didaticos' 
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        return;
    }
    console.log('Servidor conectado ao MySQL com sucesso!');
});

// 2. MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve os arquivos estáticos (CSS, JS, imagens) da pasta 'public'
app.use(express.static(path.join(__dirname, 'public'))); 

// 3. ROTA DE CORREÇÃO ('Cannot GET /')
app.get('/', (req, res) => {
    // CORREÇÃO: Usa sendFile para enviar o arquivo que está em 'public/index.html'
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. ROTAS (ENDPOINTS) DA API

// 4.1. Rota GET: Listar e Buscar Materiais
app.get('/api/materiais', (req, res) => {
    const { competencia, area, status } = req.query; 
    
    let sql = 'SELECT id, titulo, tipo, status_validacao, data_upload, competencia, unidade_curricular, area FROM materiais WHERE 1=1';
    let params = [];

    // Adiciona filtros dinamicamente
    if (competencia) {
        sql += ' AND competencia LIKE ?';
        params.push(`%${competencia}%`);
    }
    if (area) {
        sql += ' AND area LIKE ?';
        params.push(`%${area}%`);
    }
    if (status) {
        sql += ' AND status_validacao = ?';
        params.push(status);
    }

    sql += ' ORDER BY data_upload DESC'; 
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Erro ao buscar materiais:', err);
            return res.status(500).json({ error: 'Erro interno ao buscar materiais.' });
        }
        res.json(results);
    });
});

// 4.2. Rota POST: Cadastrar um novo material
app.post('/api/materiais', (req, res) => {
    const { titulo, tipo, caminho_arquivo, competencia, unidade_curricular, area } = req.body;
    
    const sql = 'INSERT INTO materiais (titulo, tipo, caminho_arquivo, competencia, unidade_curricular, area) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [titulo, tipo, caminho_arquivo, competencia || null, unidade_curricular || null, area || null];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar material:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar material no banco de dados.' });
        }
        res.status(201).json({ 
            message: 'Material cadastrado com sucesso!', 
            id: result.insertId 
        });
    });
});

// 4.3. Rota PUT: Validação por Coordenador
app.put('/api/validacao/:id', (req, res) => {
    const materialId = req.params.id;
    // coodenador_id = 1 é um ID SIMULADO
    const { novo_status, observacoes, coordenador_id = 1 } = req.body; 

    if (!['aprovado', 'reprovado'].includes(novo_status)) {
        return res.status(400).json({ error: 'Status de validação inválido.' });
    }

    // 1. Atualiza o status_validacao na tabela materiais
    const sqlUpdateMaterial = 'UPDATE materiais SET status_validacao = ? WHERE id = ?';
    db.query(sqlUpdateMaterial, [novo_status, materialId], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar status do material.' });

        // 2. Insere o registro na tabela validacoes
        const sqlInsertValidacao = 'INSERT INTO validacoes (material_id, coordenador_id, status, observacoes) VALUES (?, ?, ?, ?)';
        db.query(sqlInsertValidacao, [materialId, coordenador_id, novo_status, observacoes], (err, result) => {
            if (err) {
                 return res.status(500).json({ error: 'Status atualizado, mas falha ao registrar a validação.' });
            }
             res.json({ message: `Material ${novo_status} com sucesso!` });
        });
    });
});


// 5. INICIALIZAÇÃO DO SERVIDOR
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Acesse a aplicação em http://localhost:${port}`);
});