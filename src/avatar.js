/* ── avatar 3D del rival (PROTOTIPO, el mismo de AnamnesIA) ────────────────────────────────────────────────────
   Dibuja en el navegador un avatar 3D (TalkingHead, MIT, sobre three.js) y le mueve los labios
   mientras habla la voz del navegador. No usa ningún servicio de pago ni manda audio fuera.
   La voz del navegador no expone el audio, así que los labios se guían por palabras:
   - si la voz avisa de cada palabra (evento «boundary»), se anima palabra a palabra;
   - si no avisa (pasa con algunas voces de Chrome y Safari), se anima el texto entero con un ritmo estimado.
   Avatares: 8 personas (mujer/hombre de 25, 40, 58 y 75 años) hechos con MPFB/MakeHuman (CC0),
   rig y visemas de TalkingHead; ~1,3 MB cada uno. Cómo se generan: avatar/generador/. */
const AVATAR_LIB = 'https://cdn.jsdelivr.net/npm/@met4citizen/talkinghead@1.8.2/modules/talkinghead.mjs';
let cabeza = null, cargandoCabeza = null, avatarCargado = '';

const avatarDe = r => ({url: `avatar/${r.id}.glb`, body: r.sexo === 'hombre' ? 'M' : 'F'});
const rivalActual = () => RIVALES.find(r => r.id === S.rivalId) || RIVALES[1];

async function avatarMuestra() {
  const zona = $('avatarZona');
  zona.hidden = !S.ava;
  if (!S.ava || cargandoCabeza) return;
  const av = avatarDe(rivalActual());
  if (cabeza && avatarCargado === av.url) return;
  const lienzo = $('avatarLienzo'), estado = $('avatarEstado');
  estado.textContent = t('Cargando avatar…');
  cargandoCabeza = (async () => {
    if (!cabeza) {
      const {TalkingHead} = await import(AVATAR_LIB);
      cabeza = new TalkingHead(lienzo, {lipsyncModules: [], cameraView: 'head', avatarMood: 'neutral', modelFPS: 30});
    }
    await cabeza.showAvatar({url: av.url, body: av.body, avatarMood: 'neutral'},
      ev => { if (ev.lengthComputable) estado.textContent = t('Cargando avatar…') + ' ' + Math.round(100 * ev.loaded / ev.total) + '%'; });
    cabeza.setBaselineValue('mouthClose', 0.2);   // en reposo los labios de estos modelos quedan entreabiertos y asoman los dientes
    avatarCargado = av.url; estado.textContent = '';
  })().catch(e => {
    console.warn(e); avatarCargado = '';
    estado.textContent = t('No se pudo cargar el avatar. El debate sigue igual sin él.');
  }).finally(() => { cargandoCabeza = null; if (S.ava && avatarDe(rivalActual()).url !== avatarCargado && cabeza) avatarMuestra(); });
}

/* letras → visemas (Oculus) con las reglas básicas de la ortografía española; sirve de aproximación para los demás idiomas */
function visemasPalabra(w) {
  w = w.toLowerCase().replace(/[^a-záéíóúüñç]/g, '');
  const v = [], voc = {a: 'aa', á: 'aa', e: 'E', é: 'E', i: 'I', í: 'I', y: 'I', o: 'O', ó: 'O', u: 'U', ú: 'U', ü: 'U'};
  for (let i = 0; i < w.length; i++) {
    const c = w[i], s = w[i + 1] || '';
    if (voc[c]) v.push(voc[c]);
    else if (c === 'h') continue;
    else if (c === 'c' && s === 'h') { v.push('CH'); i++; }
    else if ((c === 'q' || c === 'g') && s === 'u' && 'eéií'.includes(w[i + 2] || '')) { v.push('kk'); i++; }
    else if (c === 'l' && s === 'l') { v.push('CH'); i++; }
    else if (c === 'r' && s === 'r') { v.push('RR'); i++; }
    else if ('bpmv'.includes(c)) v.push('PP');
    else if (c === 'f') v.push('FF');
    else if ('dt'.includes(c)) v.push('DD');
    else if ('szç'.includes(c) || (c === 'c' && 'eéií'.includes(s))) v.push('SS');
    else if ('cgkqjx'.includes(c)) v.push('kk');
    else if ('nlñ'.includes(c)) v.push('nn');
    else if (c === 'r') v.push('RR');
  }
  return v;
}

const MS_LETRA = 68;   // ritmo estimado de la voz del navegador a velocidad 1
/* las vocales abren la mandíbula (si no, los dientes quedan juntos y parece que rechina); P/B/M y F cierran labios; el resto, suave */
const NIVEL = {aa: 0.8, E: 0.7, I: 0.7, O: 0.8, U: 0.75, PP: 0.9, FF: 0.9};
const MANDIBULA = {aa: 0.3, E: 0.1, I: 0.08, O: 0.22, U: 0.12};
function avatarVisemas(texto, inicio) {   // encola los visemas de «texto» a partir de «inicio» ms; devuelve cuándo acaba
  let t0 = inicio;
  for (const w of texto.split(/\s+/).filter(Boolean)) {
    const vis = visemasPalabra(w), dur = Math.max(120, w.length * MS_LETRA);
    const d = vis.length ? dur / vis.length : 0;
    vis.forEach((x, j) => {
      const t = t0 + j * d;
      cabeza.animQueue.push({template: {name: 'viseme'}, ts: [t - Math.min(60, 2 * d / 3), t + Math.min(25, d / 2), t + d + Math.min(60, d / 2)],
        vs: {['viseme_' + x]: [null, NIVEL[x] ?? 0.4, 0], ...(MANDIBULA[x] ? {jawOpen: [null, MANDIBULA[x], 0]} : {})}});
    });
    t0 += dur + (/[.,;:!?]$/.test(w) ? 250 : 40);
  }
  return t0;
}
function avatarCalla() {
  if (!cabeza) return;
  cabeza.animQueue = cabeza.animQueue.filter(x => x.template?.name !== 'viseme');
  cabeza.resetLips(); cabeza.isSpeaking = false; cabeza.stateName = 'idle';
}

/* se engancha a cada locución del rival (la llama habla() antes de hablar) */
function avatarHabla(u, texto) {
  if (!cabeza) return;
  let porPalabras = false, estimado = false, respaldo = null;
  u.addEventListener('start', () => {
    cabeza.isSpeaking = true; cabeza.stateName = 'speaking';
    cabeza.lookAtCamera(500); cabeza.speakWithHands();
    respaldo = setTimeout(() => { if (!porPalabras) { estimado = true; avatarVisemas(texto, cabeza.animClock); } }, 300);
  });
  u.addEventListener('boundary', ev => {
    if (ev.name && ev.name !== 'word') return;
    porPalabras = true;
    if (estimado) return;   // el respaldo ya animó todo el texto
    const w = texto.slice(ev.charIndex, ev.charLength ? ev.charIndex + ev.charLength : undefined).split(/\s/)[0];
    avatarVisemas(w, cabeza.animClock);
  });
  const fin = () => { clearTimeout(respaldo); avatarCalla(); };
  u.addEventListener('end', fin); u.addEventListener('error', fin);
}
