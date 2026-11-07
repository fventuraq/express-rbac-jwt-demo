// src/services/authService.js (ou onde estiver o arquivo original)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
require('dotenv').config();

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
    const menuQuery = `
      SELECT
        f.funid                AS funid,
        f.funnom               AS funnom,
        v.vieid                AS vieid,
        v.vienom               AS vienom,
        v.vieurl               AS vieurl,
        v.viectr               AS viectr,
        v.vieico               AS vieico,
        v.vieestvis            AS vieestvis
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

    // 4) Agrupar em [{ funid, funnom, views: [...] }]
    const menu = menuResult.rows.reduce((acc, row) => {
      let grupo = acc.find((g) => g.funid === row.funid);

      if (!grupo) {
        grupo = { funid: row.funid, funnom: row.funnom, views: [] };
        acc.push(grupo);
      }

      grupo.views.push({
        vieid: row.vieid,
        vienom: row.vienom,
        vieurl: row.vieurl,
        viectr: row.viectr,
        vieico: row.vieico,
        vieestvis: row.vieestvis,
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