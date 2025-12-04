import { query } from "./db.js";

export async function initDb() {
    // Criar tabela ITEMS
    await query(`
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
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

    // Criar tabela MOVEMENTS
    await query(`
        CREATE TABLE IF NOT EXISTS movements (
            id SERIAL PRIMARY KEY,
            item_id INTEGER REFERENCES items(id),
            tipo TEXT,
            quantidade INTEGER,
            realizado_por TEXT,
            data_hora TEXT,
            observacao TEXT
        );
    `);

    console.log("📦 Banco PostgreSQL inicializado com sucesso!");
}
