const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Função para ler o banco de dados
function lerBancoDados() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(
            DB_FILE,
            JSON.stringify({ alunos: [] }, null, 2)
        );
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

// Função para salvar o banco de dados
function salvarBancoDados(dados) {
    fs.writeFileSync(
        DB_FILE,
        JSON.stringify(dados, null, 2)
    );
}

// ===============================
// CREATE - CRIAR ALUNO
// ===============================

app.post('/api/alunos', (req, res) => {
    const { nome, email, cpf, telefone, curso } = req.body;

    if (!nome || !email || !cpf || !telefone || !curso) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios!'
        });
    }

    const db = lerBancoDados();

    const nextId = db.alunos.length > 0
        ? Math.max(...db.alunos.map(a => a.id)) + 1
        : 1;

    const novoAluno = {
        id: nextId,
        nome,
        email,
        cpf,
        telefone,
        curso
    };

    db.alunos.push(novoAluno);

    salvarBancoDados(db);

    res.status(201).json(novoAluno);
});

// ===============================
// READ - LISTAR ALUNOS
// ===============================

app.get('/api/alunos', (req, res) => {
    const db = lerBancoDados();

    res.json(db.alunos);
});

// ===============================
// UPDATE - ATUALIZAR ALUNO
// ===============================

app.put('/api/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const { nome, email, cpf, telefone, curso } = req.body;

    if (!nome || !email || !cpf || !telefone || !curso) {
        return res.status(400).json({
            erro: 'Todos os campos são obrigatórios!'
        });
    }

    const db = lerBancoDados();

    const index = db.alunos.findIndex(
        aluno => aluno.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            erro: 'Aluno não encontrado!'
        });
    }

    db.alunos[index] = {
        ...db.alunos[index],
        nome,
        email,
        cpf,
        telefone,
        curso
    };

    salvarBancoDados(db);

    res.json(db.alunos[index]);
});

// ===============================
// DELETE - EXCLUIR ALUNO
// ===============================

app.delete('/api/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const db = lerBancoDados();

    const index = db.alunos.findIndex(
        aluno => aluno.id === id
    );

    if (index === -1) {
        return res.status(404).json({
            erro: 'Aluno não encontrado!'
        });
    }

    db.alunos.splice(index, 1);

    salvarBancoDados(db);

    res.status(204).send();
});

// ===============================
// INICIAR SERVIDOR
// ===============================

app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 Servidor rodando!');
    console.log(`👉 http://localhost:${PORT}`);
    console.log('📁 Banco de dados: db.json');
    console.log('=================================');
});