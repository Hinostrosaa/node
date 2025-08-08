import { Paciente, Medico, Cita, HistorialCita  } from "../models/CmModel.js";  // Importar los modelos nombrados
import { Sequelize, Op  } from 'sequelize';

// CRUD para Pacientes

export const getAllPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.findAll();  // Obtenemos todos los pacientes
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un solo paciente por ID
export const getPaciente = async (req, res) => {
    try {
        const paciente = await Paciente.findByPk(req.params.id);
        if (paciente) {
            return res.json(paciente);
        }
        res.status(404).json({ message: 'Paciente no encontrado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un paciente
export const createPaciente = async (req, res) => {
    try {
        await Paciente.create(req.body);
        res.json({ message: 'Paciente creado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un paciente
export const updatePaciente = async (req, res) => {
    try {
        await Paciente.update(req.body, {
            where: { id_paciente: req.params.id }
        });
        res.json({ message: 'Paciente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un paciente
export const deletePaciente = async (req, res) => {
    try {
        await Paciente.destroy({
            where: { id_paciente: req.params.id }
        });
        res.json({ message: 'Paciente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CRUD para Médicos

export const getAllMedicos = async (req, res) => {
    try {
        const medicos = await Medico.findAll();  // Obtenemos todos los médicos
        res.json(medicos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un solo médico por ID
export const getMedico = async (req, res) => {
    try {
        const medico = await Medico.findByPk(req.params.id);
        if (medico) {
            return res.json(medico);
        }
        res.status(404).json({ message: 'Médico no encontrado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un médico
export const createMedico = async (req, res) => {
    try {
        await Medico.create(req.body);
        res.json({ message: 'Médico creado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un médico
export const updateMedico = async (req, res) => {
    try {
        await Medico.update(req.body, {
            where: { id_medico: req.params.id }
        });
        res.json({ message: 'Médico actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un médico
export const deleteMedico = async (req, res) => {
    try {
        await Medico.destroy({
            where: { id_medico: req.params.id }
        });
        res.json({ message: 'Médico eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CRUD para Citas - VERSIÓN CORREGIDA

export const getAllCita = async (req, res) => {
    try {
        const citas = await Cita.findAll({
            include: [
                { model: Paciente, as: 'paciente' },
                { model: Medico, as: 'medico' }
            ]
        });
        res.json(citas);
    } catch (error) {
        res.status(500).json({ 
            message: error.message,
            details: error.errors?.map(e => e.message) 
        });
    }
};

// Versión mejorada de createCita en CmController.js
export const createCita = async (req, res) => {
    try {
        // Validación de campos requeridos mejorada
        const requiredFields = ['id_paciente', 'id_medico', 'fecha'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: `Faltan campos requeridos: ${missingFields.join(', ')}` 
            });
        }

        // Verificar existencia de paciente y médico de forma concurrente
        const [pacienteExists, medicoExists] = await Promise.all([
            Paciente.findByPk(req.body.id_paciente),
            Medico.findByPk(req.body.id_medico)
        ]);
        
        if (!pacienteExists) {
            return res.status(404).json({ 
                success: false,
                error: 'Paciente no encontrado',
                field: 'id_paciente'
            });
        }

        if (!medicoExists) {
            return res.status(404).json({ 
                success: false,
                error: 'Médico no encontrado',
                field: 'id_medico'
            });
        }

        // Formatear fecha correctamente
        let fechaCita;
        try {
            fechaCita = new Date(req.body.fecha);
            if (isNaN(fechaCita.getTime())) {
                throw new Error('Fecha inválida');
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha inválido. Use YYYY-MM-DDTHH:MM:SS',
                details: error.message
            });
        }

        // Verificar disponibilidad del médico
        const inicioSlot = new Date(fechaCita);
        const finSlot = new Date(fechaCita);
        finSlot.setMinutes(finSlot.getMinutes() + 30);

        const citaExistente = await Cita.findOne({
            where: {
                id_medico: req.body.id_medico,
                fecha: {
                    [Op.between]: [inicioSlot, finSlot]
                },
                estado: {
                    [Op.notIn]: ['cancelada', 'completada']
                }
            }
        });

        if (citaExistente) {
            return res.status(409).json({
                success: false,
                error: 'El médico ya tiene una cita programada en este horario',
                conflicto: {
                    id_cita: citaExistente.id_cita,
                    fecha: citaExistente.fecha,
                    paciente: await Paciente.findByPk(citaExistente.id_paciente, {
                        attributes: ['id_paciente', 'nombre']
                    })
                }
            });
        }

        // Crear la cita con datos formateados
        const nuevaCita = await Cita.create({
            id_paciente: req.body.id_paciente,
            id_medico: req.body.id_medico,
            fecha: fechaCita,
            estado: req.body.estado || 'pendiente',
            numero_confirmacion: req.body.numero_confirmacion || null
        });

        // Incluir información relacionada en la respuesta
        const citaConRelaciones = await Cita.findByPk(nuevaCita.id_cita, {
            include: [
                { model: Paciente, as: 'paciente', attributes: ['id_paciente', 'nombre'] },
                { model: Medico, as: 'medico', attributes: ['id_medico', 'nombre', 'especialidad'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Cita creada correctamente',
            data: citaConRelaciones
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al crear cita',
            details: error.errors?.map(e => e.message) || error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const updateCita = async (req, res) => {
    try {
        const [updated] = await Cita.update(req.body, {
            where: { id_cita: req.params.id }
        });
        
        if (updated) {
            const updatedCita = await Cita.findByPk(req.params.id);
            return res.json({
                message: 'Cita actualizada correctamente',
                cita: updatedCita
            });
        }
        res.status(404).json({ message: 'Cita no encontrada' });
    } catch (error) {
        res.status(500).json({ 
            message: error.message,
            details: error.errors?.map(e => e.message) 
        });
    }
};

export const deleteCita = async (req, res) => {
    try {
        const deleted = await Cita.destroy({
            where: { id_cita: req.params.id }
        });
        
        if (deleted) {
            return res.json({ message: 'Cita eliminada correctamente' });
        }
        res.status(404).json({ message: 'Cita no encontrada' });
    } catch (error) {
        res.status(500).json({ 
            message: error.message,
            details: error.errors?.map(e => e.message) 
        });
    }
};

// CRUD para Historial de Citas

export const getAllHistorialCita = async (req, res) => {
    try {
        const { id_paciente, id_medico, estado, fecha_inicio, fecha_fin } = req.query;
        
        const where = {};
        if (id_paciente) where.id_paciente = id_paciente;
        if (id_medico) where.id_medico = id_medico;
        if (estado) where.estado_actual = estado;
        
        if (fecha_inicio && fecha_fin) {
            where.fecha_cambio = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        }

        const historial = await HistorialCita.findAll({
            where,
            include: [
                { 
                    model: Paciente, 
                    as: 'paciente',
                    attributes: ['id_paciente', 'nombre', 'dni']
                },
                { 
                    model: Medico, 
                    as: 'medico',
                    attributes: ['id_medico', 'nombre', 'especialidad']
                },
                { 
                    model: Cita,
                    as: 'cita',
                    attributes: ['id_cita', 'fecha']
                }
            ],
            order: [['fecha_cambio', 'DESC']],
            attributes: { 
                exclude: ['createdAt', 'updatedAt'] 
            }
        });

        res.json({
            success: true,
            count: historial.length,
            data: historial
        });
    } catch (error) {
        console.error('Error al obtener historial de citas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al obtener historial de citas',
            details: error.errors?.map(e => e.message) || error.message 
        });
    }
};

export const getHistorialByCita = async (req, res) => {
    try {
        const historial = await HistorialCita.findAll({
            where: { id_cita: req.params.id },
            include: [
                { 
                    model: Paciente, 
                    as: 'paciente',
                    attributes: ['nombre']
                },
                { 
                    model: Medico, 
                    as: 'medico',
                    attributes: ['nombre', 'especialidad']
                }
            ],
            order: [['fecha_cambio', 'DESC']]
        });

        if (!historial || historial.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró historial para esta cita'
            });
        }

        res.json({
            success: true,
            data: historial
        });
    } catch (error) {
        console.error('Error al obtener historial por cita:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener historial de la cita',
            details: error.message
        });
    }
};

export const getDetalleHistorial = async (req, res) => {
    try {
        const registro = await HistorialCita.findByPk(req.params.id, {
            include: [
                { 
                    model: Paciente, 
                    as: 'paciente',
                    attributes: ['id_paciente', 'nombre', 'dni', 'telefono'],
                    required: false
                },
                { 
                    model: Medico, 
                    as: 'medico',
                    attributes: ['id_medico', 'nombre', 'especialidad'],
                    required: false
                },
                { 
                    model: Cita,
                    as: 'cita',
                    attributes: ['id_cita', 'fecha', 'estado', 'numero_confirmacion'],
                    required: false
                }
            ],
            plain: true // Convertir a objeto plano
        });

        if (!registro) {
            return res.status(404).json({
                success: false,
                message: 'Registro de historial no encontrado'
            });
        }

        // Estructura de respuesta mejorada
        const responseData = {
            id_historial: registro.id_historial,
            id_cita: registro.id_cita,
            id_paciente: registro.id_paciente,
            id_medico: registro.id_medico,
            fecha_original: registro.fecha_original,
            fecha_cambio: registro.fecha_cambio,
            estado_anterior: registro.estado_anterior,
            estado_actual: registro.estado_actual,
            motivo_cambio: registro.motivo_cambio,
            realizado_por: registro.realizado_por,
            observaciones: registro.observaciones,
            // Incluir objetos relacionados
            paciente: registro.paciente || null,
            medico: registro.medico || null,
            cita: registro.cita || null,
            // Campos directos como respaldo
            nombre_paciente: registro.paciente?.nombre || null,
            nombre_medico: registro.medico?.nombre || null,
            especialidad_medico: registro.medico?.especialidad || null
        };

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error al obtener detalle de historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener detalle del registro',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const createRegistroHistorial = async (req, res) => {
    try {
        // Validación de campos requeridos
        if (!req.body.id_cita || !req.body.id_paciente || !req.body.id_medico || !req.body.estado_actual) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos: id_cita, id_paciente, id_medico o estado_actual'
            });
        }

        // Verificar existencia de cita, paciente y médico
        const [cita, paciente, medico] = await Promise.all([
            Cita.findByPk(req.body.id_cita),
            Paciente.findByPk(req.body.id_paciente),
            Medico.findByPk(req.body.id_medico)
        ]);

        if (!cita || !paciente || !medico) {
            return res.status(404).json({
                success: false,
                error: 'Cita, paciente o médico no encontrado'
            });
        }

        // Crear registro de historial
        const nuevoRegistro = await HistorialCita.create({
            id_cita: req.body.id_cita,
            id_paciente: req.body.id_paciente,
            id_medico: req.body.id_medico,
            fecha_original: req.body.fecha_original || cita.fecha,
            estado_anterior: req.body.estado_anterior || cita.estado,
            estado_actual: req.body.estado_actual,
            motivo_cambio: req.body.motivo_cambio || 'Modificación manual',
            realizado_por: req.body.realizado_por || 'admin',
            observaciones: req.body.observaciones
        });

        // Actualizar estado de la cita si es diferente
        if (req.body.estado_actual !== cita.estado) {
            await cita.update({ estado: req.body.estado_actual });
        }

        res.status(201).json({
            success: true,
            message: 'Registro de historial creado correctamente',
            data: nuevoRegistro
        });
    } catch (error) {
        console.error('Error al crear registro de historial:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear registro de historial',
            details: error.errors?.map(e => e.message) || error.message
        });
    }
};

// Obtener médicos por especialidad (versión corregida)
export const getMedicosByEspecialidad = async (req, res) => {
    try {
        const { especialidad } = req.query;
        
        if (!especialidad) {
            return res.status(400).json({
                success: false,
                error: 'El parámetro especialidad es requerido'
            });
        }

        const medicos = await Medico.findAll({
            where: { 
                especialidad: {
                    [Op.like]: `%${especialidad}%`
                }
            },
            attributes: ['id_medico', 'nombre', 'especialidad', 'años_experiencia'],
            order: [['nombre', 'ASC']]
        });

        if (!medicos || medicos.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No se encontraron médicos para la especialidad especificada'
            });
        }

        res.json({
            success: true,
            data: medicos
        });
    } catch (error) {
        console.error('Error al obtener médicos por especialidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener médicos',
            message: error.message
        });
    }
};


// Obtener disponibilidad de un médico
// Versión corregida de getDisponibilidadMedico
export const getDisponibilidadMedico = async (req, res) => {
    try {
        const { id_medico, fecha } = req.query;
        
        // Validación robusta
        if (!id_medico || !fecha) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros requeridos: id_medico (número) y fecha (YYYY-MM-DD)'
            });
        }

        // Convertir id_medico a número
        const medicoId = parseInt(id_medico, 10);
        if (isNaN(medicoId)) {
            return res.status(400).json({
                success: false,
                error: 'ID de médico debe ser un número válido'
            });
        }

        // Verificar que el médico existe
        const medico = await Medico.findByPk(medicoId);
        if (!medico) {
            const medicosExistentes = await Medico.findAll({
                attributes: ['id_medico', 'nombre', 'especialidad'],
                order: [['id_medico', 'ASC']]
            });
            
            return res.status(404).json({
                success: false,
                error: `Médico con ID ${medicoId} no encontrado`,
                medicosExistentes,
                sugerencia: 'Médicos disponibles en el sistema:',
                idsDisponibles: medicosExistentes.map(m => m.id_medico)
            });
        }

        // Convertir la fecha recibida
        const fechaConsulta = new Date(fecha);
        if (isNaN(fechaConsulta.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Formato de fecha inválido',
                expected_format: 'YYYY-MM-DD'
            });
        }

        const inicioDia = new Date(fechaConsulta);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fechaConsulta);
        finDia.setHours(23, 59, 59, 999);

        // Obtener citas existentes
        const citas = await Cita.findAll({
            where: {
                id_medico,
                fecha: {
                    [Op.between]: [inicioDia, finDia]
                },
                estado: {
                    [Op.notIn]: ['cancelada', 'completada']
                }
            },
            attributes: ['id_cita', 'fecha', 'estado'],
            order: [['fecha', 'ASC']]
        });

        // Generar horarios disponibles
        const horariosDisponibles = generarHorariosDisponibles(fechaConsulta, citas);

        res.json({
            success: true,
            data: {
                medico: {
                    id_medico: medico.id_medico,
                    nombre: medico.nombre,
                    especialidad: medico.especialidad
                },
                fecha: fechaConsulta.toISOString(),
                disponibilidad: horariosDisponibles
            }
        });
    } catch (error) {
        console.error('Error en getDisponibilidadMedico:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Función auxiliar para generar horarios disponibles
function generarHorariosDisponibles(fecha, citasExistentes) {
    const horarios = [];
    const horaInicio = 8; // 8:00 AM
    const horaFin = 18;   // 6:00 PM
    const duracionCita = 30; // minutos

    // Convertir citas existentes a formato comparable
    const citasOcupadas = citasExistentes.map(c => {
        const fechaCita = new Date(c.fecha);
        return fechaCita.getHours() * 100 + fechaCita.getMinutes();
    });

    // Generar horarios cada 30 minutos
    for (let hora = horaInicio; hora < horaFin; hora++) {
        for (let minuto = 0; minuto < 60; minuto += duracionCita) {
            const horario = new Date(fecha);
            horario.setHours(hora, minuto, 0, 0);
            
            // Verificar si el horario está ocupado
            const codigoHorario = hora * 100 + minuto;
            const ocupado = citasOcupadas.includes(codigoHorario);

            horarios.push({
                hora: horario.toISOString(),
                disponible: !ocupado,
                horaFormateada: horario.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    }

    return horarios;
}

// Verificar disponibilidad de un horario específico
export const verificarDisponibilidad = async (req, res) => {
    try {
        const { id_medico, fecha } = req.query;
        
        if (!id_medico || !fecha) {
            return res.status(400).json({ error: 'Se requieren id_medico y fecha' });
        }

        const fechaCita = new Date(fecha);
        const inicioSlot = new Date(fechaCita);
        const finSlot = new Date(fechaCita);
        finSlot.setMinutes(finSlot.getMinutes() + 30);

        // Verificar si ya existe una cita en ese horario
        const citaExistente = await Cita.findOne({
            where: {
                id_medico,
                fecha: {
                    [Op.between]: [inicioSlot, finSlot]
                }
            }
        });

        res.json({
            disponible: !citaExistente,
            mensaje: citaExistente ? 'Horario no disponible' : 'Horario disponible'
        });
    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({ 
            error: 'Error al verificar disponibilidad',
            details: error.message 
        });
    }
};

// Obtener especialidades (versión corregida)
export const getEspecialidades = async (req, res) => {
    try {
        const especialidades = await Medico.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('especialidad')), 'especialidad']
            ],
            order: [['especialidad', 'ASC']],
            raw: true
        });

        const especialidadesList = especialidades
            .map(e => e.especialidad)
            .filter(e => e && e.trim() !== ''); // Filtrar valores nulos o vacíos

        if (!especialidadesList.length) {
            return res.status(404).json({
                success: false,
                error: 'No se encontraron especialidades registradas'
            });
        }

        res.json({
            success: true,
            data: especialidadesList
        });
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener especialidades',
            message: error.message
        });
    }
};
