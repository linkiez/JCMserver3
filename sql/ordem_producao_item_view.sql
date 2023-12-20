CREATE
OR REPLACE VIEW ordem_producao_item_view AS
SELECT
	p.nome AS cliente,
	pv.nome AS vendedor,
	oi.descricao,
	pr.nome AS produto,
	oi.material_incluido,
	oi.quantidade,
	oi.peso,
	oi.total_peso,
	oi.tempo,
	oi.total_hora,
	oi.total,
	oi.custo,
	oi.id_orcamento,
	op."status",
	op."createdAt",
	op."updatedAt",
	op.data_finalizacao,
	op.data_entregue,
	orc.desconto
FROM
	ordem_producao_item opi
	LEFT JOIN produto pr ON opi.id_produto = pr.id
	LEFT JOIN orcamento_item oi ON opi.id_orcamento_item = oi.id
	LEFT JOIN orcamento orc ON oi.id_orcamento = orc.id
	LEFT JOIN pessoa p ON orc.id_pessoa = p.id
	LEFT JOIN vendedor v ON orc.id_vendedor = v.id
	LEFT JOIN pessoa pv ON v.id_pessoa = pv.id
	LEFT JOIN ordem_producao op ON opi.id_ordem_producao = op.id;
