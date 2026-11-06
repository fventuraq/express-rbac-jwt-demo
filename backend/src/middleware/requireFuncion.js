const pool = require("../config/db");

function requireFuncion(funNom) {
  return async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT 1
           FROM rol_fun rf
           JOIN funciones f ON f.funid = rf.funid
          WHERE rf.rolid = $1
            AND f.funnom = $2
            AND f.estreg = 'A'
          LIMIT 1`,
        [req.user.rolid, funNom],
      );

      if (rows.length === 0) {
        return res.status(403).json({
          message: `Acceso denegado: falta la función "${funNom}".`,
        });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { requireFuncion };
