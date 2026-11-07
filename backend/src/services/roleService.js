// src/services/roleService.js
const pool = require("../config/db");

const getAll = async () => {
  const { rows } = await pool.query(
    `
    SELECT r.rolid, r.rolnom, r.estreg,
           r.credat, r.crebyid, r.upddat, r.updbyid,
           COALESCE(array_agg(fr.funid) FILTER (WHERE fr.funid IS NOT NULL), '{}') AS funcs
      FROM roles r
      LEFT JOIN fun_rol fr ON fr.rolid = r.rolid
     WHERE r.estreg = $1
     GROUP BY r.rolid
     ORDER BY r.rolnom
  `,
    ["A"],
  );
  return rows;
};

const getById = async (id) => {
  const { rows } = await pool.query(
    `
    SELECT r.rolid, r.rolnom, r.estreg,
           r.credat, r.crebyid, r.upddat, r.updbyid,
           COALESCE(array_agg(fr.funid) FILTER (WHERE fr.funid IS NOT NULL), '{}') AS funcs
      FROM roles r
      LEFT JOIN fun_rol fr ON fr.rolid = r.rolid
     WHERE r.rolid = $1 AND r.estreg = 'A'
     GROUP BY r.rolid
  `,
    [id],
  );
  return rows[0] || null;
};

const create = async ({ rolnom, crebyid, funcs }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO roles (rolnom, crebyid)
       VALUES ($1, $2)
       RETURNING rolid, rolnom, estreg, credat, crebyid, upddat, updbyid`,
      [rolnom, crebyid],
    );
    const created = rows[0];

    if (funcs.length > 0) {
      const values = funcs.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO fun_rol (rolid, funid) VALUES ${values}`,
        [created.rolid, ...funcs],
      );
    }

    await client.query("COMMIT");
    return { ...created, funcs };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const update = async (id, { rolnom, updbyid, funcs }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows, rowCount } = await client.query(
      `UPDATE roles
          SET rolnom  = $1,
              updbyid = $2,
              upddat  = CURRENT_TIMESTAMP
        WHERE rolid = $3 AND estreg = 'A'
        RETURNING rolid, rolnom, estreg, credat, crebyid, upddat, updbyid`,
      [rolnom, updbyid, id],
    );

    if (rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query("DELETE FROM fun_rol WHERE rolid = $1", [id]);

    if (funcs.length > 0) {
      const values = funcs.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO fun_rol (rolid, funid) VALUES ${values}`,
        [id, ...funcs],
      );
    }

    await client.query("COMMIT");
    return { ...rows[0], funcs };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Soft delete. Bloqueia se houver usuários ativos usando o role.
 */
const deleteRole = async (id, updbyid) => {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count
       FROM users
      WHERE rolid = $1 AND estreg = 'A'`,
    [id],
  );

  if (rows[0].count > 0) {
    const error = new Error(
      "No se puede desactivar: el rol tiene usuarios activos.",
    );
    error.status = 409;
    throw error;
  }

  const { rowCount } = await pool.query(
    `UPDATE roles
        SET estreg  = 'I',
            updbyid = $1,
            upddat  = CURRENT_TIMESTAMP
      WHERE rolid = $2 AND estreg = 'A'`,
    [updbyid, id],
  );

  return rowCount > 0;
};

module.exports = { getAll, getById, create, update, deleteRole };
