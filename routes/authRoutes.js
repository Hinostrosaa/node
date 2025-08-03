import express from 'express';
import { 
    login,
    requestPasswordReset,
    resetPassword,
    verifyToken
} from '../controllers/AuthController.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/verify-token', verifyToken);

export default router;