import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  code: string,
  userName: string,
): Promise<void> {
  await transporter.sendMail({
    from: '"Repurchase" <noreply@repurchase.com>',
    to,
    subject: "Código de recuperação de senha - Repurchase",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #E91E63, #FF4081); color: white; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px;">R</div>
          <h2 style="color: #1A1A2E; margin-top: 16px;">Repurchase</h2>
        </div>
        
        <p style="color: #6B7280;">Olá, <strong>${userName}</strong>!</p>
        <p style="color: #6B7280;">Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; padding: 16px 32px; background: #F8F9FC; border-radius: 12px; border: 2px dashed #E5E7EB;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #E91E63;">${code}</span>
          </div>
        </div>
        
        <p style="color: #6B7280; font-size: 14px;">Este código expira em <strong>15 minutos</strong>.</p>
        <p style="color: #9CA3AF; font-size: 12px;">Se você não solicitou esta alteração, ignore este e-mail.</p>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">© 2025 Repurchase. Todos os direitos reservados.</p>
      </div>
    `,
  });
}
