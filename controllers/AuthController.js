import Usuario from '../models/UsuarioModel.js';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';  // Cambiado de bcrypt a bcryptjs
import { sendPasswordResetEmail } from '../utils/emailService.js';
import { Op } from 'sequelize';  // Importar Op para las consultas

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';
const JWT_EXPIRES_IN = '8h';

// Método auxiliar para comparar contraseñas
const comparePasswords = async (plainPassword, hashedPassword) => {
    try {
        return await bcryptjs.compare(plainPassword, hashedPassword);
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Nombre de usuario y contraseña son requeridos'
            });
        }

        const user = await Usuario.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Cambio importante: Usamos bcryptjs directamente en lugar del método del modelo
        const isValidPassword = await comparePasswords(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            { id: user.id_usuario, username: user.username, rol: user.rol },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                username: user.username,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            // Por seguridad, no revelamos si el email existe o no
            return res.json({
                success: true,
                message: 'Si el email existe, se ha enviado un correo con instrucciones'
            });
        }

        const resetToken = jwt.sign(
            { id: user.id_usuario },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        user.reset_token = resetToken;
        user.reset_token_expiry = new Date(Date.now() + 3600000);
        await user.save();

        await sendPasswordResetEmail(user.email, resetToken);

        res.json({
            success: true,
            message: 'Si el email existe, se ha enviado un correo con instrucciones'
        });

    } catch (error) {
        console.error('Error en solicitud de recuperación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar la solicitud'
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 9) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 9 caracteres'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await Usuario.findOne({ 
            where: { 
                id_usuario: decoded.id,
                reset_token: token,
                reset_token_expiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }

        // Encriptar la nueva contraseña antes de guardarla
        const salt = await bcryptjs.genSalt(10);
        user.password_hash = await bcryptjs.hash(newPassword, salt);
        user.reset_token = null;
        user.reset_token_expiry = null;
        await user.save();

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error al restablecer la contraseña',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await Usuario.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash', 'reset_token', 'reset_token_expiry'] }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id_usuario,
                username: user.username,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error al verificar token:', error);
        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
};