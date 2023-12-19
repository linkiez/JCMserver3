CREATE
OR REPLACE VIEW orcamento_view AS
SELECT
    o."createdAt",
    o."updatedAt",
    o."deletedAt",
    o.desconto,
    o.frete,
    o.imposto,
    o.prazo_emdias,
    o."status",
    o.total,
    p.nome AS cliente,
    p_e.nome AS "empresa",
    v_p.nome AS "vendedor"
FROM
    orcamento o
    LEFT JOIN pessoa p ON o.id_pessoa = p.id
    LEFT JOIN empresa e ON o.id_empresa = e.id
    LEFT JOIN pessoa p_e ON e.id_pessoa = p_e.id
    LEFT JOIN vendedor v ON o.id_vendedor = v.id
    LEFT JOIN pessoa v_p ON v.id_pessoa = v_p.id;
