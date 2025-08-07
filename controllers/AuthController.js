import { Usuario2 } from "../models/CmModel.js";

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validación simple
        if (!username || !password) {
            return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
        }

        // Buscar usuario
        const usuario = await Usuario2.findOne({ 
            where: { username, password } // Comparación directa sin encriptación
        });

        if (usuario) {
            // Autenticación exitosa
            return res.json({
                success: true,
                user: {
                    id: usuario.id_usuario,
                    username: usuario.username,
                    rol: usuario.rol,
                    id_medico: usuario.id_medico
                }
            });
        } else {
            // Credenciales incorrectas
            return res.status(401).json({ 
                success: false, 
                message: 'Credenciales incorrectas' 
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor',
            error: error.message 
        });
    }
};

export const checkAuth = async (req, res) => {
    // Esta función es para verificar si el usuario está autenticado
    // En un sistema simple sin tokens, podrías usar sesiones o simplemente confiar en el frontend
    res.json({ 
        success: true,
        message: 'Sistema de autenticación simple activo' 
    });
};