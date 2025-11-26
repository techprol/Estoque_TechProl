import express from 'express';
import { openDb } from '../db.js';


const router = express.Router();


// registrar entrada/saida
router.post('/', async (req, res) => {
    try {
        const { codigo_barras, tipo, quantidade, realizado_por, observacao } = req.body;
        if (!codigo_barras || !tipo || !quantidade) return res.status(400).json({ error: 'dados faltando' });


        const db = await openDb();
        const item = await db.get(`SELECT * FROM items WHERE codigo_barras = ?`, codigo_barras);
        if (!item) return res.status(404).json({ error: 'item não encontrado' });


        if (tipo === 'entrada') {
            await db.run(
                `UPDATE items SET quantidade_atual = quantidade_atual + ? WHERE codigo_barras = ?`,
                [quantidade, codigo_barras]
            );
        }

        if (tipo === 'saida' && item.quantidade_atual < quantidade) return res.status(400).json({ error: 'quantidade insuficiente' });


        const newQty = tipo === 'entrada' ? item.quantidade_atual + quantidade : item.quantidade_atual - quantidade;


        await db.run(`UPDATE items SET quantidade_atual = ? WHERE id = ?`, [newQty, item.id]);


        await db.run(`INSERT INTO movements (item_id, tipo, quantidade, realizado_por, data_hora, observacao) VALUES (?, ?, ?, ?, datetime('now'), ?)`, [item.id, tipo, quantidade, realizado_por || 'desconhecido', observacao || '']);


        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro interno' });
    }
});






// listar movimentos
router.get('/', async (req, res) => {
    const db = await openDb();
    const rows = await db.all(
        `SELECT m.id, m.tipo, m.quantidade, m.realizado_por, m.data_hora, m.observacao, i.nome as item_nome, i.codigo_barras
FROM movements m
JOIN items i ON i.id = m.item_id
ORDER BY m.data_hora DESC`
    );
    res.json(rows);
});


export default router;