const express = require('express');
const verifyToken = require('../middleware/verifyToken');

const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const functionRoutes = require('./functionRoutes');
//const personRoutes = require('./personRoutes');
//const userRoutes = require('./userRoutes');
const viewRoutes = require('./viewRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/views', verifyToken, viewRoutes);
router.use('/roles', verifyToken, roleRoutes);
router.use('/functions', verifyToken, functionRoutes);
//router.use('/persons', verifyToken, personRoutes);
//router.use('/employees', verifyToken, userRoutes);

module.exports = router;