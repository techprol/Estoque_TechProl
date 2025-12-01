import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho PERSISTENTE no Render
const dbPath = process.env.DB_FILE || '/var/data/estoque.db';

export async function openDb() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}
