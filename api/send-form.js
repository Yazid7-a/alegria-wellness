// api/send-form.js
// Vercel Serverless Function
// Requiere: npm install resend pdfkit

import { Resend } from 'resend';
import PDFDocument from 'pdfkit';

const resend = new Resend(process.env.RESEND_API_KEY);
const LUCIA_EMAIL = 'lucialegriangg00@gmail.com';

// Etiquetas bonitas para los campos
const LABELS = {
  servicio: 'Servicio contratado',
  nombre: 'Nombre completo',
  email: 'Email',
  telefono: 'Teléfono',
  edad: 'Edad',
  peso: 'Peso (kg)',
  altura: 'Altura (cm)',
  sexo: 'Sexo',
  ocupacion: 'Ocupación',
  objetivo: 'Objetivo principal',
  objetivo_detalle: 'Descripción del objetivo',
  condicion_medica: 'Condición médica',
  lesiones: 'Lesiones',
  medicacion: 'Medicación habitual',
  alimentacion_actual: 'Alimentación actual',
  intolerancias: 'Intolerancias / Alergias',
  dieta_tipo: 'Tipo de dieta',
  num_comidas: 'Comidas al día',
  agua: 'Agua diaria (litros)',
  no_gusta: 'Alimentos que no le gustan',
  nivel: 'Nivel de condición física',
  lugar: 'Lugar de entrenamiento',
  dias_entrenamiento: 'Días de entrenamiento por semana',
  tiempo_sesion: 'Tiempo por sesión',
  experiencia_previa: 'Experiencia previa',
  comentarios: 'Comentarios adicionales',
  como_conociste: 'Cómo nos conoció',
};

const SERVICIOS = {
  nutricion: 'Plan Nutricional',
  entrenamiento: 'Plan de Entrenamiento',
  completo: 'Plan Completo (Nutrición + Entrenamiento)',
};

function formatValue(key, value) {
  if (!value) return 'No especificado';
  if (key === 'servicio') return SERVICIOS[value] || value;
  if (key === 'sexo') {
    const map = { mujer: 'Mujer', hombre: 'Hombre', otro: 'Otro / Prefiero no decirlo' };
    return map[value] || value;
  }
  if (key === 'objetivo') {
    const map = {
      'perder-peso': 'Perder peso',
      'ganar-musculo': 'Ganar músculo',
      'tonificar': 'Tonificar',
      'mejorar-salud': 'Mejorar la salud general',
      'rendimiento': 'Mejorar el rendimiento',
      'habitos': 'Adquirir hábitos saludables',
    };
    return map[value] || value;
  }
  return value;
}

function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // === HEADER ===
    doc.rect(0, 0, doc.page.width, 110).fill('#4e7352');
    doc.fillColor('#ffffff')
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('Alegría Wellness', 50, 28);
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('rgba(255,255,255,0.85)')
      .text('Entrenamiento · Nutrición · Bienestar', 50, 62);
    doc.fontSize(10)
      .fillColor('rgba(255,255,255,0.7)')
      .text(`Formulario de cliente · ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 84);

    doc.y = 130;
    doc.fillColor('#2c2118');

    // === SERVICIO BADGE ===
    const servLabel = SERVICIOS[data.servicio] || data.servicio || 'No especificado';
    doc.rect(50, doc.y, doc.page.width - 100, 36)
      .fill('#f0ebe0');
    doc.fillColor('#4e7352')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`✦  ${servLabel}`, 66, doc.y - 25);
    doc.y += 20;

    // === SECTIONS ===
    const sections = [
      {
        title: 'Datos Personales',
        color: '#4e7352',
        fields: ['nombre', 'email', 'telefono', 'edad', 'peso', 'altura', 'sexo', 'ocupacion'],
      },
      {
        title: 'Objetivo',
        color: '#7a9e7e',
        fields: ['objetivo', 'objetivo_detalle'],
      },
      {
        title: 'Historial Médico',
        color: '#8b6f5c',
        fields: ['condicion_medica', 'lesiones', 'medicacion'],
      },
    ];

    if (data.servicio === 'nutricion' || data.servicio === 'completo') {
      sections.push({
        title: 'Hábitos Alimenticios',
        color: '#d4927a',
        fields: ['alimentacion_actual', 'intolerancias', 'dieta_tipo', 'num_comidas', 'agua', 'no_gusta'],
      });
    }

    if (data.servicio === 'entrenamiento' || data.servicio === 'completo') {
      sections.push({
        title: 'Entrenamiento',
        color: '#4e7352',
        fields: ['nivel', 'lugar', 'dias_entrenamiento', 'tiempo_sesion', 'experiencia_previa'],
      });
    }

    sections.push({
      title: 'Información Adicional',
      color: '#9a8070',
      fields: ['comentarios', 'como_conociste'],
    });

    sections.forEach(section => {
      if (doc.y > doc.page.height - 150) doc.addPage();

      // Section header
      doc.y += 18;
      doc.rect(50, doc.y, doc.page.width - 100, 28).fill(section.color);
      doc.fillColor('#ffffff')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(section.title.toUpperCase(), 62, doc.y + 8);
      doc.y += 38;

      section.fields.forEach((field, i) => {
        const val = formatValue(field, data[field]);
        const label = LABELS[field] || field;

        if (doc.y > doc.page.height - 80) doc.addPage();

        // Alternating row background
        if (i % 2 === 0) {
          doc.rect(50, doc.y - 4, doc.page.width - 100, 28).fill('#faf7f2');
        }

        doc.fillColor('#5c4a3a')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(label.toUpperCase(), 62, doc.y);

        doc.fillColor('#2c2118')
          .fontSize(10)
          .font('Helvetica')
          .text(val, 62, doc.y + 11, { width: doc.page.width - 130 });

        doc.y += 30;
      });
    });

    // === FOOTER ===
    doc.y += 20;
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#e0d8cf').lineWidth(1).stroke();
    doc.y += 12;
    doc.fillColor('#9a8070')
      .fontSize(9)
      .font('Helvetica')
      .text('Este documento es confidencial y ha sido generado automáticamente por Alegría Wellness.', 50, doc.y, {
        align: 'center',
        width: doc.page.width - 100,
      });

    doc.end();
  });
}

export default async function handler(req, res) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic rate limiting via Vercel environment
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const data = req.body;

    // Server-side validation
    if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.length > 200) {
      return res.status(400).json({ error: 'Datos inválidos: nombre' });
    }
    if (!data.email || !data.email.includes('@') || data.email.length > 200) {
      return res.status(400).json({ error: 'Datos inválidos: email' });
    }
    if (!data.servicio || !['nutricion', 'entrenamiento', 'completo'].includes(data.servicio)) {
      return res.status(400).json({ error: 'Datos inválidos: servicio' });
    }

    // Sanitize all string fields
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].slice(0, 2000).replace(/<[^>]*>/g, '');
      }
    });

    // Generate PDF
    const pdfBuffer = await generatePDF(data);
    const pdfBase64 = pdfBuffer.toString('base64');

    const serviceLabel = SERVICIOS[data.servicio] || data.servicio;

    // Send email via Resend
    await resend.emails.send({
      from: 'Alegría Wellness <onboarding@resend.dev>',
      to: LUCIA_EMAIL,
      subject: `✦ Nuevo cliente: ${data.nombre} — ${serviceLabel}`,
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f2; border-radius: 16px; overflow: hidden;">
          <div style="background: #4e7352; padding: 36px 40px;">
            <h1 style="margin:0; color: #ffffff; font-size: 22px; font-weight: 600;">Alegría Wellness</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 13px;">Nuevo formulario de cliente recibido</p>
          </div>
          <div style="padding: 36px 40px;">
            <h2 style="color: #2c2118; font-size: 18px; margin: 0 0 24px;">¡Tienes un nuevo cliente! ✦</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #9a8070; font-size: 13px; width: 140px;">Nombre</td><td style="padding: 8px 0; color: #2c2118; font-size: 14px; font-weight: 500;">${data.nombre}</td></tr>
              <tr><td style="padding: 8px 0; color: #9a8070; font-size: 13px;">Email</td><td style="padding: 8px 0; color: #2c2118; font-size: 14px;">${data.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #9a8070; font-size: 13px;">Teléfono</td><td style="padding: 8px 0; color: #2c2118; font-size: 14px;">${data.telefono || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px 0; color: #9a8070; font-size: 13px;">Servicio</td><td style="padding: 8px 0;"><span style="background: #4e7352; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${serviceLabel}</span></td></tr>
              <tr><td style="padding: 8px 0; color: #9a8070; font-size: 13px;">Objetivo</td><td style="padding: 8px 0; color: #2c2118; font-size: 14px;">${formatValue('objetivo', data.objetivo)}</td></tr>
            </table>
            <div style="margin-top: 28px; padding: 20px; background: #f0ebe0; border-radius: 12px; border-left: 4px solid #4e7352;">
              <p style="margin: 0; color: #5c4a3a; font-size: 13px; line-height: 1.6;">📎 Encontrarás el <strong>informe completo del cliente en PDF</strong> adjunto a este email con todos los datos del formulario.</p>
            </div>
          </div>
          <div style="padding: 20px 40px; background: #2c2118; text-align: center;">
            <p style="margin: 0; color: rgba(250,247,242,0.4); font-size: 11px;">Alegría Wellness · lucialegriangg00@gmail.com</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `cliente-${data.nombre.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
          content: pdfBase64,
        }
      ]
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in send-form:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
