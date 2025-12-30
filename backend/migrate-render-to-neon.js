import pkg from "pg";
const { Pool } = pkg;

// 🔴 BANCO ANTIGO (Render)
const oldPool = new Pool({
  connectionString: process.env.OLD_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 🟢 BANCO NOVO (Neon)
const newPool = new Pool({
  connectionString: process.env.NEW_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log("🔄 Buscando dados do banco antigo...");

  const items = await oldPool.query("SELECT * FROM items");
  const movements = await oldPool.query("SELECT * FROM movements");

  console.log(`📦 Itens encontrados: ${items.rows.length}`);
  console.log(`🔁 Movimentações encontradas: ${movements.rows.length}`);

  for (const item of items.rows) {
    await newPool.query(
      `INSERT INTO items (
        id, codigo_barras, nome, categoria, descricao,
        quantidade_atual, local, caracteristicas,
        quantidade_minima, criado_em
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      ) ON CONFLICT (id) DO NOTHING`,
      [
        item.id,
        item.codigo_barras,
        item.nome,
        item.categoria,
        item.descricao,
        item.quantidade_atual,
        item.local,
        item.caracteristicas,
        item.quantidade_minima,
        item.criado_em
      ]
    );
  }

  for (const m of movements.rows) {
    await newPool.query(
      `INSERT INTO movements (
        id, item_id, tipo, quantidade,
        realizado_por, data_hora, observacao
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7
      ) ON CONFLICT (id) DO NOTHING`,
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
  process.exit();
}

migrate().catch(err => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
