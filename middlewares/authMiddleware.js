import jwt from 'jsonwebtoken';
import Usuario from '../models/UsuarioModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Acceso no autorizado. Token requerido.'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await Usuario.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Error de autenticación:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para realizar esta acción'
            });
        }
        next();
    };
};