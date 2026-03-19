// === NAV SCROLL ===
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

// === STATE ===
let selectedService = null;
let currentStep = 1;

// === PRESELECT FROM SERVICE CARDS ===
function preselect(service) {
  selectedService = service;
  document.querySelectorAll('input[name="servicio"]').forEach(r => {
    r.checked = r.value === service;
  });
  document.getElementById('btn-s1').disabled = false;
}

// === SERVICE RADIO LISTENERS ===
document.querySelectorAll('input[name="servicio"]').forEach(r => {
  r.addEventListener('change', () => {
    selectedService = r.value;
    document.getElementById('btn-s1').disabled = false;
  });
});

// === STEP NAVIGATION ===
function showStep(id) {
  document.querySelectorAll('.fstep').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goStep(n) {
  if (!validate()) return;

  if (n === 5) {
    if (selectedService === 'nutricion') {
      showStep('step-5-nutricion');
    } else if (selectedService === 'entrenamiento') {
      showStep('step-5-entrenamiento');
    } else {
      // completo: nutricion first
      showStep('step-5-nutricion');
    }
    currentStep = 5;
  } else if (n === 6) {
    showStep('step-6');
    currentStep = 6;
  } else {
    showStep(`step-${n}`);
    currentStep = n;
  }
  updateProgress();
}

function handleStep4Next() {
  if (!validate()) return;
  goStep(5);
}

function nextFrom5Nutricion() {
  if (!validate()) return;
  if (selectedService === 'completo') {
    // Show entrenamiento step next
    showStep('step-5-entrenamiento');
    currentStep = 5.5;
    updateProgress();
  } else {
    goStep(6);
  }
}

function backFrom5Entrenamiento() {
  if (selectedService === 'completo') {
    showStep('step-5-nutricion');
    currentStep = 5;
  } else {
    goStep(4);
  }
  updateProgress();
}

function goBackFromStep6() {
  if (selectedService === 'entrenamiento') {
    showStep('step-5-entrenamiento');
  } else {
    showStep('step-5-nutricion');
  }
  currentStep = 5;
  updateProgress();
}

// === PROGRESS ===
function updateProgress() {
  const stepNum = typeof currentStep === 'number' ? Math.round(currentStep) : currentStep;
  const clamped = Math.min(Math.max(stepNum, 1), 6);
  const pct = (clamped / 6) * 100;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('progress-label').textContent = `Paso ${clamped} de 6`;
}

// === VALIDATION ===
function validate() {
  const active = document.querySelector('.fstep.active');
  if (!active) return true;
  const id = active.id;

  if (id === 'step-1' && !selectedService) {
    toast('Por favor, selecciona un servicio para continuar.');
    return false;
  }
  if (id === 'step-2') {
    const n = document.getElementById('nombre')?.value?.trim();
    const e = document.getElementById('email')?.value?.trim();
    const ed = document.getElementById('edad')?.value;
    const p = document.getElementById('peso')?.value;
    const h = document.getElementById('altura')?.value;
    if (!n) { toast('Por favor, introduce tu nombre.'); return false; }
    if (!e || !e.includes('@')) { toast('Por favor, introduce un email válido.'); return false; }
    if (!ed) { toast('Por favor, introduce tu edad.'); return false; }
    if (!p) { toast('Por favor, introduce tu peso.'); return false; }
    if (!h) { toast('Por favor, introduce tu altura.'); return false; }
  }
  return true;
}

// === TOAST ===
function toast(msg) {
  document.querySelector('.toast-msg')?.remove();
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
    background:var(--dark,#1c1812);color:#fff;
    padding:13px 26px;border-radius:50px;
    font-family:'Jost',sans-serif;font-size:0.85rem;
    box-shadow:0 8px 30px rgba(0,0,0,0.2);z-index:9999;
    animation:fadeInToast .3s ease;
  `;
  if (!document.getElementById('toast-style')) {
    const st = document.createElement('style');
    st.id = 'toast-style';
    st.textContent = '@keyframes fadeInToast{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(st);
  }
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// === COLLECT DATA ===
function collectData() {
  const v = id => document.getElementById(id)?.value?.trim() || '';
  const r = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

  const data = {
    servicio: selectedService,
    nombre: v('nombre'), email: v('email'), telefono: v('telefono'),
    edad: v('edad'), peso: v('peso'), altura: v('altura'),
    sexo: v('sexo'), ocupacion: v('ocupacion'),
    objetivo: r('objetivo'), objetivo_detalle: v('objetivo-detalle'),
    condicion_medica: v('condicion-medica'), lesiones: v('lesiones'), medicacion: v('medicacion'),
    comentarios: v('comentarios'), como_conociste: v('como-conociste'),
  };

  if (selectedService === 'nutricion' || selectedService === 'completo') {
    Object.assign(data, {
      alimentacion_actual: v('alimentacion-actual'),
      intolerancias: v('intolerancias'),
      dieta_tipo: v('dieta-tipo'),
      num_comidas: v('num-comidas'),
      agua: v('agua'),
      no_gusta: v('no-gusta'),
    });
  }

  if (selectedService === 'entrenamiento' || selectedService === 'completo') {
    Object.assign(data, {
      nivel: r('nivel'), lugar: r('lugar'),
      dias_entrenamiento: v('dias-entrenamiento'),
      tiempo_sesion: v('tiempo-sesion'),
      experiencia_previa: v('experiencia-previa'),
    });
  }

  return data;
}

// === SUBMIT CUESTIONARIO ===
async function submitForm() {
  if (!document.getElementById('privacidad').checked) {
    toast('Por favor, acepta la política de privacidad.');
    return;
  }

  const btn = document.getElementById('btn-submit');
  document.getElementById('btn-text').style.display = 'none';
  document.getElementById('btn-loading').style.display = 'inline';
  btn.disabled = true;

  try {
    const res = await fetch('/api/send-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectData()),
    });
    const result = await res.json();

    if (res.ok && result.success) {
      showStep('step-success');
      document.getElementById('progress-wrap').style.display = 'none';
    } else {
      throw new Error(result.error || 'Error');
    }
  } catch (e) {
    toast('Hubo un error al enviar. Por favor, inténtalo de nuevo.');
    document.getElementById('btn-text').style.display = 'inline';
    document.getElementById('btn-loading').style.display = 'none';
    btn.disabled = false;
  }
}

// === CONTACTO SIMPLE ===
async function sendContact() {
  const nombre = document.getElementById('c-nombre')?.value?.trim();
  const contacto = document.getElementById('c-contacto')?.value?.trim();
  const mensaje = document.getElementById('c-mensaje')?.value?.trim();

  if (!nombre) { toast('Por favor, introduce tu nombre.'); return; }
  if (!contacto) { toast('Por favor, introduce tu email o WhatsApp.'); return; }
  if (!mensaje) { toast('Por favor, escribe un mensaje.'); return; }

  const btn = document.getElementById('c-btn-text');
  const loading = document.getElementById('c-btn-loading');
  btn.style.display = 'none';
  loading.style.display = 'inline';

  try {
    const res = await fetch('/api/send-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        contacto,
        servicio: document.getElementById('c-servicio')?.value || '',
        mensaje,
      }),
    });
    const result = await res.json();

    if (res.ok && result.success) {
      document.getElementById('c-success').style.display = 'block';
      btn.style.display = 'inline';
      loading.style.display = 'none';
    } else {
      throw new Error();
    }
  } catch {
    toast('Error al enviar. Inténtalo de nuevo.');
    btn.style.display = 'inline';
    loading.style.display = 'none';
  }
}

// === SCROLL REVEAL ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.scard, .icard, .sobre-left, .sobre-right, .cinfo, .cform').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Init
updateProgress();
