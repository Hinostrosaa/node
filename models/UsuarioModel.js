import db from "../database/db.js";
import { DataTypes } from "sequelize";
import bcryptjs from 'bcryptjs';  // Cambiado de bcrypt a bcryptjs

const Usuario = db.define('usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('medico', 'administrador', 'recepcionista'),
        allowNull: false
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'medico',
            key: 'id_medico'
        }
    },
    reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'usuario',
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcryptjs.genSalt(10);
                user.password_hash = await bcryptjs.hash(user.password_hash, salt);
            }
        }
    }
});

// Método para comparar contraseñas usando bcryptjs
Usuario.prototype.validPassword = async function(password) {
    return await bcryptjs.compare(password, this.password_hash);
};

export default Usuario;