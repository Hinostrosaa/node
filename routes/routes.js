import express from 'express';
import { 
    getAllPacientes, 
    getPaciente, 
    createPaciente, 
    updatePaciente, 
    deletePaciente, 
    getAllMedicos, 
    getMedico, 
    createMedico, 
    updateMedico, 
    deleteMedico,
    getAllCita,
    createCita,
    updateCita,
    deleteCita,
    getAllHistorialCita 
} from '../controllers/CmController.js';

const router = express.Router();

// Rutas de Pacientes
router.get('/pacientes', getAllPacientes);  // Obtener todos los pacientes
router.get('/pacientes/:id_paciente', getPaciente);  // Obtener un paciente por ID
router.post('/pacientes', createPaciente);  // Crear un paciente
router.put('/pacientes/:id_paciente', updatePaciente);  // Actualizar un paciente
router.delete('/pacientes/:id_paciente', deletePaciente);  // Eliminar un paciente

// Rutas de Médicos
router.get('/medicos', getAllMedicos);  // Obtener todos los médicos
router.get('/medicos/:id_medico', getMedico);  // Obtener un médico por ID
router.post('/medicos', createMedico);  // Crear un médico
router.put('/medicos/:id_medico', updateMedico);  // Actualizar un médico
router.delete('/medicos/:id_medico', deleteMedico);  // Eliminar un médico

// Rutas de Citas
router.get('/cita', getAllCita);  // Obtener todos las citas
router.post('/cita', createCita);  // Crear una cita
router.put('/cita/:id_cita', updateCita);  // Actualizar una cita
router.delete('/cita/:id_cita', deleteCita);  // Eliminar una cita

// Rutas de Historialcitas
router.get('/Historialcitas', getAllHistorialCita);  // Obtener todo el Historial

export default router;
