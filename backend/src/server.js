import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import itemsRouter from './routes/items.js';
import movementsRouter from './routes/movements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function openDb() {
  return open({
    filename: path.join(__dirname, '..', 'estoque.db'),
    driver: sqlite3.Database
  });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// inicializar DB (cria tabelas se não existirem)
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

  // garantir que as colunas existam em bancos já criados
  await db.exec(`ALTER TABLE items ADD COLUMN local TEXT;`).catch(() => { });
  await db.exec(`ALTER TABLE items ADD COLUMN caracteristicas TEXT;`).catch(() => { });
  await db.exec(`ALTER TABLE items ADD COLUMN quantidade_minima INTEGER DEFAULT 0;`).catch(() => { });
  
})().catch(err => {
  console.error('Erro ao inicializar DB:', err);
});

app.use('/items', itemsRouter);
app.use('/movements', movementsRouter);

// --- início: debug routes (remova depois de usar) ---
import path from 'path'; // se já importou no topo, não precisa repetir

// middleware simples para checar token
function checkDebugToken(req, res, next) {
  const provided = req.query.token || req.headers['x-debug-token'];
  const expected = process.env.DEBUG_TOKEN;
  if (!expected) {
    // se não houver token configurado, negar por segurança
    return res.status(403).json({ error: 'DEBUG_TOKEN não configurado no servidor' });
  }
  if (!provided || provided !== expected) {
    return res.status(403).json({ error: 'Token inválido para rota de debug' });
  }
  next();
}

// rota que retorna conteúdo das tabelas items e movements
app.get('/debug/db', checkDebugToken, async (req, res) => {
  try {
    const db = await openDb();
    const items = await db.all('SELECT * FROM items ORDER BY nome');
    const movements = await db.all(
      `SELECT m.id, m.tipo, m.quantidade, m.realizado_por, m.data_hora, m.observacao, i.nome as item_nome, i.codigo_barras
       FROM movements m
       LEFT JOIN items i ON i.id = m.item_id
       ORDER BY m.data_hora DESC`
    );
    res.json({ ok: true, items, movements });
  } catch (err) {
    console.error('Erro /debug/db:', err);
    res.status(500).json({ error: 'erro interno' });
  }
});

// rota para baixar o arquivo SQLite (opcional — use com cuidado)
app.get('/debug/db/download', checkDebugToken, (req, res) => {
  try {
    // __dirname está definido no topo do seu server.js (fileURLToPath). usamos caminho relativo
    const dbPath = path.join(__dirname, '..', 'estoque.db');
    return res.download(dbPath, 'estoque.db');
  } catch (err) {
    console.error('Erro /debug/db/download:', err);
    return res.status(500).json({ error: 'erro interno' });
  }
});
// --- fim: debug routes ---


app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
