// src/services/viewService.js
const pool = require("../config/db");

/**
 * Lista todas as views (ativas e inativas).
 * O dashboard mostra todas; o menu filtra depois.
 */
const getAllViews = async () => {
  const result = await pool.query(
    `SELECT vieid, vienom, vieurl, viectr, vieico, vieest, vieestvis,
            credat, crebyid, upddat, updbyid, estreg
       FROM views
      ORDER BY vienom;`,
  );
  return result.rows;
};

/**
 * Busca uma view pelo id.
 */
const getViewById = async (id) => {
  const result = await pool.query(
    `SELECT vieid, vienom, vieurl, viectr, vieico, vieest, vieestvis,
            credat, crebyid, upddat, updbyid, estreg
       FROM views
      WHERE vieid = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    return { error: "View não encontrada." };
  }
  return result.rows[0];
};

/**
 * Cria uma view.
 * O frontend envia: { vienom, vieurl, viectr, vieico, vieest, vieestvis, crebyid }
 */
const createView = async (data) => {
  const {
    vienom,
    vieurl,
    viectr,
    vieico = null,
    vieest = "A",
    vieestvis = true,
    crebyid = null,
  } = data;

  if (!vienom || !vieurl || !viectr) {
    return { error: "vienom, vieurl e viectr são obrigatórios." };
  }

  const result = await pool.query(
    `INSERT INTO views
       (vienom, vieurl, viectr, vieico, vieest, vieestvis, crebyid)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING vieid, vienom, vieurl, viectr, vieico, vieest, vieestvis,
               credat, crebyid, upddat, updbyid, estreg`,
    [vienom, vieurl, viectr, vieico, vieest, vieestvis, crebyid],
  );
  return result.rows[0];
};

/**
 * Atualiza uma view.
 * O frontend envia todos os campos + updbyid.
 */
const updateView = async (id, data) => {
  const {
    vienom,
    vieurl,
    viectr,
    vieico = null,
    vieest,
    vieestvis,
    updbyid = null,
  } = data;

  const result = await pool.query(
    `UPDATE views
        SET vienom    = $1,
            vieurl    = $2,
            viectr    = $3,
            vieico    = $4,
            vieest    = $5,
            vieestvis = $6,
            upddat    = CURRENT_TIMESTAMP,
            updbyid   = $7
      WHERE vieid = $8
      RETURNING vieid, vienom, vieurl, viectr, vieico, vieest, vieestvis,
                credat, crebyid, upddat, updbyid, estreg`,
    [vienom, vieurl, viectr, vieico, vieest, vieestvis, updbyid, id],
  );

  if (result.rows.length === 0) {
    return { error: "View não encontrada." };
  }
  return result.rows[0];
};

/**
 * Soft delete: marca estreg = 'I'. O registro continua no banco.
 * Coerente com o botão "Desativar" do dashboard.
 */
const deleteView = async (id, data = {}) => {
  const { updbyid = null } = data;

  const result = await pool.query(
    `UPDATE views
        SET estreg  = 'I',
            upddat  = CURRENT_TIMESTAMP,
            updbyid = $1
      WHERE vieid = $2
      RETURNING vieid, vienom, vieurl, viectr, vieico, vieest, vieestvis, estreg`,
    [updbyid, id],
  );

  if (result.rows.length === 0) {
    return { error: "View não encontrada." };
  }
  return result.rows[0];
};

module.exports = {
  getAllViews,
  getViewById,
  createView,
  updateView,
  deleteView,
};
