// src/services/authService.js (ou onde estiver o arquivo original)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
require('dotenv').config();

/**
 * Autentica o usuário e devolve:
 *  - token: JWT assinado
 *  - user:  payload do token (compatível com o frontend)
 *  - menu:  árvore [{ funid, funnom, ventanas: [...] }] filtrada pelo role
 *
 * Nomenclatura dos parâmetros em lowercase para alinhar com o schema do banco.
 */
const authenticateUser = async (usunam, usupas) => {
  try {
    // 1) Buscar usuário ativo
    const result = await pool.query(
      `SELECT usuid, rolid, perid, usunam, usupas
         FROM users
        WHERE usunam = $1 AND estreg = 'A'`,
      [usunam]
    );

    if (result.rows.length === 0) {
      return { error: 'Usuario no encontrado o inactivo.' };
    }

    const user = result.rows[0];

    // 2) Comparar senha (hash gerado por pgcrypto.gen_salt('bf') = bcrypt padrão)
    const isMatch = await bcrypt.compare(usupas, user.usupas);
    if (!isMatch) {
      return { error: 'Contraseña incorrecta.' };
    }

    // 3) Menu: grupos (funciones) -> telas (views)
    //    Aliases SQL em lowercase `ven*` para casar com o contrato do Sidebar.
    const menuQuery = `
      SELECT
        f.funid                AS funid,
        f.funnom               AS funnom,
        v.vieid                AS venid,
        v.vienom               AS vennom,
        v.vieurl               AS venurl,
        v.viectr               AS venctr,
        v.vieico               AS venico,
        v.vieestvis            AS venestvis
      FROM funciones     f
      JOIN fun_rol       fr ON fr.funid = f.funid
      JOIN view_funcion  vf ON vf.funid = f.funid
      JOIN views         v  ON v.vieid  = vf.vieid
      WHERE fr.rolid      = $1
        AND f.estreg      = 'A'
        AND v.estreg      = 'A'
        AND v.vieestvis   = TRUE
      ORDER BY f.funnom, v.vienom;
    `;

    const menuResult = await pool.query(menuQuery, [user.rolid]);

    // 4) Agrupar em [{ funid, funnom, ventanas: [...] }]
    const menu = menuResult.rows.reduce((acc, row) => {
      let grupo = acc.find((g) => g.funid === row.funid);

      if (!grupo) {
        grupo = { funid: row.funid, funnom: row.funnom, ventanas: [] };
        acc.push(grupo);
      }

      grupo.ventanas.push({
        venid: row.venid,
        vennom: row.vennom,
        venurl: row.venurl,
        venctr: row.venctr,
        venico: row.venico,
        venestvis: row.venestvis,
      });

      return acc;
    }, []);

    // 5) Nome do role (usado como "cargo" no Sidebar)
    const rolResult = await pool.query(
      'SELECT rolnom FROM roles WHERE rolid = $1',
      [user.rolid]
    );
    const rolnom = rolResult.rows[0]?.rolnom || 'Usuario';

    // 6) Payload do JWT
    //    Mantemos os nomes que o frontend já consome hoje:
    //      FunctionsDashboard.js -> user.EmpID
    //      Sidebar.js            -> user.NomUsu / user.EmpCargo
    //    O valor de EmpID é o USERS.UsuID (id do usuário para auditoria).
    const payload = {
      EmpID: user.usuid,
      NomUsu: user.usunam,
      RolID: user.rolid,
      EmpCargo: rolnom,
    };

    // 7) Assinar JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return { token, user: payload, menu };
  } catch (error) {
    console.error('Error en autenticación:', error);
    throw new Error('Error en autenticación.');
  }
};

module.exports = { authenticateUser };