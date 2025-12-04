import pkg from 'pg';
const { Pool } = pkg;

// Render fornece DATABASE_URL no ambiente
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ ERRO: DATABASE_URL não foi definida!");
}

export const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // necessário para Render
    }
});

// Função padrão openDb() — compatibilidade com o restante do código
export async function openDb() {
    return pool;
}

// Função para executar queries diretas, se precisar usar em algum lugar
export async function query(text, params) {
    const client = await pool.connect();
    try {
        const res = await client.query(text, params);
        return res;
    } finally {
        client.release();
    }
}
