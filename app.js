import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import CmRoutes from './routes/routes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configuración CORS actualizada
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/Cms', CmRoutes);
app.use('/api/auth', authRoutes);

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

const connectToDatabase = async () => {
    try {
        await db.authenticate();
        await db.sync(); // Sincroniza los modelos con la base de datos
        console.log('Conexión exitosa a la DB');
    } catch (error) {
        console.error('Error al conectar a la DB:', error);
    }
};

connectToDatabase();

app.listen(8000, () => {
    console.log('Server up and running at http://localhost:8000');
});