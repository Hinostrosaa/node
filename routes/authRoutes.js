import express from 'express';
import { login, checkAuth } from '../controllers/AuthController.js';

const router = express.Router();

// Ruta para login
router.post('/login', login);

// Ruta para verificar autenticación
router.get('/check-auth', checkAuth);

export default router;