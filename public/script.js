const API_URL = 'http://localhost:3000/api/alunos';

const form = document.getElementById('aluno-form');
const tbody = document.getElementById('alunos-tbody');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');

const inputId = document.getElementById('aluno-id');
const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const inputCPF = document.getElementById('cpf');
const inputTelefone = document.getElementById('telefone');
const inputCurso = document.getElementById('curso');


// Estado local
let editandoId = null;


// ========================================
// 1. LER - BUSCAR ALUNOS
// ========================================

async function carregarAluno() {
    try {
        const resposta = await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const alunos = await resposta.json();

        console.log("Alunos recebidos do servidor:", alunos);

        if (!Array.isArray(alunos)) {
            throw new Error("O servidor não retornou uma lista de alunos.");
        }

        tbody.innerHTML = "";

        if (alunos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;">
                        Nenhum aluno cadastrado.
                    </td>
                </tr>
            `;
            return;
        }

        alunos.forEach(aluno => {
            const tr = document.createElement("tr");

            const valores = [
                aluno.id,
                aluno.nome,
                aluno.email,
                aluno.cpf,
                aluno.telefone,
                aluno.curso
            ];

            valores.forEach(valor => {
                const td = document.createElement("td");
                td.textContent = valor ?? "";
                tr.appendChild(td);
            });

            const tdAcoes = document.createElement("td");
            tdAcoes.className = "actions";

            const btnEditar = document.createElement("button");
            btnEditar.textContent = "Editar";
            btnEditar.className = "btn-icon btn-edit";
            btnEditar.addEventListener("click", () => iniciarEdicao(aluno.id));

            const btnExcluir = document.createElement("button");
            btnExcluir.textContent = "Excluir";
            btnExcluir.className = "btn-icon btn-delete";
            btnExcluir.addEventListener("click", () => deletarAluno(aluno.id));

            tdAcoes.append(btnEditar, btnExcluir);
            tr.appendChild(tdAcoes);

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar alunos:", erro);
        alert("Não foi possível carregar os alunos: " + erro.message);
    }
}


// ========================================
// 2. CRIAR OU ATUALIZAR
// ========================================

form.addEventListener('submit', async (e) => {

    e.preventDefault();

    const aluno = {
        nome: inputNome.value.trim(),
        email: inputEmail.value.trim(),
        cpf: inputCPF.value.trim(),
        telefone: inputTelefone.value.trim(),
        curso: inputCurso.value.trim(),
    };

    if (!aluno.nome || !aluno.email || !aluno.cpf || !aluno.telefone || !aluno.curso) {
        alert('Preencha todos os campos!');
        return;
        //return res.status(400).json({ erro: 'preencha todos os campos' });
        //const novoAluno = { id: nextId, nome, email, cpf, telefone, curso};
    }

    try {

        let resposta;

        // =================================
        // ATUALIZAR
        // =================================

        if (editandoId) {

            resposta = await fetch(
                `${API_URL}/${editandoId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(aluno)
                }
            );

        }

        // =================================
        // CRIAR
        // =================================

        else {

            resposta = await fetch(
                API_URL,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(aluno)
                }
            );
        }

        // Verifica se o servidor respondeu com erro
        if (!resposta.ok) {

            const erro = await resposta.json();

            throw new Error(
                erro.erro || 'Erro ao salvar aluno'
            );
        }

        const alunoSalvo = await resposta.json();

        console.log('Aluno salvo:', alunoSalvo);

        alert(
            editandoId
                ? 'Aluno atualizado com sucesso!'
                : 'Aluno cadastrado com sucesso!'
        );

        editandoId = null;

        resetarFormulario();

        await carregarAluno();

    } catch (erro) {

        console.error('Erro ao salvar:', erro);

        alert(
            'Erro ao salvar os dados no servidor!\n\n' +
            erro.message
        );
    }
});


// ========================================
// 3. INICIAR EDIÇÃO
// ========================================

async function iniciarEdicao(id) {

    try {

        const resposta = await fetch(`${API_URL}/${id}`);

        /*
        O backend não possui uma rota GET /api/alunos/:id.
        Então buscamos todos os alunos e encontramos pelo ID.
        */

        const respostaTodos = await fetch(API_URL);

        if (!respostaTodos.ok) {
            throw new Error('Erro ao buscar aluno');
        }

        const alunos = await respostaTodos.json();

        const aluno = alunos.find(
            aluno => aluno.id === id
        );

        if (!aluno) {
            alert('Aluno não encontrado!');
            return;
        }

        editandoId = aluno.id;

        inputId.value = aluno.id;
        inputNome.value = aluno.nome;
        inputEmail.value = aluno.email;
        inputCPF.value = aluno.cpf;
        inputTelefone.value = aluno.telefone;
        inputCurso.value = aluno.curso;

        btnSave.textContent = 'Atualizar Aluno';

        btnCancel.style.display = 'inline-block';

        inputNome.focus();

    } catch (erro) {

        console.error('Erro ao iniciar edição:', erro);

        alert('Erro ao carregar aluno para edição!');
    }
}


// ========================================
// 4. EXCLUIR ALUNO
// ========================================

async function deletarAluno(id) {

    const confirmar = confirm(
        'Tem certeza que deseja excluir este aluno?'
    );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `${API_URL}/${id}`,
            {
                method: 'DELETE'
            }
        );

        if (!resposta.ok) {

            const erro = await resposta.json();

            throw new Error(
                erro.erro || 'Erro ao excluir aluno'
            );
        }

        alert('Aluno excluído com sucesso!');

        await carregarAluno();

    } catch (erro) {

        console.error('Erro ao excluir:', erro);

        alert(
            'Erro ao excluir o aluno!\n\n' +
            erro.message
        );
    }
}


// ========================================
// 5. RESETAR FORMULÁRIO
// ========================================

function resetarFormulario() {

    form.reset();

    inputId.value = '';

    editandoId = null;

    btnSave.textContent = 'Salvar Aluno';

    btnCancel.style.display = 'none';
}


// ========================================
// 6. CANCELAR EDIÇÃO
// ========================================

btnCancel.addEventListener('click', () => {

    resetarFormulario();

});


// ========================================
// 7. CARREGAR ALUNOS AO ABRIR A PÁGINA
// ========================================

carregarAluno();