import db from "../database/db.js"; // Conexión a la base de datos
import { DataTypes } from "sequelize";

// Definir el modelo para pacientes
const Paciente = db.define('paciente', {
    id_paciente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // Esto asegura que el id se incremente automáticamente
        allowNull: false
    },
    nombre: { 
        type: DataTypes.STRING(100),
        allowNull: false
    },
    dni: { 
        type: DataTypes.STRING(8),  // Cambié a STRING para que coincida con varchar(8)
        allowNull: false
    },
    fecha_nacimiento: { 
        type: DataTypes.DATE,
        allowNull: false
    },
    correo_electronico: { 
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    telefono: { 
        type: DataTypes.STRING(9),  // Cambié a STRING para que coincida con varchar(9)
        allowNull: false
    },
    direccion: { 
        type: DataTypes.STRING(100)
    }
}, {
    timestamps: true,  // Para manejar automáticamente createdAt y updatedAt
    tableName: 'paciente'  // Asegúrate de que coincida con el nombre exacto de la tabla
});


// Definir el modelo para médicos
const Medico = db.define('medico', {
    id_medico: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,  // Esto asegura que el id se incremente automáticamente
        allowNull: false
    },
    nombre: { 
        type: DataTypes.STRING(100),
        allowNull: false
    },
    dni: { 
        type: DataTypes.STRING(8),  // Cambié a STRING para que coincida con varchar(8)
        allowNull: false
    },
    especialidad: {  // Este es el campo correcto que debes usar
        type: DataTypes.STRING(100),
        allowNull: false
    },
    años_experiencia: { type: DataTypes.STRING(2),  // Cambié a STRING para que coincida con varchar(8)
        allowNull: false
    }
}, {
    timestamps: true,  // Para manejar automáticamente createdAt y updatedAt
    tableName: 'medico'  // Asegúrate de que coincida con el nombre exacto de la tabla
});

// Definir el modelo para citas--
// Definir el modelo para citas - Versión corregida
// Modelo Cita (versión corregida)
const Cita = db.define('citas', {
    id_cita: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    id_paciente: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'paciente',
            key: 'id_paciente'
        }
    },
    id_medico: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'medico',
            key: 'id_medico'
        }
    },
    fecha: { 
        type: DataTypes.DATE,
        allowNull: false 
    },
    estado: { 
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada', 'reprogramada'),
        defaultValue: 'pendiente'
    },
    numero_confirmacion: { 
        type: DataTypes.STRING(20),
        allowNull: true 
    }
}, {
    timestamps: true,
    tableName: 'citas',
    indexes: [
        {
            fields: ['id_paciente']
        },
        {
            fields: ['id_medico']
        },
        {
            fields: ['fecha']
        },
        {
            fields: ['estado']
        },
        {
            fields: ['id_medico', 'fecha'],
            unique: true
        }
    ]
});

// Modelo HistorialCita (VERSIÓN MEJORADA)
const HistorialCita = db.define('historial_citas', {
    id_historial: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_cita: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'citas',
            key: 'id_cita'
        }
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'paciente',
            key: 'id_paciente'
        }
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'medico',
            key: 'id_medico'
        }
    },
    fecha_original: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_cambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    estado_anterior: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada', 'reprogramada')
    },
    estado_actual: {
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'completada', 'reprogramada'),
        allowNull: false
    },
    motivo_cambio: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    realizado_por: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'sistema'
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'historial_citas',
    indexes: [
        {
            fields: ['id_paciente']
        },
        {
            fields: ['id_medico']
        },
        {
            fields: ['fecha_cambio']
        },
        {
            fields: ['estado_actual']
        }
    ]
});

// Modelo para usuario2 (versión simplificada)
const Usuario2 = db.define('usuario2', {
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
    password: {
        type: DataTypes.STRING(50), // Sin encriptación
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
    }
}, {
    timestamps: true,
    tableName: 'usuario2'
});



// Relaciones MEJORADAS


Usuario2.belongsTo(Medico, {
    foreignKey: 'id_medico',
    as: 'medico'
});

Paciente.hasMany(Cita, { 
    foreignKey: 'id_paciente',
    as: 'citas'
});
Medico.hasMany(Cita, { 
    foreignKey: 'id_medico',
    as: 'citas'
});
Cita.belongsTo(Paciente, { 
    foreignKey: 'id_paciente',
    as: 'paciente',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Cita.belongsTo(Medico, { 
    foreignKey: 'id_medico',
    as: 'medico',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

// Relaciones del Historial
Paciente.hasMany(HistorialCita, { 
    foreignKey: 'id_paciente',
    as: 'historial_citas'
});
Medico.hasMany(HistorialCita, { 
    foreignKey: 'id_medico',
    as: 'historial_citas'
});
Cita.hasMany(HistorialCita, { 
    foreignKey: 'id_cita',
    as: 'historial'
});
HistorialCita.belongsTo(Cita, { 
    foreignKey: 'id_cita',
    as: 'cita'
});
HistorialCita.belongsTo(Paciente, { 
    foreignKey: 'id_paciente',
    as: 'paciente'
});
HistorialCita.belongsTo(Medico, { 
    foreignKey: 'id_medico',
    as: 'medico'
});

export { Paciente, Medico, Cita, HistorialCita, Usuario2  };
