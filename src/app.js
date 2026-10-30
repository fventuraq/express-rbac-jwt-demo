const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middleware/verifyToken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON body
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (RBAC / JWT demo)
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: 'Access granted to protected route.',
    user: req.user
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});