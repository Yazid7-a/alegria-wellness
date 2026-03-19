// api/send-contact.js
// Vercel Serverless Function — Formulario de contacto simple

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const LUCIA_EMAIL = 'lucialegriangg00@gmail.com';

const SERVICIOS = {
  nutricion: 'Plan Nutricional',
  entrenamiento: 'Plan de Entrenamiento',
  completo: 'Plan Completo',
  info: 'Solo quiero información',
};

export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nombre, contacto, servicio, mensaje } = req.body;

    // Validación
    if (!nombre || typeof nombre !== 'string' || nombre.length > 200) {
      return res.status(400).json({ error: 'Datos inválidos: nombre' });
    }
    if (!contacto || typeof contacto !== 'string' || contacto.length > 200) {
      return res.status(400).json({ error: 'Datos inválidos: contacto' });
    }
    if (!mensaje || typeof mensaje !== 'string' || mensaje.length > 3000) {
      return res.status(400).json({ error: 'Datos inválidos: mensaje' });
    }

    // Sanitizar
    const clean = s => (s || '').slice(0, 3000).replace(/<[^>]*>/g, '');
    const nombreClean = clean(nombre);
    const contactoClean = clean(contacto);
    const mensajeClean = clean(mensaje);
    const servicioLabel = SERVICIOS[servicio] || 'No especificado';

    await resend.emails.send({
      from: 'Alegría Wellness <onboarding@resend.dev>',
      to: LUCIA_EMAIL,
      subject: `💬 Nuevo mensaje de ${nombreClean}`,
      html: `
        <div style="font-family: 'Jost', Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #f5f0e8; border-radius: 16px; overflow: hidden;">
          <div style="background: #1c1812; padding: 32px 40px;">
            <h1 style="margin:0; color:#fff; font-size:20px; font-weight:400;">Alegría Wellness</h1>
            <p style="margin:6px 0 0; color:rgba(255,255,255,0.5); font-size:12px;">Nuevo mensaje de contacto</p>
          </div>
          <div style="padding:36px 40px;">
            <h2 style="color:#1c1812; font-size:18px; font-weight:500; margin:0 0 24px;">💬 Tienes un nuevo mensaje</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#9a8e82;font-size:12px;width:130px;text-transform:uppercase;letter-spacing:0.08em;">Nombre</td><td style="padding:8px 0;color:#1c1812;font-size:14px;font-weight:500;">${nombreClean}</td></tr>
              <tr><td style="padding:8px 0;color:#9a8e82;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Contacto</td><td style="padding:8px 0;color:#1c1812;font-size:14px;">${contactoClean}</td></tr>
              <tr><td style="padding:8px 0;color:#9a8e82;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Servicio</td><td style="padding:8px 0;"><span style="background:#1c1812;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;">${servicioLabel}</span></td></tr>
            </table>
            <div style="margin-top:24px;padding:20px;background:#fff;border-radius:12px;border-left:3px solid #4a7c59;">
              <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#9a8e82;">Mensaje</p>
              <p style="margin:0;color:#2c2318;font-size:14px;line-height:1.7;">${mensajeClean.replace(/\n/g, '<br/>')}</p>
            </div>
          </div>
          <div style="padding:18px 40px;background:#1c1812;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">Alegría Wellness · lucialegriangg00@gmail.com</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in send-contact:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
