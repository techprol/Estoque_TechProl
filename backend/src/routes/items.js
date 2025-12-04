import express from 'express';
import { openDb } from '../db.js';
import { generateBarcodePngBase64 } from '../utils/barcode.js';

const router = express.Router();

// Criar item
router.post('/', async (req, res) => {
    try {
        const { nome, categoria, descricao, quantidade, local, caracteristicas, quantidade_minima } = req.body;

        if (!nome || !categoria) {
            return res.status(400).json({ error: 'nome e categoria obrigatórios' });
        }

        const db = await openDb();

        const codigo = Date.now().toString();

        const insertQuery = `
            INSERT INTO items (
                codigo_barras, nome, categoria, descricao, quantidade_atual,
                local, caracteristicas, quantidade_minima, criado_em
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            RETURNING *;
        `;

        const values = [
            codigo,
            nome,
            categoria,
            descricao || '',
            quantidade || 0,
            local || '',
            caracteristicas || '',
            quantidade_minima || 0
        ];

        const result = await db.query(insertQuery, values);
        const item = result.rows[0];

        const img = await generateBarcodePngBase64(codigo);

        res.json({ item, codigo_barras_img: img });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro interno' });
    }
});

// atualizar quantidade mínima
router.put('/:id/min', async (req, res) => {
    try {
        const { quantidade_minima } = req.body;
        const db = await openDb();

        await db.query(`UPDATE items SET quantidade_minima = $1 WHERE id = $2`, [
            quantidade_minima,
            req.params.id
        ]);

        const updated = await db.query(`SELECT * FROM items WHERE id = $1`, [
            req.params.id
        ]);

        res.json(updated.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro ao atualizar quantidade mínima' });
    }
});

// listar itens
router.get('/', async (req, res) => {
    const db = await openDb();
    const result = await db.query(`SELECT * FROM items ORDER BY nome`);
    res.json(result.rows);
});

// buscar por código
router.get('/bycode/:code', async (req, res) => {
    const db = await openDb();
    const result = await db.query(
        `SELECT * FROM items WHERE codigo_barras = $1`,
        [req.params.code]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'item não encontrado' });
    }

    res.json(result.rows[0]);
});

export default router;
