const authService = require('../services/authService');

const login = async (req, res) => {
    const { NomUsu, Pas } = req.body;

    try {
        const result = await authService.authenticateUser(NomUsu, Pas);

        if (result.error) {
            return res.status(401).json({ error: result.error });
        }

        res.json(result);
    } catch (error) {
        console.error("Error al intertar logear:", error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { login };