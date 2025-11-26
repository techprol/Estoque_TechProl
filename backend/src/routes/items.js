import express from 'express';
import { openDb } from '../db.js';
import { generateBarcodePngBase64 } from '../utils/barcode.js';


const router = express.Router();


// criar item
router.post('/', async (req, res) => {
    try {
        const { nome, categoria, descricao, quantidade, local, caracteristicas, quantidade_minima } = req.body;
        if (!nome || !categoria) return res.status(400).json({ error: 'nome e categoria obrigatórios' });


        const db = await openDb();


        const codigo = Date.now().toString();


        const result = await db.run(
            `INSERT INTO items (codigo_barras, nome, categoria, descricao, quantidade_atual, local, caracteristicas, quantidade_minima, criado_em)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [   codigo,
                nome,
                categoria,
                descricao || '',
                quantidade || 0,
                local || '',
                caracteristicas || '',
                quantidade_minima || 0
            ]
        );


        const img = await generateBarcodePngBase64(codigo);


        const item = await db.get(`SELECT * FROM items WHERE id = ?`, result.lastID);


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

        await db.run(
            `UPDATE items SET quantidade_minima = ? WHERE id = ?`,
            [quantidade_minima, req.params.id]
        );

        const item = await db.get(`SELECT * FROM items WHERE id = ?`, req.params.id);

        res.json(item);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'erro ao atualizar quantidade mínima' });
    }
});



// listar itens
router.get('/', async (req, res) => {
    const db = await openDb();
    const rows = await db.all(`SELECT * FROM items ORDER BY nome`);
    res.json(rows);
});


// buscar por codigo
router.get('/bycode/:code', async (req, res) => {
    const db = await openDb();
    const row = await db.get(`SELECT * FROM items WHERE codigo_barras = ?`, req.params.code);
    if (!row) return res.status(404).json({ error: 'item não encontrado' });
    res.json(row);
});


export default router;