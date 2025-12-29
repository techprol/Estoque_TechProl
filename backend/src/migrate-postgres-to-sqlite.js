import pkg from "pg";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// ====== POSTGRES (Render) ======
const { Pool } = pkg;
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ====== SQLITE (persistente) ======
const sqliteDb = await open({
    filename: "/var/data/estoque.db",
    driver: sqlite3.Database
});

console.log("🔄 Iniciando migração...");

// Criar tabelas no SQLite
await sqliteDb.exec(`
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY,
    codigo_barras TEXT,
    nome TEXT,
    categoria TEXT,
    descricao TEXT,
    quantidade_atual INTEGER,
    local TEXT,
    caracteristicas TEXT,
    quantidade_minima INTEGER,
    criado_em TEXT
);

CREATE TABLE IF NOT EXISTS movements (
    id INTEGER PRIMARY KEY,
    item_id INTEGER,
    tipo TEXT,
    quantidade INTEGER,
    realizado_por TEXT,
    data_hora TEXT,
    observacao TEXT
);
`);

// Copiar ITEMS
const items = await pgPool.query("SELECT * FROM items");
for (const i of items.rows) {
    await sqliteDb.run(
        `INSERT INTO items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            i.id,
            i.codigo_barras,
            i.nome,
            i.categoria,
            i.descricao,
            i.quantidade_atual,
            i.local,
            i.caracteristicas,
            i.quantidade_minima,
            i.criado_em
        ]
    );
}

// Copiar MOVEMENTS
const movements = await pgPool.query("SELECT * FROM movements");
for (const m of movements.rows) {
    await sqliteDb.run(
        `INSERT INTO movements VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            m.id,
            m.item_id,
            m.tipo,
            m.quantidade,
            m.realizado_por,
            m.data_hora,
            m.observacao
        ]
    );
}

console.log("✅ Migração concluída com sucesso!");
process.exit(0);
