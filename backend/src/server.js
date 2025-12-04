import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { initDb } from './initDB.js';
import { openDb } from './db.js';

// Inicializa tabelas no PostgreSQL
await initDb();

import itemsRouter from './routes/items.js';
import movementsRouter from './routes/movements.js';

// corrigir dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Rotas principais
app.use('/items', itemsRouter);
app.use('/movements', movementsRouter);

app.get('/', (req, res) => res.json({ ok: true }));

// Middleware token
function checkDebugToken(req, res, next) {
    const provided = req.query.token || req.headers['x-debug-token'];
    const expected = process.env.DEBUG_TOKEN;

    if (!provided || provided !== expected)
        return res.status(403).json({ error: "Token inválido" });

    next();
}

// 🔍 Rota debug: listar banco
app.get('/debug/db', checkDebugToken, async (req, res) => {
    const db = await openDb();

    const items = await db.query("SELECT * FROM items ORDER BY nome");
    const movements = await db.query(`
        SELECT m.*, i.nome AS item_nome, i.codigo_barras
        FROM movements m
        LEFT JOIN items i ON i.id = m.item_id
        ORDER BY m.data_hora DESC
    `);

    res.json({
        ok: true,
        items: items.rows,
        movements: movements.rows
    });
});

// 🧼 Reset do banco
app.post('/debug/reset', checkDebugToken, async (req, res) => {
    const db = await openDb();

    await db.query("DELETE FROM movements;");
    await db.query("DELETE FROM items;");

    res.json({
        ok: true,
        message: "Banco de dados limpo com sucesso!"
    });
});

// Removido download do arquivo .db — NÃO EXISTE no PostgreSQL


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
