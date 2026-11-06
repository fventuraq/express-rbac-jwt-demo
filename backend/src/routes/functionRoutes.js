const express = require('express');
const {
  getAllFunctions,
  getFunctionById,
  createFunction,
  updateFunction,
  deleteFunction,
} = require('../controllers/functionController');

const router = express.Router();

// Endpoints para funciones
router.get('/', getAllFunctions);
router.get('/:id', getFunctionById);
router.post('/', createFunction);
router.put('/:id', updateFunction);
router.delete('/:id', deleteFunction);

module.exports = router;
