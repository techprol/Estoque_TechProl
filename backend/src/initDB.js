import { openDb } from "./db.js";

export async function initDb() {
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
}
