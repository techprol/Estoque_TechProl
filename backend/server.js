import express from 'express';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { initDb } from './src/initDb.js';
import { openDb } from './src/db.js';

await initDb(); // Apenas isso inicia o BD corretamente

import itemsRouter from './src/routes/items.js';
import movementsRouter from './src/routes/movements.js';

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

// Rota debug
app.get('/debug/db', checkDebugToken, async (req, res) => {
    const db = await openDb();

    const items = await db.all("SELECT * FROM items ORDER BY nome");
    const movements = await db.all(`
        SELECT m.*, i.nome AS item_nome, i.codigo_barras
        FROM movements m
        LEFT JOIN items i ON i.id = m.item_id
        ORDER BY m.data_hora DESC
    `);

    res.json({ ok: true, items, movements });
});

// Download do DB
app.get('/debug/db/download', checkDebugToken, (req, res) => {
    res.download("/var/data/estoque.db", "estoque.db");
});

// reset DB
app.post('/debug/reset', checkDebugToken, async (req, res) => {
    const db = await openDb();
    await db.exec("DELETE FROM movements;");
    await db.exec("DELETE FROM items;");
    res.json({ ok: true, message: "Banco de dados limpo com sucesso!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
