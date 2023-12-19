CREATE INDEX IF NOT EXISTS idx_pessoa_nome ON pessoa (nome);

CREATE INDEX IF NOT EXISTS idx_pessoa_cnpj_cpf ON pessoa (cnpj_cpf);

CREATE INDEX IF NOT EXISTS idx_produto_nome ON produto (nome);

CREATE INDEX IF NOT EXISTS idx_contato ON contato (nome, valor);
