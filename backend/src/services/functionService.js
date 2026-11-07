// src/services/functionService.js
const pool = require("../config/db");

/**
 * Lista todas as funções ativas com o array de vieid associados.
 * FILTER evita o array_agg(NULL) → [null] quando não há views.
 */
const getAll = async () => {
  const { rows } = await pool.query(
    `
    SELECT f.funid, f.funnom, f.fundes, f.estreg,
           f.credat, f.crebyid, f.upddat, f.updbyid,
           COALESCE(array_agg(vf.vieid) FILTER (WHERE vf.vieid IS NOT NULL), '{}') AS ventanas
      FROM funciones f
      LEFT JOIN view_funcion vf ON vf.funid = f.funid
     WHERE f.estreg = $1
     GROUP BY f.funid
     ORDER BY f.funnom
  `,
    ["A"],
  );
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT f.funid, f.funnom, f.fundes, f.estreg,
           f.credat, f.crebyid, f.upddat, f.updbyid,
           COALESCE(array_agg(vf.vieid) FILTER (WHERE vf.vieid IS NOT NULL), '{}') AS ventanas
      FROM funciones f
      LEFT JOIN view_funcion vf ON vf.funid = f.funid
     WHERE f.funid = $1 AND f.estreg = 'A'
     GROUP BY f.funid
  `,
    [id],
  );
  return rows[0] || null;
};

/**
 * Cria função + associações em view_funcion dentro de uma transação.
 * Se qualquer INSERT falhar, nada fica órfão.
 */
const create = async ({ funnom, fundes, crebyid, ventanas }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO funciones (funnom, fundes, crebyid)
       VALUES ($1, $2, $3)
       RETURNING funid, funnom, fundes, estreg, credat, crebyid, upddat, updbyid`,
      [funnom, fundes, crebyid],
    );
    const created = rows[0];

    if (ventanas.length > 0) {
      const values = ventanas.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO view_funcion (funid, vieid) VALUES ${values}`,
        [created.funid, ...ventanas],
      );
    }

    await client.query("COMMIT");
    return { ...created, ventanas };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Atualiza função + reescreve associações em view_funcion.
 * Estratégia "delete + insert" dentro de transação (mais simples que diff).
 */
const update = async (id, { funnom, fundes, updbyid, ventanas }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows, rowCount } = await client.query(
      `UPDATE funciones
          SET funnom  = $1,
              fundes  = $2,
              updbyid = $3,
              upddat  = CURRENT_TIMESTAMP
        WHERE funid = $4 AND estreg = 'A'
        RETURNING funid, funnom, fundes, estreg, credat, crebyid, upddat, updbyid`,
      [funnom, fundes, updbyid, id],
    );

    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("DELETE FROM view_funcion WHERE funid = $1", [id]);

    if (ventanas.length > 0) {
      const values = ventanas.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO view_funcion (funid, vieid) VALUES ${values}`,
        [id, ...ventanas],
      );
    }

    await client.query("COMMIT");
    return { ...rows[0], ventanas };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Soft delete (estreg = 'I'). Bloqueia se houver roles ativos usando a função.
 */
const deleteFunction = async (id, updbyid) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
       FROM fun_rol fr
       JOIN roles r ON r.rolid = fr.rolid
      WHERE fr.funid = $1 AND r.estreg = 'A'`,
    [id],
  );

  if (rows[0].count > 0) {
    const error = new Error(
      "No se puede desactivar: la función está asociada a roles activos.",
    );
    error.status = 409;
    throw error;
  }

  const { rowCount } = await pool.query(
    `UPDATE funciones
        SET estreg  = 'I',
            updbyid = $1,
            upddat  = CURRENT_TIMESTAMP
      WHERE funid = $2 AND estreg = 'A'`,
    [updbyid, id],
  );

  return rowCount > 0;
};

module.exports = { getAll, getById, create, update, deleteFunction };
