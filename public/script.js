document.addEventListener('DOMContentLoaded', () => {
    // Carrega a lista de materiais assim que a página carregar (GET)
    carregarMateriais();
    
    // Listeners para os formulários
    document.getElementById('form-material').addEventListener('submit', cadastrarMaterial);
    document.getElementById('form-filtro').addEventListener('submit', buscarMateriais);
    document.getElementById('form-validacao').addEventListener('submit', validarMaterial);
});

// ------------------------------------
// 1. FUNÇÃO PARA CADASTRO (POST)
// ------------------------------------
async function cadastrarMaterial(e) {
    e.preventDefault();

    const form = e.target;
    const formData = {
        titulo: form.titulo.value,
        tipo: form.tipo.value,
        caminho_arquivo: form.caminho.value,
        competencia: form.competencia.value,
        area: form.area.value,
    };

    try {
        const response = await fetch('/api/materiais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.status === 201) {
            alert('Material cadastrado com sucesso e enviado para validação!');
            form.reset();
            carregarMateriais(); // Recarrega a lista
        } else {
            const errorData = await response.json();
            alert('Erro ao cadastrar material: ' + errorData.error);
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Não foi possível conectar ao servidor.');
    }
}

// ------------------------------------
// 2. FUNÇÃO PARA BUSCA E LISTAGEM (GET)
// ------------------------------------
function buscarMateriais(e) {
    e.preventDefault();
    // Chama a função principal de carregamento, mas com filtros
    carregarMateriais(true); 
}

async function carregarMateriais(isBusca = false) {
    let url = '/api/materiais';
    
    if (isBusca) {
        const competencia = document.getElementById('filtro-competencia').value;
        const area = document.getElementById('filtro-area').value;
        const status = document.getElementById('filtro-status').value;
        
        const params = new URLSearchParams();
        if (competencia) params.append('competencia', competencia);
        if (area) params.append('area', area);
        if (status) params.append('status', status);

        url += '?' + params.toString();
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Falha ao buscar dados.');

        const materiais = await response.json();
        renderizarTabela(materiais);

    } catch (error) {
        console.error('Erro ao carregar materiais:', error);
        document.querySelector('#tabela-materiais tbody').innerHTML = `<tr><td colspan="7">Erro ao carregar os dados.</td></tr>`;
    }
}

function renderizarTabela(materiais) {
    const tabelaBody = document.querySelector('#tabela-materiais tbody');
    tabelaBody.innerHTML = ''; // Limpa a tabela

    materiais.forEach(material => {
        const row = tabelaBody.insertRow();
        row.insertCell().textContent = material.id;
        row.insertCell().textContent = material.titulo;
        row.insertCell().textContent = material.tipo;
        row.insertCell().textContent = `${material.competencia || ''} / ${material.area || ''}`;
        
        // Célula de Status com cor
        const statusCell = row.insertCell();
        statusCell.textContent = material.status_validacao.toUpperCase();
        statusCell.className = `status-${material.status_validacao}`;
        
        row.insertCell().textContent = new Date(material.data_upload).toLocaleDateString();
        
        // Célula de Ação (Validação)
        const acaoCell = row.insertCell();
        const validarBtn = document.createElement('button');
        validarBtn.textContent = 'Validar';
        validarBtn.onclick = () => preencherValidacao(material.id); // Preenche o formulário de validação
        acaoCell.appendChild(validarBtn);
    });
}

// ------------------------------------
// 3. FUNÇÃO PARA VALIDAÇÃO (PUT)
// ------------------------------------
function preencherValidacao(id) {
    // Exibe a seção de validação e preenche o ID
    document.getElementById('secao-validacao').style.display = 'block';
    document.getElementById('validacao-id').value = id;
    document.getElementById('secao-validacao').scrollIntoView({ behavior: 'smooth' }); // Rola para o formulário
}

async function validarMaterial(e) {
    e.preventDefault();

    const form = e.target;
    const materialId = form['validacao-id'].value;
    
    // Dados para o PUT no Back-end
    const validacaoData = {
        novo_status: form['validacao-status'].value,
        observacoes: form['validacao-obs'].value,
        coordenador_id: 1 // ID Simulado, já que não temos login (conforme requisito)
    };

    try {
        const response = await fetch(`/api/validacao/${materialId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validacaoData)
        });

        if (response.ok) {
            alert('Validação registrada com sucesso!');
            form.reset();
            document.getElementById('secao-validacao').style.display = 'none'; // Esconde o formulário
            carregarMateriais();
        } else {
            const errorData = await response.json();
            alert('Erro ao validar: ' + (errorData.error || 'Erro desconhecido.'));
        }
    } catch (error) {
        console.error('Erro de conexão:', error);
        alert('Falha ao conectar com a API de validação.');
    }
}