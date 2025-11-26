import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
