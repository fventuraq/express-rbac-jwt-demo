const express = require('express');
const {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} = require('../controllers/personController');

const router = express.Router();

router.get('/:id', getPersonById);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);
router.get('/', getAllPersons);
router.post('/', createPerson);

module.exports = router;
