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
    especialidad: { type: DataTypes.STRING(100),
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
        type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada'),
        defaultValue: 'pendiente'
    },
    numero_confirmacion: { 
        type: DataTypes.STRING,
        allowNull: true 
    }
}, {
    timestamps: true,
    tableName: 'citas'
});

// Definir el modelo para historial de citas
const HistorialCita = db.define('historial_cita', {
    id_paciente: { type: DataTypes.INTEGER },
    id_cita: { type: DataTypes.INTEGER },
    fecha_atencion: { type: DataTypes.DATE },
    estado: { type: DataTypes.ENUM, values: ['pendiente', 'confirmada', 'cancelada'] }
}, {
    timestamps: true,  // Para manejar automáticamente createdAt y updatedAt
    tableName: 'historial_citas'  // Asegúrate de que coincida con el nombre exacto de la tabla
});

// Relaciones CORREGIDAS
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
    as: 'paciente'
});
Cita.belongsTo(Medico, { 
    foreignKey: 'id_medico',
    as: 'medico'
});
Paciente.hasMany(HistorialCita, { 
    foreignKey: 'id_paciente',
    as: 'historial'
});
HistorialCita.belongsTo(Paciente, { 
    foreignKey: 'id_paciente',
    as: 'paciente'
});
Cita.hasMany(HistorialCita, { 
    foreignKey: 'id_cita',
    as: 'historial'
});
HistorialCita.belongsTo(Cita, { 
    foreignKey: 'id_cita',
    as: 'cita'
});

export { Paciente, Medico, Cita, HistorialCita };
