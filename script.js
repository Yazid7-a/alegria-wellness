// === NAVBAR SCROLL ===
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

// === FORM STATE ===
let currentStep = 1;
let selectedService = null;

const totalSteps = 6;

// === PRESELECT FROM SERVICE CARDS ===
function preselect(service) {
  selectedService = service;
  const radios = document.querySelectorAll('input[name="servicio"]');
  radios.forEach(r => {
    if (r.value === service) {
      r.checked = true;
      r.closest('.service-option')?.querySelector('.service-opt-inner')?.classList.add('checked');
    }
  });
  document.getElementById('btn-step1').disabled = false;
}

// === SERVICE RADIO LISTENERS ===
document.querySelectorAll('input[name="servicio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    selectedService = radio.value;
    document.getElementById('btn-step1').disabled = false;
  });
});

// === STEP NAVIGATION ===
function goStep(step) {
  if (!validateCurrentStep()) return;

  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));

  // Step 5 routing based on service
  if (step === 5) {
    if (selectedService === 'nutricion') {
      document.getElementById('step-5-nutricion').classList.add('active');
    } else if (selectedService === 'entrenamiento') {
      document.getElementById('step-5-entrenamiento').classList.add('active');
    } else {
      // completo: show nutrition first, then entrenamiento
      document.getElementById('step-5-nutricion').classList.add('active');
    }
  } else {
    const el = document.getElementById(`step-${step}`);
    if (el) el.classList.add('active');
  }

  currentStep = step;
  updateProgress();
  document.getElementById('form-wrap') || document.querySelector('.form-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Handle step 4 next (if completo, go through both)
let nutritionDone = false;

function handleStep4Next() {
  if (!validateCurrentStep()) return;
  if (selectedService === 'completo' && !nutritionDone) {
    nutritionDone = false; // reset
  }
  goStep(5);
}

// Handle going back from step 6
function goBackFromStep6() {
  if (selectedService === 'entrenamiento') {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-5-entrenamiento').classList.add('active');
    currentStep = 5;
  } else {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-5-nutricion').classList.add('active');
    currentStep = 5;
  }
  updateProgress();
}

// Special next for step 5 nutricion in "completo" mode
document.getElementById('step-5-nutricion')?.querySelector('.btn-next')?.addEventListener('click', function(e) {
  e.stopPropagation();
  if (selectedService === 'completo') {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-5-entrenamiento').classList.add('active');
    currentStep = 5.5; // virtual
  } else {
    goStep(6);
  }
  updateProgress();
});

document.getElementById('step-5-entrenamiento')?.querySelector('.btn-back')?.addEventListener('click', function(e) {
  e.stopPropagation();
  if (selectedService === 'completo') {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step-5-nutricion').classList.add('active');
  } else {
    goStep(4);
  }
  updateProgress();
});

// === PROGRESS BAR ===
function updateProgress() {
  const wrap = document.getElementById('progress-wrap');
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  const stepMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 5.5: 5, 6: 6 };
  const s = stepMap[currentStep] || currentStep;
  const pct = Math.round((s / totalSteps) * 100);

  bar.style.setProperty('--progress', `${pct}%`);
  label.textContent = `Paso ${Math.min(s, totalSteps)} de ${totalSteps}`;

  const isLast = s >= totalSteps;
  wrap.style.display = isLast && document.getElementById('step-success').classList.contains('active') ? 'none' : 'flex';
}

// === VALIDATION ===
function validateCurrentStep() {
  const activeStep = document.querySelector('.form-step.active');
  if (!activeStep) return true;

  const stepId = activeStep.id;

  if (stepId === 'step-1') {
    if (!selectedService) {
      showToast('Por favor, selecciona un servicio para continuar.');
      return false;
    }
  }

  if (stepId === 'step-2') {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const edad = document.getElementById('edad').value;
    const peso = document.getElementById('peso').value;
    const altura = document.getElementById('altura').value;

    if (!nombre) { showToast('Por favor, introduce tu nombre.'); return false; }
    if (!email || !email.includes('@')) { showToast('Por favor, introduce un email válido.'); return false; }
    if (!edad) { showToast('Por favor, introduce tu edad.'); return false; }
    if (!peso) { showToast('Por favor, introduce tu peso.'); return false; }
    if (!altura) { showToast('Por favor, introduce tu altura.'); return false; }
  }

  return true;
}

// === TOAST ===
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
    background: #2c2118; color: #faf7f2; padding: 14px 28px;
    border-radius: 50px; font-family: DM Sans, sans-serif; font-size: 0.87rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2); z-index: 9999;
    animation: toastIn 0.3s ease;
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}</style>`);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// === COLLECT ALL FORM DATA ===
function collectFormData() {
  const data = {
    servicio: selectedService,
    nombre: document.getElementById('nombre')?.value?.trim() || '',
    email: document.getElementById('email')?.value?.trim() || '',
    telefono: document.getElementById('telefono')?.value?.trim() || '',
    edad: document.getElementById('edad')?.value || '',
    peso: document.getElementById('peso')?.value || '',
    altura: document.getElementById('altura')?.value || '',
    sexo: document.getElementById('sexo')?.value || '',
    ocupacion: document.getElementById('ocupacion')?.value?.trim() || '',
    objetivo: document.querySelector('input[name="objetivo"]:checked')?.value || '',
    objetivo_detalle: document.getElementById('objetivo-detalle')?.value?.trim() || '',
    condicion_medica: document.getElementById('condicion-medica')?.value?.trim() || '',
    lesiones: document.getElementById('lesiones')?.value?.trim() || '',
    medicacion: document.getElementById('medicacion')?.value?.trim() || '',
    comentarios: document.getElementById('comentarios')?.value?.trim() || '',
    como_conociste: document.getElementById('como-conociste')?.value || '',
  };

  // Nutrición
  if (selectedService === 'nutricion' || selectedService === 'completo') {
    data.alimentacion_actual = document.getElementById('alimentacion-actual')?.value?.trim() || '';
    data.intolerancias = document.getElementById('intolerancias')?.value?.trim() || '';
    data.dieta_tipo = document.getElementById('dieta-tipo')?.value?.trim() || '';
    data.num_comidas = document.getElementById('num-comidas')?.value || '';
    data.agua = document.getElementById('agua')?.value || '';
    data.no_gusta = document.getElementById('no-gusta')?.value?.trim() || '';
  }

  // Entrenamiento
  if (selectedService === 'entrenamiento' || selectedService === 'completo') {
    data.nivel = document.querySelector('input[name="nivel"]:checked')?.value || '';
    data.lugar = document.querySelector('input[name="lugar"]:checked')?.value || '';
    data.dias_entrenamiento = document.getElementById('dias-entrenamiento')?.value || '';
    data.tiempo_sesion = document.getElementById('tiempo-sesion')?.value || '';
    data.experiencia_previa = document.getElementById('experiencia-previa')?.value?.trim() || '';
  }

  return data;
}

// === SUBMIT FORM ===
async function submitForm() {
  const privacidad = document.getElementById('privacidad').checked;
  if (!privacidad) {
    showToast('Por favor, acepta la política de privacidad para continuar.');
    return;
  }

  const data = collectFormData();

  document.getElementById('btn-text').style.display = 'none';
  document.getElementById('btn-loading').style.display = 'inline';
  document.getElementById('btn-submit').disabled = true;

  try {
    const response = await fetch('/api/send-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Show success
      document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
      document.getElementById('step-success').classList.add('active');
      document.getElementById('progress-wrap').style.display = 'none';
    } else {
      throw new Error(result.error || 'Error desconocido');
    }
  } catch (err) {
    console.error(err);
    showToast('Hubo un error al enviar. Por favor, inténtalo de nuevo.');
    document.getElementById('btn-text').style.display = 'inline';
    document.getElementById('btn-loading').style.display = 'none';
    document.getElementById('btn-submit').disabled = false;
  }
}

// === INIT PROGRESS ===
updateProgress();

// === SCROLL REVEAL FOR SECTIONS ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.sobre-content, .sobre-mi-img-wrap, .servicio-card, .formulario-header').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(40px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observer.observe(el);
});
