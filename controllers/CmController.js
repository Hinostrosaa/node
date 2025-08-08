import { Paciente, Medico, Cita, HistorialCita  } from "../models/CmModel.js";  // Importar los modelos nombrados

// CRUD para Pacientes

export const getAllPacientes = async (req, res) => {
    try {
        const { dni, nombre } = req.query;
        
        let where = {};
        if (dni) where.dni = dni;
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };

        const pacientes = await Paciente.findAll({ where });
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
        const { dni, especialidad } = req.query;
        
        let where = {};
        if (dni) where.dni = dni;
        if (especialidad) where.especialidad = especialidad;

        const medicos = await Medico.findAll({ where });
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

export const createCita = async (req, res) => {
    try {
        // Validación de campos requeridos
        if (!req.body.id_paciente || !req.body.id_medico || !req.body.fecha) {
            return res.status(400).json({ 
                error: 'Faltan campos requeridos: id_paciente, id_medico o fecha' 
            });
        }

        // Verificar existencia de paciente y médico
        const [pacienteExists, medicoExists] = await Promise.all([
            Paciente.findByPk(req.body.id_paciente),
            Medico.findByPk(req.body.id_medico)
        ]);
        
        if (!pacienteExists || !medicoExists) {
            return res.status(404).json({ 
                error: 'Paciente o Médico no encontrado' 
            });
        }

        // Crear la cita
        const nuevaCita = await Cita.create({
            id_paciente: req.body.id_paciente,
            id_medico: req.body.id_medico,
            fecha: new Date(req.body.fecha),
            estado: req.body.estado || 'pendiente',
            numero_confirmacion: req.body.numero_confirmacion || null
        });

        // El trigger after_cita_insert se encargará del historial

        res.status(201).json({
            message: 'Cita creada correctamente',
            cita: nuevaCita
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ 
            error: 'Error al crear cita',
            details: error.errors?.map(e => e.message) || error.message 
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
        const { id_cita, estado, fecha_inicio, fecha_fin } = req.query;
        
        const where = {};
        if (id_cita) where.id_cita = id_cita;
        if (estado) where.estado_actual = estado;
        
        if (fecha_inicio && fecha_fin) {
            where.fecha_cambio = {
                [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
            };
        } else if (fecha_inicio) {
            where.fecha_cambio = {
                [Op.gte]: new Date(fecha_inicio)
            };
        } else if (fecha_fin) {
            where.fecha_cambio = {
                [Op.lte]: new Date(fecha_fin)
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
            details: error.message
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

