CREATE TABLE tb_usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150)  NOT NULL,
  email VARCHAR(150)  NOT NULL UNIQUE,
  nome_usuario VARCHAR(150)  NOT NULL,
  imagem VARCHAR(150)  NOT NULL,
  senha VARCHAR(150)  NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
)

CREATE TABLE tb_atividade (
    id SERIAL PRIMARY KEY,
    tipo_atividade VARCHAR(20) NOT NULL CHECK (tipo IN ('corrida', 'trilha', 'caminhada')),
    distancia_percorrida INTEGER NOT NULL,
    duracao_atividade INTEGER NOT NULL,
    quantidade_calorias INTEGER NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id INTEGER NOT NULL REFERENCES tb_usuarios(id)
)

CREATE TABLE tb_curtida (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES tb_usuarios(id),
  atividade_id INTEGER NOT NULL REFERENCES tb_atividade(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (usuario_id, atividade_id)
)

CREATE TABLE tb_comentario (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES tb_usuarios(id),
  atividade_id INTEGER NOT NULL REFERENCES tb_atividade(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  texto VARCHAR(500) NOT NULL
)