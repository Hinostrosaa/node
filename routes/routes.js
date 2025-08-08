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
    getAllHistorialCita,
    getHistorialByCita,  // Añade esta importación
    getDetalleHistorial, // También asegúrate de importar esta si la usas
    createRegistroHistorial, // Y esta si también la necesitas
    getMedicosByEspecialidad,  // Añade esta importación
    getDisponibilidadMedico,   // Añade esta importación
    verificarDisponibilidad,
    getEspecialidades    // Añade esta importación 
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
// Agregar estas rutas para el historial
router.get('/historial-citas', getAllHistorialCita);
router.get('/historial-citas/cita/:id', getHistorialByCita);
router.get('/historial-citas/:id', getDetalleHistorial);
router.post('/historial-citas', createRegistroHistorial);

// Nuevas rutas para disponibilidad
router.get('/medicos-por-especialidad', getMedicosByEspecialidad);
router.get('/medicos/disponibilidad', getDisponibilidadMedico);
router.get('/medicos/verificar-disponibilidad', verificarDisponibilidad);
router.get('/especialidades', getEspecialidades);



export default router;
