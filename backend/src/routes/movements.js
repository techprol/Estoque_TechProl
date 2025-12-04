import express from 'express';
import { openDb } from '../db.js';

const router = express.Router();

// registrar entrada/saída
router.post('/', async (req, res) => {
    try {
        const { codigo_barras, tipo, quantidade, realizado_por, observacao } = req.body;
        if (!codigo_barras || !tipo || !quantidade)
            return res.status(400).json({ error: 'dados faltando' });

        const db = await openDb();

        // buscar item
        const itemRes = await db.query(
            `SELECT * FROM items WHERE codigo_barras = $1`,
            [codigo_barras]
        );

        if (itemRes.rows.length === 0)
            return res.status(404).json({ error: 'item não encontrado' });

        const item = itemRes.rows[0];

        // validar estoque
        if (tipo === 'saida' && item.quantidade_atual < quantidade)
            return res.status(400).json({ error: 'quantidade insuficiente' });

        const newQty =
            tipo === 'entrada'
                ? item.quantidade_atual + quantidade
                : item.quantidade_atual - quantidade;

        await db.query(
            `UPDATE items SET quantidade_atual = $1 WHERE id = $2`,
            [newQty, item.id]
        );

        await db.query(
            `INSERT INTO movements (item_id, tipo, quantidade, realizado_por, data_hora, observacao)
             VALUES ($1, $2, $3, $4, NOW(), $5)`,
            [item.id, tipo, quantidade, realizado_por || 'desconhecido', observacao || '']
        );

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro interno' });
    }
});

// listar movimentos
router.get('/', async (req, res) => {
    const db = await openDb();
    const result = await db.query(
        `SELECT m.id, m.tipo, m.quantidade, m.realizado_por, m.data_hora, m.observacao,
                i.nome AS item_nome, i.codigo_barras
         FROM movements m
         JOIN items i ON i.id = m.item_id
         ORDER BY m.data_hora DESC`
    );
    res.json(result.rows);
});

export default router;
