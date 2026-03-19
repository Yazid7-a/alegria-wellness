# 🌿 Alegría Wellness — Web de Lucía Alegría

Web de captación de clientes para entrenadora personal.  
Stack: HTML/CSS/JS vanilla · Vercel · Resend (email) · PDFKit (PDF)

---

## 🚀 Despliegue en Vercel (paso a paso)

### 1. Instala las herramientas necesarias

Necesitas tener instalado:
- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Git](https://git-scm.com/)

### 2. Crea una cuenta gratuita en Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta gratuita
2. Ve a **API Keys** → **Create API Key**
3. Copia la API Key (empieza por `re_`)
4. Guárdala, la necesitarás en el paso 4

> 💡 El plan gratuito de Resend permite 3.000 emails/mes, más que suficiente.

### 3. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "Initial commit - Alegría Wellness"
git remote add origin https://github.com/TU_USUARIO/alegria-wellness.git
git push -u origin main
```

### 4. Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta gratuita (puedes entrar con GitHub)
2. Haz clic en **"Add New Project"** → importa tu repositorio de GitHub
3. En **"Environment Variables"** añade:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_TUAPIKEY` (la que copiaste en el paso 2)
4. Haz clic en **Deploy**
5. Vercel te dará una URL tipo `alegria-wellness.vercel.app`

### 5. (Opcional) Personaliza la URL

En Vercel → Settings → Domains, puedes cambiar la URL a algo como:
- `alegriacoach.vercel.app`
- `lucialegria.vercel.app`

---

## 📧 Cómo funciona el flujo completo

1. El cliente entra a la URL y rellena el formulario paso a paso
2. Al enviar, el servidor genera un **PDF** con todos los datos del cliente
3. Lucía recibe un **email en lucialegriangg00@gmail.com** con:
   - Resumen del cliente en el cuerpo del email
   - PDF completo adjunto con todos los datos

---

## 🖼 Cómo añadir la foto de Lucía

### En el hero (sección principal):
Busca en `index.html`:
```html
<div class="hero-photo-placeholder">
  <div class="photo-inner">
    <span class="photo-icon">🌿</span>
    <p>Foto de Lucía</p>
  </div>
</div>
```
Reemplázalo por:
```html
<img src="img/lucia-hero.jpg" alt="Lucía Alegría" class="hero-photo-img" />
```

Y en `style.css` añade:
```css
.hero-photo-img {
  width: 380px;
  height: 500px;
  object-fit: cover;
  border-radius: 200px 200px 180px 180px;
  box-shadow: var(--shadow-lg);
}
```

### En "Sobre mí":
Busca el div `.sobre-placeholder` y reemplázalo por una etiqueta `<img>` similar.

---

## 🔒 Seguridad implementada

- ✅ API key nunca expuesta en el frontend (solo en variables de entorno Vercel)
- ✅ Validación de datos en servidor (no solo en cliente)
- ✅ Sanitización de inputs (prevención de XSS)
- ✅ Headers de seguridad HTTP configurados
- ✅ HTTPS automático en Vercel
- ✅ Cache desactivado en la API

---

## 📁 Estructura del proyecto

```
alegria-wellness/
├── index.html          # Página principal
├── style.css           # Estilos
├── script.js           # Lógica del formulario
├── vercel.json         # Configuración de Vercel + headers de seguridad
├── package.json        # Dependencias
└── api/
    └── send-form.js    # Serverless function: genera PDF y envía email
```

---

## ✏️ Personalizar textos

Todos los textos de la web están en `index.html`. Puedes editar directamente:
- Textos del "Sobre mí" de Lucía
- Estadísticas (50 clientes, 3 años...)
- Descripción de los servicios

---

*Desarrollado con ❤️ para Lucía Alegría · Alegría Wellness*
