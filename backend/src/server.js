import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import itemsRouter from './routes/items.js';
import movementsRouter from './routes/movements.js';

// Corrigir __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para abrir DB
async function openDb() {
  return open({
    filename: path.join(__dirname, '..', 'estoque.db'),
    driver: sqlite3.Database
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Inicializar DB (cria tabelas se não existirem)
(async () => {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_barras TEXT UNIQUE,
      nome TEXT,
      categoria TEXT,
      descricao TEXT,
      quantidade_atual INTEGER,
      local TEXT,
      caracteristicas TEXT,
      quantidade_minima INTEGER DEFAULT 0,
      criado_em TEXT
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER,
      tipo TEXT,
      quantidade INTEGER,
      realizado_por TEXT,
      data_hora TEXT,
      observacao TEXT,
      FOREIGN KEY(item_id) REFERENCES items(id)
    );
  `);

  // garantir que colunas novas existam
  await db.exec(`ALTER TABLE items ADD COLUMN local TEXT;`).catch(() => { });
  await db.exec(`ALTER TABLE items ADD COLUMN caracteristicas TEXT;`).catch(() => { });
  await db.exec(`ALTER TABLE items ADD COLUMN quantidade_minima INTEGER DEFAULT 0;`).catch(() => { });

})().catch(err => {
  console.error('Erro ao inicializar DB:', err);
});

// Rotas principais
app.use('/items', itemsRouter);
app.use('/movements', movementsRouter);

app.get('/', (req, res) => res.json({ ok: true }));


// ========== DEBUG MODE SEGURO ==========

// Middleware para token
function checkDebugToken(req, res, next) {
  const provided = req.query.token || req.headers['x-debug-token'];
  const expected = process.env.DEBUG_TOKEN;

  if (!expected) {
    return res.status(403).json({ error: "DEBUG_TOKEN não configurado" });
  }
  if (!provided || provided !== expected) {
    return res.status(403).json({ error: "Token inválido" });
  }

  next();
}

// Rota para visualizar o DB
app.get('/debug/db', checkDebugToken, async (req, res) => {
  try {
    const db = await openDb();

    const items = await db.all("SELECT * FROM items ORDER BY nome");
    const movements = await db.all(`
      SELECT m.*, i.nome AS item_nome, i.codigo_barras
      FROM movements m
      LEFT JOIN items i ON i.id = m.item_id
      ORDER BY m.data_hora DESC
    `);

    res.json({ ok: true, items, movements });

  } catch (err) {
    console.error("Erro na rota /debug/db:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Rota para baixar o banco
app.get('/debug/db/download', checkDebugToken, (req, res) => {
  try {
    const dbPath = path.join(__dirname, '..', 'estoque.db');
    res.download(dbPath, "estoque.db");
  } catch (err) {
    console.error("Erro ao baixar banco:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ========== FIM DEBUG ==========

// Iniciar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Backend rodando na porta ${PORT}`)
);
