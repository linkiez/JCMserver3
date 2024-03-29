CREATE
OR REPLACE VIEW ordem_producao_view AS
SELECT
    op.data_prazo,
    op.data_finalizacao,
    op.data_entregue,
    op.data_negociado,
    op.dias_de_producao,
    op.status,
    op."createdAt",
    op."updatedAt",
    op.id_orcamento,
    o.prazo_emdias,
    o.total,
    oi.total_peso,
    oi.total_hora,
    v_p.nome AS "vendedor",
    o_p.nome AS "cliente",
    op.id,
    opi.pecas
FROM
    ordem_producao op
    LEFT JOIN orcamento o ON op.id_orcamento = o.id
    LEFT JOIN (
        SELECT
            id_orcamento,
            SUM(total_peso) AS total_peso,
            SUM(total_hora) AS total_hora
        FROM
            orcamento_item
        WHERE
            "deletedAt" IS Null
        GROUP BY
            id_orcamento
    ) oi ON oi.id_orcamento = o.id
    LEFT JOIN vendedor v ON op.id_vendedor = v.id
    LEFT JOIN pessoa v_p ON v.id_pessoa = v_p.id
    LEFT JOIN pessoa o_p ON o.id_pessoa = o_p.id
    LEFT JOIN (
        SELECT
            id_ordem_producao,
            SUM(quantidade) AS pecas
        FROM
            ordem_producao_item
        GROUP BY
            id_ordem_producao
    ) opi ON opi.id_ordem_producao = op.id;
