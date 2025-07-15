import { Paciente, Medico, Cita, HistorialCita  } from "../models/CmModel.js";  // Importar los modelos nombrados

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

// CRUD para Citas

export const getAllCita = async (req, res) => {
    try {
        const citas = await Citas.findAll();  // Obtenemos todos las Citas
        res.json(citas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Crear un Citas
export const createCita = async (req, res) => {
    try {
        await Cita.create(req.body);
        res.json({ message: 'Cita creada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un Citas
export const updateCita = async (req, res) => {
    try {
        await Cita.update(req.body, {
            where: { id_cita: req.params.id }
        });
        res.json({ message: 'Cita actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un Citas
export const deleteCita = async (req, res) => {
    try {
        await Cita.destroy({
            where: { id_cita: req.params.id }
        });
        res.json({ message: 'Cita eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CRUD para Historial de Citas

export const getAllHistorialCita = async (req, res) => {
    try {
        const historial_citas = await HistorialCita.findAll();  // Obtenemos todos los Historial_citas
        res.json(historial_citas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};