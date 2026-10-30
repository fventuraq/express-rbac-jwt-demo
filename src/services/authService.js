const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
require('dotenv').config();

const authenticateUser = async (UsuNam, UsuPas) => {
    try {
        // Buscar usuario en la base de datos
        const result = await pool.query(
            'SELECT * FROM USUARIOS WHERE UsuNam = $1 AND EstReg = $2',
            [UsuNam, 'A']
        );

        if (result.rows.length === 0) {
            return { error: 'Usuario no encontrado o inactivo.' };
        }

        const user = result.rows[0];

        // Comparar senha
        const isMatch = await bcrypt.compare(UsuPas, user.usupas);
        if (!isMatch) {
            return { error: 'Contraseña incorrecta.' };
        }

        // Obtener menú (Funciones e Views) com base no rol do usuario
        const menuQuery = `
            SELECT 
                f.FunID, f.FunNom, 
                v.VieID, v.VieNom, v.VieURL, v.VieCtr, v.VieIco, v.VieEstVis
            FROM FUNCIONES f
            JOIN ROL_FUN rf ON f.FunID = rf.FunID
            JOIN VIEW_FUNCION vf ON f.FunID = vf.FunID
            JOIN VIEWS v ON vf.VieID = v.VieID
            WHERE rf.RolID = $1 AND v.EstReg = 'A'
            ORDER BY f.FunNom, v.VieNom;
        `;

        const menuResult = await pool.query(menuQuery, [user.rolid]);

        // Agrupar funciones e suas views
        const menu = {};
        menuResult.rows.forEach(({ FunID, FunNom, VieID, VieNom, VieURL, VieCtr, VieIco, VieEstVis }) => {
            if (!menu[FunID]) {
                menu[FunID] = {
                    FunNom,
                    views: [],
                };
            }
            menu[FunID].views.push({ VieID, VieNom, VieURL, VieCtr, VieIco, VieEstVis });
        });

        const formattedMenu = menuResult.rows.reduce((acc, row) => {
            let funcion = acc.find(f => f.FunID === row.funid);

            if (!funcion) {
                funcion = {
                    FunID: row.funid,
                    FunNom: row.funnom,
                    views: []
                };
                acc.push(funcion);
            }

            funcion.ventanas.push({
                VieID: row.vieid,
                VieNom: row.vienom,
                VieURL: row.vieurl,
                VieCtr: row.viectr,
                VieIco: row.vieico,
                VieEstVis: row.vieestvis
            });

            return acc;
        }, []);
        // Crear payload del token
        const payload = {
            EmpID: user.empid,
            NomUsu: user.nomusu,
            RolID: user.rolid,
        };

        // Generar el token JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        return { token, user: payload, menu: formattedMenu };
    } catch (error) {
        console.error('Error en autenticación:', error);
        throw new Error('Error en autenticación.');
    }
};

module.exports = { authenticateUser };