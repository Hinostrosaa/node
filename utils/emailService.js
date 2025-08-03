import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'no-reply@citasmedicas.com',
        to: email,
        subject: 'Restablecimiento de contraseña',
        html: `
            <h1>Restablecer contraseña</h1>
            <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
            <p>Por favor, haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>El enlace expirará en 1 hora.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};