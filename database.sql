-- 1. CRIAÇÃO DO BANCO DE DADOS
-- O nome do banco de dados deve ser 'materiais_didaticos' conforme seu arquivo server.js
CREATE DATABASE IF NOT EXISTS materiais_didaticos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados para a criação das tabelas
USE materiais_didaticos;

-- 2. CRIAÇÃO DA TABELA DE USUÁRIOS (Para instrutores, coordenadores e administradores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- Para armazenar a senha de forma segura (Hash)
    papel ENUM('instrutor', 'coordenador', 'administrador') NOT NULL, -- Papéis definidos
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CRIAÇÃO DA TABELA DE MATERIAIS
-- Esta tabela armazena os metadados dos materiais e o status de validação.
CREATE TABLE materiais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Dados de Upload
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) COMMENT 'Ex: Plano de Curso, Situacao de Aprendizagem, Recurso Digital',
    caminho_arquivo VARCHAR(255) NOT NULL COMMENT 'Caminho para o arquivo no servidor/storage',
    instrutor_id INT, -- Quem fez o upload
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Metadados para Busca e Organização (Requisito)
    competencia VARCHAR(100), -- Permite filtragem por competência
    unidade_curricular VARCHAR(100), -- Permite filtragem por unidade curricular
    area VARCHAR(100) NOT NULL, -- Ex: TI, Gestão, Indústria (Permite filtragem por área)

    -- Status de Validação (Requisito: pendente, aprovado, reprovado)
    status_validacao ENUM('pendente', 'aprovado', 'reprovado') NOT NULL DEFAULT 'pendente',
    
    -- Chave Estrangeira
    FOREIGN KEY (instrutor_id) REFERENCES usuarios(id)
);

-- 4. CRIAÇÃO DA TABELA DE VALIDAÇÕES
-- Esta tabela registra o histórico de validações de um material (quem validou e quando).
CREATE TABLE validacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    coordenador_id INT NOT NULL,
    status ENUM('aprovado', 'reprovado') NOT NULL,
    observacoes TEXT,
    data_validacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Chaves Estrangeiras
    FOREIGN KEY (material_id) REFERENCES materiais(id),
    FOREIGN KEY (coordenador_id) REFERENCES usuarios(id)
);

-- 5. DADOS INICIAIS (OPCIONAL, mas útil para testes)

-- Cria um usuário coordenador (ID = 1, usado na sua rota PUT)
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES 
('Coordenador Teste', 'coordenador@exemplo.com', 'hash_simulado_coordenador', 'coordenador'),
('Instrutor Teste', 'instrutor@exemplo.com', 'hash_simulado_instrutor', 'instrutor');

-- Insere alguns dados de teste na tabela de materiais (usando o instrutor ID 2)
INSERT INTO materiais (titulo, tipo, caminho_arquivo, instrutor_id, competencia, unidade_curricular, area, status_validacao) VALUES 
('Plano de Curso AWS Básico', 'Plano de Curso', '/uploads/aws_basico.pdf', 2, 'Cloud Computing', 'Infraestrutura', 'TI', 'aprovado'),
('Situação de Aprendizagem JS', 'Situacao de Aprendizagem', '/uploads/sa_js.docx', 2, 'Desenvolvimento Web', 'Front-end', 'TI', 'pendente'),
('Ebook Gestão de Projetos', 'Recurso Digital', '/uploads/ebook_pm.pdf', 2, 'Metodologias Ágeis', 'Gerenciamento', 'Gestão', 'reprovado');