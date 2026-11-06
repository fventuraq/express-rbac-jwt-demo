const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.get('/', viewController.getAllViews);
router.get('/:id', viewController.getViewById);
router.post('/', viewController.createView);
router.put('/:id', viewController.updateView);
router.delete('/:id', viewController.deleteView);

module.exports = router;
