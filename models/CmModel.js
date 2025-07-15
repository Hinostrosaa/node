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

// Definir el modelo para citas
const Cita = db.define('citas', {
    id_paciente: { type: DataTypes.INTEGER },
    id_medico: { type: DataTypes.INTEGER },
    fecha: { type: DataTypes.DATE },
    estado: { type: DataTypes.ENUM, values: ['pendiente', 'confirmada', 'cancelada'] },
    numero_confirmacion: { type: DataTypes.NUMBER }
},{
    timestamps: true,  // Para manejar automáticamente createdAt y updatedAt
    tableName: 'citas'  // Asegúrate de que coincida con el nombre exacto de la tabla
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

// Si necesitas relaciones entre las tablas, puedes agregarlas aquí, por ejemplo:
Paciente.hasMany(Cita, { foreignKey: 'id_paciente' });
Medico.hasMany(Cita, { foreignKey: 'id_medico' });
Cita.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Cita.belongsTo(Medico, { foreignKey: 'id_medico' });
Paciente.hasMany(HistorialCita, { foreignKey: 'id_paciente' });
HistorialCita.belongsTo(Paciente, { foreignKey: 'id_paciente' });
Cita.hasMany(HistorialCita, { foreignKey: 'id_cita' });
HistorialCita.belongsTo(Cita, { foreignKey: 'id_cita' });

export { Paciente, Medico, Cita, HistorialCita };
