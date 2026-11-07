const express = require('express');
const cors = require('cors');
require('dotenv').config();

const indexRoutes  = require('./routes');
const verifyToken = require('./middleware/verifyToken');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:4000',
            'http://192.168.0.109:4000',
        ];

        // Permitir origenes nulos (APK instaladas, WebViews, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
            //callback(null, true);
        } else {
            console.error(`❌ CORS rejected for origin: ${origin}`);
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], // Métodos HTTP permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

// Middleware for parsing JSON body
app.use(express.json());

// Public routes
app.use('/api', indexRoutes);

// Protected routes (RBAC / JWT demo)
app.get('/api', verifyToken, (req, res) => {
  res.json({
    message: 'Access granted to protected route.',
    user: req.user
  });
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});