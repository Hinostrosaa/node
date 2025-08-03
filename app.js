import express from 'express';
import cors from 'cors';
// importamos la base de datos
import db from './database/db.js';
// importamos el router
import CmRoutes from './routes/routes.js';
// importamos las rutas de autenticación
import authRoutes from './routes/authRoutes.js'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/Cms', CmRoutes);
app.use('/api/auth', authRoutes); // Añadir autenticación


// Función async para conectar la base de datos
const connectToDatabase = async () => {
    try {
        await db.authenticate();
        console.log('Conexión exitosa a la DB');
    } catch (error) {
        console.error('Error al conectar a la DB:', error);
    }
};

// Llamamos a la función para conectar a la base de datos
connectToDatabase();

// Ruta de prueba
/* app.get('/', (req, res) => {
    res.send("HOLA MUNDO");
}); */

// Levantamos el servidor
app.listen(8000, () => {
    console.log('Server up and running at http://localhost:8000');
});
