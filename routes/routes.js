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
router.get('/pacientes', getAllPacientes);
router.get('/pacientes/:id', getPaciente);
router.post('/pacientes', createPaciente);
router.put('/pacientes/:id', updatePaciente);
router.delete('/pacientes/:id', deletePaciente);

// Rutas de Médicos
router.get('/medicos', getAllMedicos);
router.get('/medicos/:id', getMedico);
router.post('/medicos', createMedico);
router.put('/medicos/:id', updateMedico);
router.delete('/medicos/:id', deleteMedico);

// Rutas de Citas (CORREGIDAS)
router.get('/citas', getAllCita);
router.post('/citas', createCita);
router.put('/citas/:id', updateCita);
router.delete('/citas/:id', deleteCita);

// Rutas de Historial de Citas
router.get('/historial-citas', getAllHistorialCita);

export default router;
