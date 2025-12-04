import { query } from "./db.js";

export async function initDb() {

    // Criar tabela ITEMS
    await query(`
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            codigo_barras TEXT UNIQUE,
            nome TEXT NOT NULL,
            categoria TEXT NOT NULL,
            descricao TEXT,
            quantidade_atual INTEGER DEFAULT 0,
            local TEXT,
            caracteristicas TEXT,
            quantidade_minima INTEGER DEFAULT 0,
            criado_em TIMESTAMP DEFAULT NOW()
        );
    `);

    // Criar tabela MOVEMENTS
    await query(`
        CREATE TABLE IF NOT EXISTS movements (
            id SERIAL PRIMARY KEY,
            item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
            tipo TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            realizado_por TEXT DEFAULT 'desconhecido',
            data_hora TIMESTAMP DEFAULT NOW(),
            observacao TEXT
        );
    `);

    console.log("📦 Banco PostgreSQL inicializado com sucesso!");
}
