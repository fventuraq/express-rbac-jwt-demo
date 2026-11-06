const express = require('express');
const { 
    getAllUsers, 
    getUserById,
    createUser, 
    updateUser,
    deleteUser,
    loginUser 
} = require('../controllers/userController');

const router = express.Router();

// Rutas para empleados
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);

module.exports = router;
