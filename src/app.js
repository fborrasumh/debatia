/* ══ DebatIA · lógica de la app.
      La IA hace de rival, de moderador y de público, y redacta los comentarios; el código construye el público,
      mide el discurso, valida los votos, aplica la regla Munk y comprueba cada cita (nucleo.js).
      Los textos se escriben en español y se traducen con t(); los diccionarios están en src/i18n.js. ══ */
const STEPS = ['Inicio', 'Moción', 'Público', 'Debate', 'Veredicto', 'Informe'];
const HUBS = ['Progreso'];
const NAV = [
  ['Preparar un debate', 'Puedes ver un ejemplo completo sin clave de IA.'],
  ['Siguiente: el público', 'Elige la moción, tu postura y tu rival.'],
  ['Siguiente: el debate', 'El público tiene que votar antes de empezar.'],
  ['Siguiente: el veredicto', 'Al terminar las doce intervenciones, pasa al veredicto.'],
  ['Siguiente: tu informe', 'Tras la votación final, pasa a tu informe.'],
  ['Volver al inicio', 'Descarga tu informe o prepara otro debate.']
];
const RENDER = {0: pintaInicio, 1: pintaPrep, 2: pintaPublico, 3: pintaDebate, 4: pintaVeredicto, 5: pintaInforme, 6: pintaProgreso};
const GLOS = [
  ['¿Qué es esto?', 'Un entrenador de oratoria. Debates contra un rival IA sobre una moción, con las fases y los tiempos de los Munk Debates, y un público de personas sintéticas vota antes y después. Al final recibes las métricas de tu discurso y comentarios con citas literales de lo que dijiste.'],
  ['El formato', 'Munk adaptado a 1 contra 1: apertura de cada lado, réplicas, dos preguntas del moderador que responden los dos y cierres en orden inverso, de modo que quien defiende la moción abre y cierra. Los tiempos son orientativos: el código estima tu duración hablada (unas 140 palabras por minuto) o la mide si dictas.'],
  ['Cómo vota el público', 'Cada persona sintética tiene sexo, edad, comunidad autónoma y nivel de estudios, repartidos según la población adulta de España (INE 2025). La IA decide cómo votaría cada una, en grupos de diez. Antes del debate solo conoce la moción; después lee la transcripción sin saber quién es el estudiante: los ponentes aparecen como A (a favor) y B (en contra).'],
  ['La regla Munk', 'No gana el lado con más votos, sino el que más puntos porcentuales gana entre la votación previa y la final. Solo cuentan las personas que votaron en las dos rondas. El recuento y el ganador los calcula el código.'],
  ['Qué comprueba el código', 'Que cada voto es válido y de una persona del público; que la cita que da cada persona aparece literalmente en el debate y de qué ponente es; que las citas de los comentarios son tuyas; los niveles de la rúbrica (0-3); y todas las métricas: palabras, tiempo, posibles muletillas, conectores, diversidad léxica y referencias al rival. Si la IA se desvía, verás el aviso.'],
  ['Qué hace la IA', 'Interpreta al rival y al moderador, simula el voto de cada persona y redacta los comentarios de la rúbrica. Puede equivocarse. El rival tiene instrucciones de no inventar datos, pero puede hacerlo: el código señala las cifras que no estaban en la moción ni en tus intervenciones.'],
  ['Límites del público sintético', 'Es una simulación: no predice lo que votaría un público real. Los modelos de IA tienden a respuestas moderadas, pueden apoyarse en estereotipos de edad o de región y pueden premiar los discursos más largos. Úsalo como señal para entrenar, no como medida de tu valía.'],
  ['Voz y avatar', 'El dictado, la voz del rival y el avatar 3D los hace el propio navegador: el audio no sale de tu dispositivo. Funcionan mejor en Chrome y Edge. El avatar es un prototipo y se descarga la primera vez (unos 1,3 MB).'],
  ['Privacidad', 'Tus debates se guardan solo en este navegador. Hacia tu proveedor de IA salen la moción, las intervenciones y los perfiles sintéticos del público; tu nombre no se envía y en tus intervenciones se enmascaran correos, teléfonos y documentos de identidad. Antes del primer envío ves lo que sale.'],
  ['Tu clave de IA', 'Funciona con OpenAI, Google Gemini o Anthropic Claude. La clave se guarda solo en este navegador y cada persona paga su propio uso. Un debate completo con 100 personas son unas 28 llamadas: usa un modelo económico.']
];
const FASE_ES = {apertura: 'Apertura', replica: 'Réplica', pregunta: 'Pregunta del moderador', respuesta: 'Respuesta', cierre: 'Cierre'};
const faseN = f => t('fase.' + f);
const ladoN = l => t('lado.' + l);
const COLOR_LADO = {favor: '#0E7C6B', contra: '#C9441F', indeciso: '#7C93AC'};

let S = {
  stu: '', mocionId: MOCIONES[0].id, mocionPropia: '', lado: 'favor', rivalId: 'mujer_40', estilo: 'academico', nivel: 'intermedio', formato: 'munk',
  stt: false, tts: false, ava: false, pob: pobDefecto(), panel: [], pre: null, post: null,
  mocionFija: '', langDebate: '', turnos: [], ti: 0, cur: null, fb: null, fbAvisos: [], esEjemplo: false, sesiones: []
};
let ENVIO_OK = false, ocupado = false, parar = false, errorTurno = '', reloj = null;

const mocionTexto = () => S.mocionFija || (S.mocionId === 'propia' ? S.mocionPropia.trim() : L(MOCIONES.find(m => m.id === S.mocionId)) || '');
const plan = () => planDebate(S.formato, S.lado === 'azar' ? 'favor' : S.lado);
const enMarcha = () => !!(S.pre || S.turnos.length);
const debateFin = () => S.ti >= plan().length;
const nombreRival = () => rivalActual().nombre;
const otroLado = l => l === 'favor' ? 'contra' : 'favor';
const lgD = () => S.langDebate || LANG;

/* ── ejemplo sin clave ───────────────────────────────────────────────────────────────── */
function aplicaEjemplo() {
  const e = EJ[LANG] || EJ.es, sesiones = S.sesiones;
  S = {...S, stu: S.stu, mocionId: 'ia_examen', mocionPropia: '', lado: 'favor', rivalId: 'mujer_40', estilo: 'academico', nivel: 'intermedio', formato: 'corto',
    pob: pobDefecto(), mocionFija: L(MOCIONES[0]), langDebate: LANG, ti: 12, cur: null, esEjemplo: true, sesiones};
  S.panel = muestreaPanel(S.pob);
  S.turnos = plan().map((p, i) => ({...p, texto: e.turnos[i], seg: p.quien === 'estudiante' ? Math.round(palabras(e.turnos[i]).length / PPM_EST * 60) : null, dictado: false}));
  const v = ejemploVotos(S.panel, LANG), ids = S.panel.map(p => p.id);
  S.pre = {votos: v.pre, avisos: [], faltan: [], hecho: true};
  const vp = validaVotos(v.rawPost, ids, S.turnos);
  S.post = {votos: vp.votos, avisos: vp.avisos, faltan: vp.faltan, hecho: true};
  const r = revisaFeedback(e.fb, S.turnos); S.fb = r.fb; S.fbAvisos = r.avisos;
}
window.addEventListener('langchange', () => { if (S.esEjemplo) { aplicaEjemplo(); guarda(); (RENDER[step] || (() => {}))(); } });

/* ── pantalla 0 ──────────────────────────────────────────────────────────────────────── */
function pintaInicio() {
  const partes = [];
  if (S.esEjemplo) partes.push(`${esc(t('Estás viendo el ejemplo de demostración.'))} <button class="btn btn-ghost btn-sm" data-ir="4" type="button">${esc(t('Verlo'))}</button>`);
  else if (S.post?.hecho) partes.push(`${esc(t('Tienes un debate terminado.'))} <button class="btn btn-ghost btn-sm" data-ir="4" type="button">${esc(t('Ver el veredicto'))}</button>`);
  else if (enMarcha()) partes.push(`${esc(t('Tienes un debate a medias.'))} <button class="btn btn-ghost btn-sm" data-ir="${S.pre?.hecho ? 3 : 2}" type="button">${esc(t('Seguir'))}</button>`);
  if (S.sesiones.length) partes.push(`${esc(t('{0} debate(s) en este navegador.', S.sesiones.length))} <button class="btn btn-ghost btn-sm" data-ir="6" type="button">${esc(t('Ver progreso'))}</button>`);
  $('inicioProj').innerHTML = partes.join(' · ');
}
$('btnStart').onclick = () => { if (S.esEjemplo) nuevoDebate(false); go(1); };
$('btnEjemplo').onclick = () => { aplicaEjemplo(); guarda(); go(4); toast(t('Ejemplo de demostración: debate ficticio, sin usar la IA')); };
$('btnProg').onclick = () => go(6);
document.addEventListener('click', e => { const b = e.target.closest('[data-ir]'); if (b) go(+b.dataset.ir); });

/* empezar de cero: conserva la configuración (moción, rival, voz) y el histórico */
function nuevoDebate(avisa = true) {
  window.speechSynthesis?.cancel(); paraMicro();
  if (S.esEjemplo) S.formato = 'munk';
  Object.assign(S, {pre: null, post: null, mocionFija: '', langDebate: '', turnos: [], ti: 0, cur: null, fb: null, fbAvisos: [], esEjemplo: false, panel: []});
  errorTurno = ''; guarda(); if (avisa) toast(t('Debate nuevo: la configuración se conserva'));
}

/* ── pantalla 1: moción y rival ──────────────────────────────────────────────────────── */
const opcion = (attr, val, actual, emo, nombre, sub) => `<button class="db-opt" type="button" role="radio" ${attr}="${esc(val)}" aria-checked="${val === actual}"><span class="db-emo">${emo}</span><span><b>${esc(nombre)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span></button>`;
function pintaPrep() {
  const bloq = enMarcha();
  $('avisoReinicio').hidden = !bloq;
  if (bloq) $('avisoReinicio').innerHTML = `${esc(t(S.esEjemplo ? 'Estás viendo el ejemplo. Para preparar tu propio debate, empieza uno nuevo.' : 'Este debate ya está en marcha: la moción, la postura, el rival y el formato no se pueden cambiar.'))} <button class="btn btn-ghost btn-sm" id="btnNuevo" type="button">${ico('refresh')}<span>${esc(t('Empezar un debate nuevo'))}</span></button>`;
  if (bloq) $('btnNuevo').onclick = () => { nuevoDebate(); pintaPrep(); };
  $('sname').value = S.stu;
  const grupos = Object.keys(CATS).map(c => `<optgroup label="${esc(L(CATS[c]))}">${MOCIONES.filter(m => m.cat === c).map(m => `<option value="${m.id}">${esc(L(m))}</option>`).join('')}</optgroup>`).join('');
  $('selMocion').innerHTML = grupos + `<option value="propia">${esc(t('✏️ Escribir mi propia moción'))}</option>`;
  $('selMocion').value = S.mocionId;
  $('mocionTxt').value = mocionTexto(); $('mocionTxt').readOnly = S.mocionId !== 'propia';
  $('lados').innerHTML = [['favor', '👍', t('A favor'), t('Defiendes la moción: abres y cierras el debate.')], ['contra', '👎', t('En contra'), t('Rechazas la moción: respondes a la apertura y cierras antes.')], ['azar', '🎲', t('Al azar'), t('Como en los torneos: la postura te toca.')]]
    .map(([v, e, n, s]) => opcion('data-lado', v, S.lado, e, n, s)).join('');
  $('rivales').innerHTML = RIVALES.map(r => `<button class="db-rival" type="button" role="radio" data-rival="${r.id}" aria-checked="${r.id === S.rivalId}"><span class="db-emo">${r.emoji}</span><b>${esc(r.nombre)}</b><small>${esc(t('{0} años', r.edad))}</small></button>`).join('');
  $('estilos').innerHTML = ESTILOS.map(x => opcion('data-estilo', x.id, S.estilo, x.i, L(x.n), L(x.s))).join('');
  $('niveles').innerHTML = NIVELES.map(x => opcion('data-nivel', x.id, S.nivel, x.i, L(x.n), L(x.s))).join('');
  $('formatos').innerHTML = Object.entries(FORMATOS).map(([k, f]) => opcion('data-formato', k, S.formato, k === 'munk' ? '🏛️' : '⏱️', t('formato.' + k), t('Apertura {0} min · réplica {1} · respuestas {2} · cierre {3} · unos {4} min en total', nfm(f.apertura), nfm(f.replica), nfm(f.respuesta), nfm(f.cierre), Math.round(2 * (f.apertura + f.replica + 2 * f.respuesta + f.cierre) + 2)))).join('');
  $$('#lados button,#rivales button,#estilos button,#niveles button,#formatos button,#selMocion,#mocionTxt').forEach(b => { b.disabled = bloq; });
  $('tSTT').checked = S.stt; $('tTTS').checked = S.tts; $('tAVA').checked = S.ava;
  $('vozNo').hidden = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
const nfm = x => Number(x).toLocaleString(locale());
const f1 = x => (Math.round(x * 10) / 10).toLocaleString(locale()), f2 = x => (Math.round(x * 100) / 100).toLocaleString(locale());
$('sname').addEventListener('input', e => { S.stu = e.target.value; guarda(); });
$('selMocion').addEventListener('change', e => { S.mocionId = e.target.value; guarda(); pintaPrep(); if (S.mocionId === 'propia') $('mocionTxt').focus(); });
$('mocionTxt').addEventListener('input', e => { if (S.mocionId === 'propia') { S.mocionPropia = e.target.value; guarda(); } });
const eligeEn = (id, attr, campo) => $(id).addEventListener('click', e => { const b = e.target.closest(`[${attr}]`); if (!b || b.disabled) return; S[campo] = b.getAttribute(attr); guarda(); pintaPrep(); });
eligeEn('lados', 'data-lado', 'lado'); eligeEn('rivales', 'data-rival', 'rivalId'); eligeEn('estilos', 'data-estilo', 'estilo'); eligeEn('niveles', 'data-nivel', 'nivel'); eligeEn('formatos', 'data-formato', 'formato');
$('tSTT').onchange = e => { S.stt = e.target.checked; guarda(); };
$('tTTS').onchange = e => { S.tts = e.target.checked; if (!S.tts) window.speechSynthesis?.cancel(); guarda(); };
$('tAVA').onchange = e => { S.ava = e.target.checked; guarda(); };

const CAN_NEXT = i => {
  if (i === 1) { const n = palabras(mocionTexto()).length; return n >= 4 ? true : t('Escribe una moción de al menos cuatro palabras.'); }
  if (i === 2) return S.pre?.hecho ? true : t('Pulsa «Que vote el público» antes de empezar el debate.');
  if (i === 3) return debateFin() ? true : t('Completa todas las intervenciones del debate.');
  if (i === 4) return S.post?.hecho ? true : t('Pide la votación final del público.');
  return true;
};

/* ── aviso previo de envío (una vez por sesión de navegador) ──────────────────────────── */
let envioRes = null;
function pideEnvio(muestra, masks = 0) {
  if (ENVIO_OK) return Promise.resolve(true);
  $('envioInfo').innerHTML = `<p class="help" style="margin-top:0">${esc(t('Durante el debate se enviarán a {0} la moción, los perfiles sintéticos del público y las intervenciones (las tuyas y las del rival). Tu nombre no se envía. Datos personales enmascarados en este envío: {1}.', PROV[getProv()].n, masks))}</p><p class="help">${esc(t('Muestra del envío:'))}</p>`;
  $('envioTxt').textContent = muestra.slice(0, 3000) + (muestra.length > 3000 ? '\n…' : '');
  $('envioOk').checked = false; $('envioSi').disabled = true; $('mEnvio').classList.add('on');
  return new Promise(r => { envioRes = r; });
}
function cierraEnvio(v) { $('mEnvio').classList.remove('on'); if (envioRes) { const r = envioRes; envioRes = null; if (v) ENVIO_OK = true; r(v); } }
_cierres.mEnvio = () => cierraEnvio(false);
$('envioOk').onchange = () => { $('envioSi').disabled = !$('envioOk').checked; };
$('envioSi').onclick = () => cierraEnvio(true); $('envioNo').onclick = () => cierraEnvio(false);

/* ── pantalla 2: el público ──────────────────────────────────────────────────────────── */
const llamadasVoto = () => Math.ceil((S.panel.length || S.pob.n) / 10);
function pintaPublico() {
  if (!S.panel.length) { S.pob = limpiaPob(S.pob); S.panel = muestreaPanel(S.pob); guarda(); }
  const bloq = !!S.pre;
  [['pobN', 'n'], ['pobMin', 'edadMin'], ['pobMax', 'edadMax'], ['pobSem', 'semilla']].forEach(([id, k]) => { $(id).value = S.pob[k]; $(id).disabled = bloq; });
  const c = composicion(S.panel), pc = x => Math.round(x / c.n * 100) + ' %';
  const li = (n, v) => `<li><span>${esc(n)}</span><b>${esc(v)}</b></li>`;
  $('pobResumen').innerHTML = `<div class="db-comp">
    <div><h4>${esc(t('Sexo'))}</h4><ul>${li(t('mujeres'), pc(c.sexo[0]))}${li(t('hombres'), pc(c.sexo[1]))}</ul><h4 style="margin-top:10px">${esc(t('Edad'))}</h4><ul>${['18-29', '30-44', '45-64', '65+'].map((x, i) => li(x, pc(c.tramos[i]))).join('')}</ul></div>
    <div><h4>${esc(t('Estudios'))}</h4><ul>${EST_CATS.map((x, i) => li(L(EST_N[x]), pc(c.estudios[i]))).join('')}</ul></div>
    <div><h4>${esc(t('Comunidades con más personas'))}</h4><ul>${c.ccaa.slice(0, 6).map(([k, n]) => li(INE_CCAA[k][0], pc(n))).join('')}</ul></div></div>`;
  $('preCoste').textContent = t('Unas {0} llamadas a la IA en todo el debate: {1} para cada votación del público, 7 durante el debate y 1 para el informe. Usa un modelo económico.', 2 * llamadasVoto() + 8, llamadasVoto());
  pintaVotacion('pre');
}
['pobN', 'pobMin', 'pobMax', 'pobSem'].forEach(id => $(id).addEventListener('change', () => {
  if (S.pre) return;
  S.pob = limpiaPob({n: $('pobN').value, edadMin: $('pobMin').value, edadMax: $('pobMax').value, semilla: $('pobSem').value});
  S.panel = muestreaPanel(S.pob); guarda(); pintaPublico();
}));

function barrasVotos(r, titulo) {
  return `<div class="db-votos">${titulo ? `<b style="font:700 13px var(--mono);color:var(--gris);text-transform:uppercase;letter-spacing:.06em">${esc(titulo)}</b>` : ''}${VOTOS.map(v => `<div class="db-vfila"><b>${esc(ladoN(v))}</b><div class="db-vbar" style="--c:${COLOR_LADO[v]}"><i style="width:${r.pct[v].toFixed(1)}%"></i></div><span class="db-pct" style="color:${COLOR_LADO[v]}">${esc(nf(r.pct[v]))} %</span></div>`).join('')}</div>`;
}
const personaDe = id => S.panel.find(p => p.id === id);
const perfilCorto = p => p ? `${p.id} · ${t(p.sexo)} · ${t('{0} años', p.edad)} · ${INE_CCAA[p.ccaa]?.[0] || ''}` : '';
function pintaVotacion(ronda) {
  const R = S[ronda], zona = ronda === 'pre' ? $('preZona') : null, ids = S.panel.map(p => p.id);
  const btn = $(ronda === 'pre' ? 'btnPre' : 'btnPost'), est = $(ronda === 'pre' ? 'preEstado' : 'postEstado');
  const n = R ? Object.keys(R.votos).length : 0;
  btn.hidden = !!R?.hecho; btn.disabled = ocupado;
  btn.querySelector('span').textContent = R && !R.hecho && n ? t('Continuar la votación ({0} de {1})', n, ids.length) : t(ronda === 'pre' ? 'Que vote el público' : 'Votación final del público');
  if (!ocupado) est.textContent = R?.hecho ? t('Han votado {0} de {1} personas.', n, ids.length) + (R.faltan.length ? ' ' + t('{0} sin voto válido tras reintentarlo: no cuentan.', R.faltan.length) : '') : '';
  if (!zona) return;
  if (!R?.hecho) { zona.innerHTML = ''; return; }
  const r = recuento(R.votos, ids), muestra = S.panel.filter(p => R.votos[p.id]).slice(0, 6);
  zona.innerHTML = barrasVotos(r, '') + avisosVotos(R) +
    `<ul class="db-motivos">${muestra.map(p => `<li>«${esc(R.votos[p.id].motivo)}»<small>${esc(perfilCorto(p))} · ${esc(ladoN(R.votos[p.id].voto))}</small></li>`).join('')}</ul>`;
}
function avisosVotos(R) {
  const cnt = {}; R.avisos.forEach(a => { cnt[a.tipo] = (cnt[a.tipo] || 0) + 1; });
  const partes = Object.entries(cnt).map(([k, v]) => t('aviso.' + k, v));
  return partes.length ? `<p class="aviso">${esc(t('El código descartó o corrigió respuestas de la IA:'))} ${esc(partes.join(' · '))}</p>` : '';
}

/* ── votaciones del público (por lotes de 10, 3 a la vez) ─────────────────────────────── */
const PROMPT_PUBLICO = `Simulas a personas concretas del público de un debate. Cada persona decide por sí misma según su perfil, sus valores probables y su experiencia, como lo haría una persona real: no todo el mundo es neutral ni todo el mundo tiene una opinión firme. No busques el equilibrio ni respondas como un asistente de IA. Respondes SOLO con JSON válido.`;
function mensajePre(lote) {
  return `MOCIÓN: «${S.mocionFija}»
El debate aún no ha empezado. Para cada persona, indica cómo votaría ahora la moción ("favor", "contra" o "indeciso") y un motivo breve en primera persona (máximo 20 palabras).
PERSONAS:
${lote.map(perfilTxt).join('\n')}
Devuelve SOLO: {"votos":[{"id":"P001","voto":"favor|contra|indeciso","motivo":"…"}]} con una entrada por persona y los mismos id.
${INSTR_IDIOMA()}`;
}
const transcripcionPanel = () => S.turnos.map((x, i) => `[${i + 1}] ${FASE_ES[x.fase]} — ${x.quien === 'moderador' ? 'Moderador' : x.lado === 'favor' ? 'Ponente A (a favor)' : 'Ponente B (en contra)'}: ${x.texto}`).join('\n\n');
function mensajePost(lote) {
  return `MOCIÓN: «${S.mocionFija}»
Has asistido a todo el debate. El Ponente A defiende la moción y el Ponente B la rechaza. Juzga lo que has oído, no quién lo dice. Cambiar de opinión es posible pero no obligatorio: la mayoría de la gente solo cambia si un argumento la convence de verdad, y hablar más no es argumentar mejor.
TRANSCRIPCIÓN:
${transcripcionPanel()}

PERSONAS (con su voto ANTES del debate):
${lote.map(p => `${perfilTxt(p)} · antes: ${S.pre.votos[p.id]?.voto || 'indeciso'}`).join('\n')}
Para cada persona: su voto DESPUÉS del debate, un motivo breve en primera persona (máximo 25 palabras), la "cita" (el fragmento del debate que más pesó en su decisión, COPIADO LITERALMENTE de la transcripción: entre 8 y 25 palabras seguidas, sin cambiar nada) y "ponente" ("A" o "B", quien lo dijo).
Devuelve SOLO: {"votos":[{"id":"P001","voto":"favor|contra|indeciso","motivo":"…","cita":"…","ponente":"A|B"}]} con una entrada por persona y los mismos id.
${INSTR_IDIOMA()}`;
}
async function enParalelo(items, n, fn) {
  let i = 0, err = null;
  const trabajador = async () => { while (i < items.length && !err && !parar) { const it = items[i++]; try { await fn(it); } catch (e) { err = err || e; } } };
  await Promise.all(Array.from({length: Math.min(n, items.length)}, trabajador));
  if (err) throw err;
}
async function votacion(ronda) {
  if (ocupado) return;
  if (!pideClave()) return;
  if (ronda === 'pre' && !S.mocionFija) { S.mocionFija = mocionTexto(); S.langDebate = LANG; if (S.lado === 'azar') S.lado = Math.random() < 0.5 ? 'favor' : 'contra'; }
  const lote0 = S.panel.slice(0, 10);
  if (!(await pideEnvio(PROMPT_PUBLICO + '\n\n' + (ronda === 'pre' ? mensajePre(lote0) : mensajePost(lote0))))) { if (ronda === 'pre' && !S.pre) { S.mocionFija = ''; } return; }
  const ids = S.panel.map(p => p.id), R = S[ronda] || (S[ronda] = {votos: {}, avisos: [], faltan: [], hecho: false});
  const est = $(ronda === 'pre' ? 'preEstado' : 'postEstado'), stop = $(ronda === 'pre' ? 'btnPreStop' : 'btnPostStop');
  const progreso = () => { est.innerHTML = `<span class="spin"></span> ${esc(t('Votando: {0} de {1} personas…', Object.keys(R.votos).length, ids.length))}`; };
  const pide = async lote => {
    const raw = await llmJSON([{role: 'system', content: PROMPT_PUBLICO}, {role: 'user', content: ronda === 'pre' ? mensajePre(lote) : mensajePost(lote)}], {max: ronda === 'pre' ? 1500 : 2600});
    const v = validaVotos(raw, lote.map(p => p.id), ronda === 'post' ? S.turnos : null);
    Object.assign(R.votos, v.votos); R.avisos.push(...v.avisos); progreso(); guarda();
  };
  ocupado = true; parar = false; stop.hidden = false; pintaVotacion(ronda); progreso();
  try {
    await enParalelo(chunk(S.panel.filter(p => !R.votos[p.id]), 10), 3, pide);
    if (parar) { est.textContent = t('Votación detenida: {0} de {1} personas han votado. Puedes continuarla.', Object.keys(R.votos).length, ids.length); return; }
    const faltan = S.panel.filter(p => !R.votos[p.id]);
    if (faltan.length) { R.avisos.push({tipo: 'reintento', n: faltan.length}); await enParalelo(chunk(faltan, 10), 3, pide); }
    R.faltan = ids.filter(id => !R.votos[id]); R.hecho = true;
    if (ronda === 'post') guardaSesion();
    await guardaYa();
    toast(t(ronda === 'pre' ? 'El público ha votado. Ya puedes empezar el debate.' : 'Votación final lista'));
  } catch (e) {
    await guardaYa(); est.textContent = e.message; toast(e.message, 9000);
  } finally {
    ocupado = false; stop.hidden = true; pintaVotacion(ronda); if (ronda === 'post') pintaVeredicto(); else pintaPublico(); updateNav();
  }
}
$('btnPre').onclick = () => votacion('pre');
$('btnPost').onclick = () => votacion('post');
$('btnPreStop').onclick = $('btnPostStop').onclick = () => { parar = true; toast(t('Deteniendo cuando terminen las llamadas en curso…')); };

/* ── pantalla 3: el debate ───────────────────────────────────────────────────────────── */
function introModerador() {
  const r = S.pre?.hecho ? recuento(S.pre.votos, S.panel.map(p => p.id)) : null;
  return t('Bienvenidos. Se debate la moción «{0}». Antes de empezar, el público ha votado: {1} % a favor, {2} % en contra y {3} % indecisos. Gana quien más votos consiga mover. Abre el debate quien defiende la moción.', S.mocionFija, nf(r?.pct.favor || 0), nf(r?.pct.contra || 0), nf(r?.pct.indeciso || 0));
}
function pintaDebate() {
  const rv = rivalActual(), est = ESTILOS.find(x => x.id === S.estilo), niv = NIVELES.find(x => x.id === S.nivel);
  $('debMocion').textContent = S.mocionFija ? t('Moción: «{0}». Tú defiendes: {1}.', S.mocionFija, ladoN(S.lado)) : t('Primero, que vote el público.');
  $('rivalCab').innerHTML = `<span class="db-cara">${rv.emoji}</span><div><b>${esc(rv.nombre)}</b><small>${esc(t('{0} años · {1} · estilo {2} · nivel {3}', rv.edad, ladoN(otroLado(S.lado)), L(est.n).toLowerCase(), L(niv.n).toLowerCase()))}</small></div>`;
  const m = $('msgs'); m.innerHTML = '';
  if (S.pre?.hecho) ponMensaje({quien: 'moderador', fase: 'intro', texto: introModerador()}, -1);
  S.turnos.forEach((x, i) => ponMensaje(x, i));
  pintaPlan(); pintaEntrada(); avatarMuestra();
  if (S.pre?.hecho && !debateFin() && plan()[S.ti].quien !== 'estudiante' && !ocupado && !errorTurno && !S.esEjemplo) avanza();
}
function pintaPlan() {
  const p = plan();
  $('plan').innerHTML = p.map((x, i) => `<li class="${i < S.ti ? 'hecho' : i === S.ti ? 'ahora' : ''}"><span>${i < S.ti ? '✓' : i + 1}</span><span>${esc(faseN(x.fase))}${x.lado ? ' · ' + esc(ladoN(x.lado)) : ''}${x.min ? ` · ${esc(nfm(x.min))}′` : ''}</span><span class="db-quien">${esc(x.quien === 'estudiante' ? t('Tú') : x.quien === 'rival' ? nombreRival() : t('Moderador'))}</span></li>`).join('');
}
function ponMensaje(x, i) {
  const d = document.createElement('div'), rv = rivalActual();
  d.className = 'db-msg ' + x.quien;
  const rol = x.quien === 'estudiante' ? (S.stu || t('Tú')) : x.quien === 'rival' ? rv.nombre : t('Moderador');
  const av = x.quien === 'estudiante' ? '🎤' : x.quien === 'rival' ? rv.emoji : '⚖️';
  const fase = x.fase === 'intro' ? '' : ' · ' + faseN(x.fase) + (x.lado ? ' · ' + ladoN(x.lado) : '');
  const voz = 'speechSynthesis' in window && x.quien !== 'estudiante' ? `<button class="db-tts" type="button" data-leer="${i}" aria-label="${esc(t('Leer en voz alta'))}">🔊</button>` : '';
  const notas = [];
  if (x.cifras?.length) notas.push(t('⚠ Cifras que no estaban en la moción ni en tus intervenciones: {0}. No las des por buenas sin comprobarlas.', x.cifras.join(', ')));
  if (x.recortado) notas.push(t('Recortada por el código: se pasaba mucho de su tiempo.'));
  if (x.quien === 'estudiante' && x.min) { const mt = metricasTurno(x, lgD()); notas.push(t('{0} palabras · unos {1} hablando de {2} disponibles', mt.palabras, mmss(mt.segEst), mmss(mt.limite)) + (mt.fuera ? ' · ' + t('fuera de tiempo') : '')); }
  d.innerHTML = `<div class="db-av">${av}</div><div class="db-burbuja"><span class="db-rol">${esc(rol + fase)}${voz}</span>${esc(x.texto).replace(/\n/g, '<br>')}${notas.map(n => `<span class="db-nota">${esc(n)}</span>`).join('')}</div>`;
  $('msgs').appendChild(d); const m = $('msgs'); m.scrollTop = m.scrollHeight;
}
$('msgs').addEventListener('click', e => { const b = e.target.closest('[data-leer]'); if (!b) return; const i = +b.dataset.leer; const x = i < 0 ? {quien: 'moderador', texto: introModerador()} : S.turnos[i]; lee(x.texto, x.quien, b); });

function pintaEntrada() {
  const p = plan()[S.ti], mio = !!(S.pre?.hecho && p && p.quien === 'estudiante' && !S.esEjemplo);
  $('cin').disabled = !mio; $('btnSend').disabled = !mio || ocupado;
  const cerrado = !mio && (S.esEjemplo || debateFin() || !S.pre?.hecho);
  $('cin').hidden = cerrado; $('btnSend').closest('.db-entrada-pie').hidden = cerrado;
  $('btnMic').hidden = !(mio && S.stt && (window.SpeechRecognition || window.webkitSpeechRecognition));
  if (!S.pre?.hecho) $('turnoTxt').textContent = t('El debate empieza cuando el público haya votado.');
  else if (S.esEjemplo) $('turnoTxt').textContent = t('Debate de demostración: puedes leerlo entero y ver el veredicto.');
  else if (debateFin()) $('turnoTxt').textContent = t('Debate terminado. Pasa al veredicto del público.');
  else if (mio) $('turnoTxt').textContent = t('Te toca: {0} ({1} min). El tiempo empieza cuando escribes o dictas.', faseN(p.fase), nfm(p.min));
  else $('turnoTxt').textContent = t('Turno de {0}…', p.quien === 'rival' ? nombreRival() : t('Moderador'));
  if (errorTurno && !mio && !debateFin()) $('estadoChat').innerHTML = `${esc(errorTurno)} <button class="btn btn-ghost btn-sm" id="btnReintenta" type="button">${ico('refresh')}<span>${esc(t('Reintentar'))}</span></button>`;
  else if (!ocupado) $('estadoChat').textContent = '';
  if ($('btnReintenta')) $('btnReintenta').onclick = () => { errorTurno = ''; avanza(); };
  if (mio && S.cur?.texto && !$('cin').value) $('cin').value = S.cur.texto;
  if (!mio) $('cin').value = '';
  pintaReloj(); arrancaReloj();
}
/* reloj del turno: cuenta atrás desde el límite de la fase; tiempo negativo = fuera de tiempo */
const segTurno = () => S.cur?.t0 ? (Date.now() - S.cur.t0) / 1000 : 0;
function pintaReloj() {
  const p = plan()[S.ti], mio = p && p.quien === 'estudiante' && S.pre?.hecho && !S.esEjemplo;
  if (!mio) { $('relojFase').textContent = debateFin() ? t('Debate terminado') : p ? faseN(p.fase) : ''; $('relojT').textContent = '—'; $('relojT').className = 'db-tiempo'; $('relojS').textContent = ''; $('relojBar').style.width = '0%'; $('cuentaTxt').textContent = ''; return; }
  const lim = p.min * 60, s = segTurno(), resta = lim - s, n = palabras($('cin').value).length, est = n / PPM_EST * 60;
  $('relojFase').textContent = t('Te toca') + ' · ' + faseN(p.fase);
  $('relojT').textContent = (resta < 0 ? '+' : '') + mmss(Math.abs(resta)); $('relojT').className = 'db-tiempo' + (resta < 0 ? ' pasado' : '');
  $('relojS').textContent = S.cur?.t0 ? t('de {0} disponibles', mmss(lim)) : t('Empieza cuando escribas o dictes');
  $('relojBar').style.width = Math.min(100, s / lim * 100) + '%';
  $('cuentaTxt').textContent = t('{0} palabras ≈ {1} hablando (de {2})', n, mmss(est), mmss(lim)) + (est > lim * 1.1 ? ' · ' + t('te pasas de tiempo') : '');
}
function arrancaReloj() { clearInterval(reloj); if (S.cur?.t0 && step === 3) reloj = setInterval(pintaReloj, 500); }
function empiezaTurno() { if (!S.cur || S.cur.ti !== S.ti) S.cur = {ti: S.ti, t0: null, segMic: 0, dictado: false, texto: ''}; if (!S.cur.t0) { S.cur.t0 = Date.now(); arrancaReloj(); } }
$('cin').addEventListener('input', () => { empiezaTurno(); S.cur.texto = $('cin').value; guarda(); pintaReloj(); });

async function enviaTurno() {
  const p = plan()[S.ti];
  if (!p || p.quien !== 'estudiante' || ocupado) return;
  const bruto = $('cin').value.trim();
  if (palabras(bruto).length < 10) return toast(t('Tu intervención necesita al menos diez palabras.'));
  paraMicro(); empiezaTurno();
  const {t: limpio, n} = scrub(bruto, S.stu);
  if (n) toast(t('Se han enmascarado {0} dato(s) personales de tu intervención.', n));
  S.turnos.push({...p, texto: limpio, seg: Math.round(segTurno()), dictado: !!S.cur.dictado, segMic: Math.round(S.cur.segMic || 0), enmasc: n});
  S.ti++; S.cur = null; $('cin').value = ''; clearInterval(reloj);
  await guardaYa();
  ponMensaje(S.turnos.at(-1), S.turnos.length - 1); pintaPlan(); pintaEntrada();
  if (debateFin()) { toast(t('Debate terminado. Pasa al veredicto del público.')); updateNav(); return; }
  avanza();
}
$('btnSend').onclick = enviaTurno;
$('cin').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); enviaTurno(); } });

/* turnos de la IA (rival y moderador) hasta que le toque al estudiante */
let enCurso = false;
async function avanza() {
  if (enCurso || S.esEjemplo) return;
  if (!pideClave()) { errorTurno = t('Pega tu clave de IA para continuar'); pintaEntrada(); return; }
  enCurso = true; ocupado = true; errorTurno = '';
  try {
    while (!debateFin() && plan()[S.ti].quien !== 'estudiante') {
      const p = plan()[S.ti];
      const muestra = p.quien === 'rival' ? PROMPT_RIVAL() + '\n\n' + mensajeRival(p) : mensajeModerador();
      if (!(await pideEnvio(muestra))) { errorTurno = t('Envío cancelado.'); break; }
      $('estadoChat').innerHTML = `<span class="spin"></span> ${esc(t('{0} está preparando su intervención…', p.quien === 'rival' ? nombreRival() : t('El moderador')))}`;
      await turnoIA(p);
    }
  } catch (e) { errorTurno = e.message; toast(e.message, 9000); }
  finally { enCurso = false; ocupado = false; if (step === 3) { pintaPlan(); pintaEntrada(); } updateNav(); }
}
const PROMPT_RIVAL = () => {
  const r = rivalActual();
  return `Participas en un debate formal de entrenamiento al estilo de los Munk Debates. Eres ${r.nombre}, ${r.edad} años, y ${S.lado === 'favor' ? 'RECHAZAS' : 'DEFIENDES'} la moción «${S.mocionFija}». Tu rival es un estudiante que practica oratoria.
ESTILO: ${ESTILOS.find(x => x.id === S.estilo).p}
NIVEL: ${NIVELES.find(x => x.id === S.nivel).p}
REGLAS: hablas en voz alta ante un público, así que escribes prosa oral: sin listas, sin títulos, sin markdown y sin acotaciones. No inventes estadísticas, estudios, fechas ni citas de personas reales; si usas una cifra, preséntala como ejemplo ilustrativo. No digas que eres una IA. Sé firme pero respetuoso: nada de insultos ni ataques personales. Mantén tu postura durante todo el debate y no la cambies aunque te convenzan.
Habla en ${IA_LANG[lgD()] || 'español'}.`;
};
const FASE_PIDE = {
  apertura: 'tu discurso de apertura: presenta tu tesis y tus dos o tres argumentos principales',
  replica: 'tu réplica: responde a los argumentos concretos de tu rival, refiriéndote a lo que ha dicho, y refuerza los tuyos',
  respuesta: 'tu respuesta a la última pregunta del moderador: contéstala directamente y aprovecha para rebatir a tu rival',
  cierre: 'tu cierre: resume por qué tu postura ha ganado el debate y dirígete al público indeciso'
};
const transcripcionDe = yo => S.turnos.map(x => `[${FASE_ES[x.fase]} — ${x.quien === 'moderador' ? 'Moderador' : x.quien === yo ? 'Tú' : 'Tu rival'}] ${x.texto}`).join('\n\n') || '(todavía no ha hablado nadie)';
const mensajeRival = p => `DEBATE HASTA AHORA:\n${transcripcionDe('rival')}\n\nAHORA TE TOCA ${FASE_PIDE[p.fase]}. Extensión: unas ${Math.round(p.min * PPM_RIVAL)} palabras (${nfm(p.min)} minutos hablando). Responde solo con tu intervención.`;
const mensajeModerador = () => `Moderas un debate al estilo de los Munk Debates sobre la moción «${S.mocionFija}». Eres neutral y no das tu opinión.
DEBATE HASTA AHORA:
${S.turnos.map(x => `[${FASE_ES[x.fase]} — ${x.quien === 'moderador' ? 'Moderador' : x.lado === 'favor' ? 'Ponente a favor' : 'Ponente en contra'}] ${x.texto}`).join('\n\n')}

Formula UNA pregunta incisiva para los dos ponentes sobre el punto de desacuerdo más importante que aún no se ha aclarado${S.turnos.some(x => x.fase === 'pregunta') ? ', distinta de la pregunta anterior' : ''}. Máximo 40 palabras. Responde solo con la pregunta, en ${IA_LANG[lgD()] || 'español'}.`;
async function turnoIA(p) {
  let texto, extra = {};
  if (p.quien === 'moderador') {
    texto = limpiaDiscurso(await llm([{role: 'system', content: 'Eres el moderador neutral de un debate.'}, {role: 'user', content: mensajeModerador()}], {max: 200}));
  } else {
    const r = rivalActual(), obj = Math.round(p.min * PPM_RIVAL);
    const raw = limpiaDiscurso(await llm([{role: 'system', content: PROMPT_RIVAL()}, {role: 'user', content: mensajeRival(p)}], {max: Math.round(obj * 2.6) + 200}), r.nombre);
    const rc = recortaPalabras(raw, obj); texto = rc.texto;
    const contexto = [S.mocionFija, ...S.turnos.filter(x => x.quien !== 'rival').map(x => x.texto)].join('\n');
    extra = {recortado: rc.recortado, cifras: numerosNuevos(texto, contexto), seg: Math.round(palabras(texto).length / PPM_EST * 60)};
  }
  if (!texto || palabras(texto).length < 3) throw new Error(t('La IA devolvió una intervención vacía. Pulsa «Reintentar».'));
  S.turnos.push({...p, texto, ...extra}); S.ti++;
  await guardaYa();
  if (step === 3) { ponMensaje(S.turnos.at(-1), S.turnos.length - 1); pintaPlan(); }
  if (S.tts) habla(texto, p.quien);
}
$('btnReinicia').onclick = () => {
  if (!S.turnos.length || S.esEjemplo) return toast(S.esEjemplo ? t('El ejemplo no se puede reiniciar: prepara tu propio debate.') : t('El debate aún no ha empezado.'));
  if (!confirm(t('¿Reiniciar el debate? Se borran las intervenciones; la votación previa se conserva.'))) return;
  window.speechSynthesis?.cancel(); paraMicro();
  Object.assign(S, {turnos: [], ti: 0, cur: null, post: null, fb: null, fbAvisos: []}); errorTurno = ''; guarda(); pintaDebate();
};

/* ── voz: dictado y lectura (las hace el navegador; el audio no sale del dispositivo) ── */
let reconocedor = null, escuchando = false, quiereEscuchar = false, micDesde = 0, baseDictado = '';
function alternaMicro() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return toast(t('Este navegador no admite dictado.'));
  if (quiereEscuchar) return paraMicro();
  window.speechSynthesis?.cancel(); avatarCalla();
  empiezaTurno(); S.cur.dictado = true; quiereEscuchar = true; arrancaMicro(SR);
}
function arrancaMicro(SR) {
  reconocedor = new SR();
  reconocedor.lang = LOCALE[lgD()] || locale(); reconocedor.continuous = true; reconocedor.interimResults = true;
  baseDictado = $('cin').value.trim();
  reconocedor.onstart = () => { escuchando = true; micDesde = Date.now(); $('btnMic').classList.add('escuchando'); $('micTxt').textContent = t('Parar'); $('estadoChat').textContent = t('Escuchando…'); };
  reconocedor.onend = () => {
    if (micDesde && S.cur) S.cur.segMic = (S.cur.segMic || 0) + (Date.now() - micDesde) / 1000; micDesde = 0; escuchando = false;
    if (quiereEscuchar && plan()[S.ti]?.quien === 'estudiante') { try { arrancaMicro(SR); return; } catch (e) {} }   // Chrome corta tras un silencio: se reanuda
    quiereEscuchar = false; $('btnMic').classList.remove('escuchando'); $('micTxt').textContent = t('Dictar'); $('estadoChat').textContent = ''; guarda();
  };
  reconocedor.onerror = ev => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { quiereEscuchar = false; toast(t('El navegador no tiene permiso para usar el micrófono.')); } };
  reconocedor.onresult = ev => {
    const txt = [...ev.results].map(r => r[0].transcript).join(' ').replace(/\s+/g, ' ').trim();
    $('cin').value = (baseDictado ? baseDictado + ' ' : '') + txt; S.cur.texto = $('cin').value; pintaReloj();
  };
  reconocedor.start();
}
function paraMicro() { quiereEscuchar = false; try { reconocedor?.stop(); } catch (e) {} }
$('btnMic').onclick = alternaMicro;
/* iOS solo deja hablar al navegador si la PRIMERA locución sale de un gesto de la persona: se «desbloquea» en el primer toque */
let vozDesbloqueada = false;
function desbloqueaVoz() {
  if (vozDesbloqueada || !('speechSynthesis' in window)) return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); vozDesbloqueada = true; } catch (e) {}
}
document.addEventListener('pointerdown', desbloqueaVoz, {once: true});
document.addEventListener('keydown', desbloqueaVoz, {once: true});
if ('speechSynthesis' in window) { try { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); } catch (e) {} }
/* voz por sexo del rival según el nombre de la voz (aproximado: el navegador no dice el sexo de sus voces) */
const VOZ_H = /\b(pablo|jorge|diego|enrique|juan|carlos|ra[uú]l|[aá]lvaro|miguel|antonio|daniel|david|george|james|thomas|arthur|oliver|fred|alex|duarte|cristiano|joaquim|ricardo|tiago|male|hombre|homem)\b/i;
const VOZ_M = /\b(helena|laura|luc[ií]a|elvira|paulina|m[oó]nica|sabina|samantha|karen|kate|serena|susan|hazel|zira|joana|catarina|raquel|fernanda|in[eê]s|female|mujer|mulher|google)\b/i;
function vocesDe(lang) { const b = (LOCALE[lang] || 'es-ES').split('-')[0]; return ('speechSynthesis' in window ? window.speechSynthesis.getVoices() : []).filter(v => v.lang.toLowerCase().startsWith(b)); }
function vozPara(quien) {
  const vs = vocesDe(lgD()); if (!vs.length) return null;
  const rx = rivalActual().sexo === 'hombre' ? VOZ_H : VOZ_M;
  const rival = vs.find(v => rx.test(v.name) && v.localService) || vs.find(v => rx.test(v.name)) || vs[0];
  return quien === 'rival' ? rival : (vs.find(v => v !== rival) || rival);
}
function habla(texto, quien) {
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = LOCALE[lgD()] || locale(); u.rate = 1; const v = vozPara(quien); if (v) u.voice = v;
  if (quien === 'rival') avatarHabla(u, texto);
  setTimeout(() => { try { window.speechSynthesis.speak(u); } catch (e) {} }, 60);
  return u;
}
function lee(texto, quien, boton) {
  if (!('speechSynthesis' in window)) return;
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) { window.speechSynthesis.cancel(); avatarCalla(); if (boton.textContent === '⏹') { boton.textContent = '🔊'; return; } }
  const u = habla(texto, quien); boton.textContent = '⏹'; u.addEventListener('end', () => { boton.textContent = '🔊'; }); u.addEventListener('error', () => { boton.textContent = '🔊'; });
}

/* ── pantalla 4: el veredicto ────────────────────────────────────────────────────────── */
function guardaSesion() {
  if (S.esEjemplo) return;
  const ve = veredicto(S.pre.votos, S.post.votos, S.panel.map(p => p.id)), me = metricasEstudiante(S.turnos, lgD());
  S.sesiones = [{
    fecha: new Date().toISOString(), mocion: S.mocionFija, lado: S.lado, rival: nombreRival(), estilo: S.estilo, nivel: S.nivel, formato: S.formato, lang: lgD(),
    resultado: ve.ganador === 'empate' ? 'empate' : ve.ganador === S.lado ? 'gana' : 'pierde', ganMia: ve.ganancia[S.lado], ganRival: ve.ganancia[otroLado(S.lado)],
    ventaja: ve.ganancia[S.lado] - ve.ganancia[otroLado(S.lado)], palabras: me.palabras, mulPor100: me.mulPor100, personas: ve.comunes
  }, ...S.sesiones].slice(0, 200);
}
const pp = x => (x > 0 ? '+' : x < 0 ? '−' : '±') + nf(Math.abs(x));
function pintaVeredicto() {
  const z = $('verZona'), ids = S.panel.map(p => p.id);
  $('postCard').hidden = !!S.post?.hecho;
  if (!debateFin()) { $('postCard').hidden = true; z.innerHTML = `<div class="card"><p class="empty">${esc(t('El veredicto llega cuando termina el debate.'))}</p></div>`; return; }
  $('postCoste').textContent = t('El público lee la transcripción completa, sin saber quién es el estudiante, y vuelve a votar. Son {0} llamadas a la IA.', llamadasVoto());
  pintaVotacion('post');
  if (!S.post?.hecho) { z.innerHTML = ''; return; }
  const ve = veredicto(S.pre.votos, S.post.votos, ids), yo = S.lado, el = otroLado(yo), rv = rivalActual();
  const gano = ve.ganador === yo, emp = ve.ganador === 'empate';
  const me = metricasEstudiante(S.turnos, lgD()), palRival = palabras(S.turnos.filter(x => x.quien === 'rival').map(x => x.texto).join(' ')).length;
  const lado = (l, quien) => `<div class="db-lado ${ve.ganador === l ? 'gana' : ''}"><h4>${esc(quien)} · ${esc(ladoN(l))}</h4><span class="db-gan" style="color:${COLOR_LADO[l]}">${esc(pp(ve.ganancia[l]))}</span> <small>${esc(t('puntos'))}</small><p class="help" style="margin:4px 0 0">${esc(t('{0} % antes → {1} % después', nf(ve.pre.pct[l]), nf(ve.post.pct[l])))}</p></div>`;
  const dec = citasDecisivas(S.pre.votos, S.post.votos, S.turnos).slice(0, 5);
  const cambian = S.panel.filter(p => S.pre.votos[p.id] && S.post.votos[p.id] && S.pre.votos[p.id].voto !== S.post.votos[p.id].voto).slice(0, 8);
  const sinCita = Object.values(S.post.votos).filter(v => v.cita && !v.citaOk).length;
  const quienEs = x => x.quien === 'estudiante' ? t('Tú') : rv.nombre;
  z.innerHTML = `
  ${S.esEjemplo ? `<div class="aviso">${esc(t('Debate de demostración ficticio: los votos del público los ha generado el código con una semilla fija, no la IA.'))}</div>` : ''}
  <div class="card"><div class="db-ganador" style="--c:${emp ? 'var(--tinta)' : gano ? 'var(--forjado)' : 'var(--aviso)'}"><span class="db-emo">${emp ? '🤝' : gano ? '🏆' : '🎯'}</span><div>
    <b>${esc(emp ? t('Empate') : gano ? t('Ganas el debate') : t('Gana {0}', rv.nombre))}</b>
    <small>${esc(t('{0} movió {1} puntos y {2}, {3}. Cambiaron de voto {4} de {5} personas.', S.stu || t('Tu lado'), pp(ve.ganancia[yo]), rv.nombre, pp(ve.ganancia[el]), ve.cambian, ve.comunes))}</small></div></div>
    <div class="db-duelo" style="margin-top:14px">${lado(yo, S.stu || t('Tú'))}${lado(el, rv.nombre)}</div>
    ${ve.excluidos ? `<p class="help">${esc(t('{0} persona(s) no tienen voto válido en alguna de las dos rondas y no cuentan en el recuento.', ve.excluidos))}</p>` : ''}</div>
  <div class="card"><h3 class="an-h3">${esc(t('Antes y después'))}</h3><div class="db-duelo">${barrasVotos(ve.pre, t('Antes del debate'))}${barrasVotos(ve.post, t('Después del debate'))}</div>
    <h4 class="db-h4">${esc(t('Cómo se movieron los votos'))}</h4><div class="table-wrap"><table class="db-tr"><tr><th>${esc(t('Antes ↓ · Después →'))}</th>${VOTOS.map(v => `<th>${esc(ladoN(v))}</th>`).join('')}</tr>${VOTOS.map(a => `<tr><th>${esc(ladoN(a))}</th>${VOTOS.map(b => `<td class="${a === b ? 'db-diag' : ''}">${ve.transiciones[a][b]}</td>`).join('')}</tr>`).join('')}</table></div>
    <p class="help">${esc(t('Palabras de cada ponente: tú {0}, {1} {2}. Un público sintético puede premiar los discursos más largos: tenlo en cuenta al leer el resultado.', me.palabras, rv.nombre, palRival))}</p></div>
  <div class="card"><h3 class="an-h3">${esc(t('Lo que más pesó en el público'))}</h3>
    ${dec.length ? dec.map(d => `<div class="db-cita" style="--c:${COLOR_LADO[d.lado]}">«${esc(d.cita)}»<small>${esc(quienEs(d))} · ${esc(faseN(d.fase))} · ${esc(t('{0} persona(s) citan esta intervención; {1} cambiaron su voto a este lado', d.n, d.atraidos))}</small></div>`).join('') : `<p class="empty">${esc(t('Ninguna persona dio una cita que aparezca literalmente en el debate.'))}</p>`}
    <p class="help">${esc(t('Solo cuentan las citas que el código ha encontrado literalmente en la transcripción. {0} cita(s) no aparecían y se han descartado.', sinCita))}</p></div>
  ${cambian.length ? `<div class="card"><h3 class="an-h3">${esc(t('Quién cambió de opinión y por qué'))}</h3><ul class="db-motivos">${cambian.map(p => { const v = S.post.votos[p.id]; return `<li>«${esc(v.motivo)}»${v.cita ? `<br><span class="${v.citaOk ? 'db-ok' : 'db-ko'}">${v.citaOk ? '✓' : '⚠'}</span> <i>${esc(v.cita)}</i>` : ''}<small>${esc(perfilCorto(p))} · ${esc(ladoN(S.pre.votos[p.id].voto))} → ${esc(ladoN(v.voto))}</small></li>`; }).join('')}</ul></div>` : ''}
  <div class="card"><details><summary><b>${esc(t('Ver a todo el público ({0} personas)', S.panel.length))}</b></summary><div class="db-tabla table-wrap" style="margin-top:10px"><table><thead><tr><th>ID</th><th>${esc(t('Perfil'))}</th><th>${esc(t('Antes'))}</th><th>${esc(t('Después'))}</th><th>${esc(t('Motivo'))}</th><th>${esc(t('Cita'))}</th></tr></thead><tbody>
    ${S.panel.map(p => { const a = S.pre.votos[p.id], b = S.post.votos[p.id]; return `<tr><td>${p.id}</td><td>${esc(t(p.sexo))}, ${p.edad}, ${esc(INE_CCAA[p.ccaa][0])}, ${esc(L(EST_N[p.estudios]))}</td><td>${esc(a ? ladoN(a.voto) : '—')}</td><td>${esc(b ? ladoN(b.voto) : '—')}</td><td>${esc(b?.motivo || '')}</td><td>${b?.cita ? `<span class="${b.citaOk ? 'db-ok' : 'db-ko'}">${b.citaOk ? '✓' : '⚠'}</span> ${esc(b.cita)}` : ''}</td></tr>`; }).join('')}</tbody></table></div></details>
    ${avisosVotos(S.post)}
    <div class="actions"><button class="btn btn-ghost btn-sm" id="btnCsvPub" type="button">${ico('download')}<span>${esc(t('Votos del público (CSV)'))}</span></button></div></div>`;
  $('btnCsvPub').onclick = descargaCSV;
}

/* ── pantalla 5: el informe de oratoria ──────────────────────────────────────────────── */
const PROMPT_FB = 'Eres profesor de oratoria y debate. Das comentarios formativos, concretos y respetuosos, sin poner nota ni puntuación global. Respondes SOLO con JSON válido.';
function mensajeFB() {
  const ve = veredicto(S.pre.votos, S.post.votos, S.panel.map(p => p.id)), me = metricasEstudiante(S.turnos, lgD());
  let e = 0, r = 0;
  const tr = S.turnos.map(x => { const et = x.quien === 'estudiante' ? `E${++e} · ESTUDIANTE` : x.quien === 'rival' ? `R${++r} · RIVAL` : 'MODERADOR'; return `[${et} · ${FASE_ES[x.fase]}] ${x.texto}`; }).join('\n\n');
  return `MOCIÓN: «${S.mocionFija}». El estudiante ${S.lado === 'favor' ? 'defendía' : 'rechazaba'} la moción frente a un rival de estilo ${S.estilo} y nivel ${S.nivel}.
TRANSCRIPCIÓN (E1…E${e} son las intervenciones del estudiante):
${tr}

DATOS CALCULADOS POR EL CÓDIGO (no los recalcules): público ${ve.comunes} personas; el lado del estudiante ganó ${ve.ganancia[S.lado].toFixed(1)} puntos y el del rival ${ve.ganancia[otroLado(S.lado)].toFixed(1)}. El estudiante dijo ${me.palabras} palabras; ${me.fuera} intervenciones fuera de tiempo; posibles muletillas: ${me.nMul} (${Object.keys(me.muletillas).join(', ') || 'ninguna'}); conectores: ${me.nCon}.
RÚBRICA (elige el nivel 0-3 de cada dimensión):
${RUBRICA.map(d => `- ${d.id}: ${d.d.es.map((x, i) => `${i}=${x}`).join('; ')}`).join('\n')}
Cada "cita" debe ser un fragmento COPIADO LITERALMENTE de una intervención del ESTUDIANTE (entre 6 y 25 palabras seguidas). En "momentos", "turno" es el número de la intervención del estudiante (1 a ${e}).
Devuelve SOLO este JSON:
{"resumen":"3-4 frases","rubrica":{${RUBRICA.map(d => `"${d.id}":{"nivel":0,"comentario":"","cita":""}`).join(',')}},"momentos":[{"turno":1,"tipo":"acierto|oportunidad","cita":"","comentario":""}],"fortalezas":["",""],"mejoras":["",""],"ejercicio":"un ejercicio concreto para el próximo debate"}
${INSTR_IDIOMA()}`;
}
async function pideFB() {
  if (ocupado || !S.post?.hecho) return;
  if (!pideClave()) return;
  if (!(await pideEnvio(PROMPT_FB + '\n\n' + mensajeFB()))) return;
  ocupado = true; $('fbEstado').innerHTML = `<span class="spin"></span> ${esc(t('Preparando los comentarios…'))}`; $('btnFB').disabled = true;
  try {
    const raw = await llmJSON([{role: 'system', content: PROMPT_FB}, {role: 'user', content: mensajeFB()}], {max: 2600});
    const r = revisaFeedback(raw, S.turnos); S.fb = r.fb; S.fbAvisos = r.avisos;
    await guardaYa(); toast(t('Comentarios listos'));
  } catch (e) { toast(e.message, 9000); }
  finally { ocupado = false; pintaInforme(); }
}
function textoAvisoFB(a) {
  const dim = a.campo && RUBRICA.find(d => d.id === a.campo);
  if (a.tipo === 'nivel_falta') return t('sin nivel en «{0}»', L(dim.n));
  if (a.tipo === 'nivel_fuera') return t('nivel {0} fuera de la escala en «{1}» (se recortó)', a.dado, L(dim.n));
  if (a.tipo === 'cita_no_verificada') return t('una cita no aparece en tus intervenciones');
  if (a.tipo === 'turno_corregido') return t('la intervención {0} era en realidad la {1}', a.dado, a.calculado);
  if (a.tipo === 'nota') return t('el comentario incluía una nota, que esta herramienta no pone');
  return a.tipo;
}
const metrica = (v, n, s, cls = '') => `<div class="db-met ${cls}"><b>${esc(v)}</b><small>${esc(n)}${s ? ` · ${esc(s)}` : ''}</small></div>`;
function pintaInforme() {
  const z = $('infZona');
  if (!debateFin() || !S.turnos.some(x => x.quien === 'estudiante')) { z.innerHTML = `<div class="card"><p class="empty">${esc(t('El informe aparece cuando termina el debate.'))}</p></div>`; return; }
  const me = metricasEstudiante(S.turnos, lgD()), fb = S.fb;
  const topMul = Object.entries(me.muletillas).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} (${v})`).join(', ');
  z.innerHTML = `
  ${S.esEjemplo ? `<div class="aviso">${esc(t('Debate de demostración ficticio: los comentarios vienen de serie con la app, no los ha generado la IA. Las métricas sí las calcula el código.'))}</div>` : ''}
  <div class="card"><h3 class="an-h3">${esc(t('Lo que mide el código'))}</h3><div class="db-metricas">
    ${metrica(nf(me.palabras), t('palabras en {0} intervenciones', me.turnos.length))}
    ${metrica(`${me.fuera} / ${me.turnos.length}`, t('intervenciones fuera de tiempo'), me.cortos ? t('{0} demasiado cortas', me.cortos) : '', me.fuera ? 'alerta' : 'bien')}
    ${metrica(me.ppm ? nf(me.ppm) : '—', t('palabras por minuto al dictar'), me.ppm ? t('conversación: unas 130-160') : t('solo si usas el dictado'))}
    ${metrica(f1(me.mulPor100), t('posibles muletillas cada 100 palabras'), topMul, me.mulPor100 >= 2 ? 'alerta' : 'bien')}
    ${metrica(f1(me.conPor100), t('conectores cada 100 palabras'), '')}
    ${metrica(f2(me.mattr), t('diversidad léxica (MATTR, 0-1)'), '')}
    ${metrica(nf(me.mediaFrase), t('palabras por frase de media'), me.mediaFrase > 30 ? t('frases largas: cuesta seguirlas al oído') : '', me.mediaFrase > 30 ? 'alerta' : '')}
    ${metrica(`${me.turnosRefuta} / ${me.turnosTras}`, t('intervenciones (tras tu apertura) que aluden al rival'), '', me.turnosRefuta < me.turnosTras / 2 ? 'alerta' : 'bien')}
  </div>
  <div class="table-wrap" style="margin-top:12px"><table><tr><th>${esc(t('Intervención'))}</th><th>${esc(t('Palabras'))}</th><th>${esc(t('Duración estimada'))}</th><th>${esc(t('Muletillas'))}</th><th>${esc(t('Conectores'))}</th></tr>
    ${me.turnos.map((m, i) => `<tr><td>${i + 1}. ${esc(faseN(m.fase))}</td><td>${m.palabras}</td><td class="${m.fuera ? 'db-ko' : ''}">${mmss(m.segEst)} / ${mmss(m.limite)}</td><td>${m.nMul}</td><td>${m.nCon}</td></tr>`).join('')}</table></div>
  <p class="help">${esc(t('La duración se estima a {0} palabras por minuto. Las listas de muletillas y conectores son orientativas: «vale» o «tipo» pueden ser usos legítimos.', PPM_EST))}</p></div>
  ${fb ? pintaFB(fb) : `<div class="card"><h3 class="an-h3">${esc(t('Comentarios de la IA'))}</h3><p class="help">${esc(t('La IA lee todo el debate y comenta tu argumentación, tus evidencias, tu refutación, tu estructura y tu persuasión con citas de lo que dijiste. Es una llamada.'))}</p><div class="actions"><button class="btn btn-primary" id="btnFB" type="button">${ico('sparkles')}<span>${esc(t('Pedir los comentarios'))}</span></button></div><p class="help" id="fbEstado" role="status"></p></div>`}
  <div class="card"><h3 class="an-h3">${esc(t('Llévatelo'))}</h3><div class="actions" style="margin-top:0">
    <button class="btn btn-primary" id="btnInforme" type="button">${ico('doc')}<span>${esc(t('Informe (HTML)'))}</span></button>
    <button class="btn btn-ghost" id="btnJson" type="button">${ico('download')}<span>JSON</span></button>
    <button class="btn btn-ghost" id="btnCopiar" type="button">${ico('copy')}<span>${esc(t('Copiar resumen'))}</span></button>
    <button class="btn btn-ghost" id="btnOtro" type="button">${ico('refresh')}<span>${esc(t('Otro debate'))}</span></button>
  </div><p class="help">${esc(t('El informe es un fichero HTML que se abre en cualquier navegador y se puede imprimir o guardar como PDF.'))}</p></div>`;
  if ($('btnFB')) $('btnFB').onclick = pideFB;
  $('btnInforme').onclick = descargaInforme; $('btnJson').onclick = descargaJSON; $('btnCopiar').onclick = copiaResumen;
  $('btnOtro').onclick = () => { nuevoDebate(); go(1); };
}
function pintaFB(fb) {
  const marca = (ok) => `<span class="${ok ? 'db-ok' : 'db-ko'}" title="${esc(ok ? t('Cita verificada en tus intervenciones') : t('Esta cita no aparece en tus intervenciones'))}">${ok ? '✓' : '⚠'}</span>`;
  return `<div class="card"><h3 class="an-h3">${esc(t('Comentarios de la IA'))}</h3>${fb.resumen ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.65">${esc(fb.resumen)}</p>` : ''}
    ${S.fbAvisos.length ? `<p class="aviso">${esc(t('El código corrigió o marcó {0} punto(s) de los comentarios:', S.fbAvisos.length))} ${esc([...new Set(S.fbAvisos.map(textoAvisoFB))].join(' · '))}</p>` : ''}
    ${RUBRICA.map(d => { const r = fb.rubrica[d.id]; return `<div class="an-rub"><div class="an-rub-h"><span>${d.i}</span><span>${esc(L(d.n))}</span><span class="fa-chip" style="margin-left:auto">${esc(r.nivel === null ? t('sin valorar') : t('Nivel {0} de 4', r.nivel + 1))}</span></div>
      <div class="an-niveles">${L(d.d).map((x, i) => `<div class="an-nivel ${i === r.nivel ? 'aqui' : ''}">${esc(x)}</div>`).join('')}</div>
      ${r.comentario ? `<p>${esc(r.comentario)}</p>` : ''}${r.cita ? `<p>${marca(r.citaOk)} <i>«${esc(r.cita)}»</i></p>` : ''}</div>`; }).join('')}</div>
    ${fb.momentos.length ? `<div class="card"><h3 class="an-h3">${esc(t('Momentos clave'))}</h3>${fb.momentos.map(m => `<div class="db-cita" style="--c:${m.tipo === 'acierto' ? 'var(--forjado)' : 'var(--brasa)'}">${marca(m.citaOk)} «${esc(m.cita)}»<small>${esc(m.tipo === 'acierto' ? t('Acierto') : t('Oportunidad'))}${m.turno ? ' · ' + esc(t('intervención {0}', m.turno)) : ''}</small><span style="display:block;margin-top:4px">${esc(m.comentario)}</span></div>`).join('')}</div>` : ''}
    <div class="card"><div class="an-listas">${lista(t('Fortalezas'), fb.fortalezas)}${lista(t('A mejorar'), fb.mejoras)}${fb.ejercicio ? `<div><b>${esc(t('Para el próximo debate'))}</b><p style="margin:6px 0 0;font-size:14px;line-height:1.6">${esc(fb.ejercicio)}</p></div>` : ''}</div></div>`;
}
const lista = (titulo, items) => items.length ? `<div><b>${esc(titulo)}</b><ul>${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';

/* ── exportaciones ───────────────────────────────────────────────────────────────────── */
const nombreFichero = ext => `debatia_${norm(S.stu || 'debate').replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.${ext}`;
function datosExport() {
  const ids = S.panel.map(p => p.id);
  return {app: 'DebatIA', version: '1.0.0', fecha: new Date().toISOString(), idioma: lgD(), ejemplo: S.esEjemplo,
    proveedor: S.esEjemplo ? null : getProv(), modelo: S.esEjemplo ? null : getMod(), estudiante: S.stu,
    mocion: S.mocionFija, lado_estudiante: S.lado, rival: {...rivalActual(), estilo: S.estilo, nivel: S.nivel}, formato: {id: S.formato, ...FORMATOS[S.formato]},
    publico: {parametros: S.pob, fuentes: FUENTES, personas: S.panel}, votacion_previa: S.pre, votacion_final: S.post,
    veredicto: S.pre?.hecho && S.post?.hecho ? veredicto(S.pre.votos, S.post.votos, ids) : null,
    turnos: S.turnos, metricas: metricasEstudiante(S.turnos, lgD()), comentarios: S.fb, correcciones_del_codigo: S.fbAvisos};
}
const descargaJSON = () => dl(nombreFichero('json'), JSON.stringify(datosExport(), null, 2), 'application/json');
function descargaCSV() {
  const c = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const filas = [[t('id'), t('sexo'), t('edad'), t('comunidad'), t('estudios'), t('antes'), t('después'), t('motivo'), t('cita'), t('cita verificada')].map(c).join(';')];
  S.panel.forEach(p => { const a = S.pre?.votos[p.id], b = S.post?.votos[p.id]; filas.push([p.id, t(p.sexo), p.edad, INE_CCAA[p.ccaa][0], L(EST_N[p.estudios]), a ? ladoN(a.voto) : '', b ? ladoN(b.voto) : '', b?.motivo, b?.cita, b?.cita ? (b.citaOk ? t('sí') : t('no')) : ''].map(c).join(';')); });
  dl(nombreFichero('csv'), '﻿' + filas.join('\r\n'), 'text/csv;charset=utf-8');
}
function resumenTexto() {
  const ve = veredicto(S.pre.votos, S.post.votos, S.panel.map(p => p.id)), me = metricasEstudiante(S.turnos, lgD());
  return [`DebatIA — «${S.mocionFija}»`, `${t('Tu postura')}: ${ladoN(S.lado)} · ${t('Rival')}: ${nombreRival()}`,
    `${t('Resultado')}: ${ve.ganador === 'empate' ? t('Empate') : ve.ganador === S.lado ? t('Ganas el debate') : t('Gana {0}', nombreRival())} (${pp(ve.ganancia[S.lado])} / ${pp(ve.ganancia[otroLado(S.lado)])})`,
    `${t('Palabras')}: ${me.palabras} · ${t('intervenciones fuera de tiempo')}: ${me.fuera} · ${t('posibles muletillas cada 100 palabras')}: ${f1(me.mulPor100)}`,
    ...(S.fb ? ['', t('Fortalezas') + ': ' + S.fb.fortalezas.join('; '), t('A mejorar') + ': ' + S.fb.mejoras.join('; ')] : [])].join('\n');
}
async function copiaResumen() {
  try { await navigator.clipboard.writeText(resumenTexto()); toast(t('Resumen copiado')); }
  catch { toast(t('El navegador no permitió copiar. Descarga el informe en su lugar.'), 6000); }
}
/* informe autónomo: un HTML que se abre en cualquier navegador y se imprime o guarda como PDF */
function descargaInforme() {
  const ve = veredicto(S.pre.votos, S.post.votos, S.panel.map(p => p.id)), me = metricasEstudiante(S.turnos, lgD()), rv = rivalActual(), fb = S.fb;
  const fecha = new Date().toLocaleDateString(locale(), {year: 'numeric', month: 'long', day: 'numeric'});
  const sec = (tit, cuerpo) => `<section><h2>${esc(tit)}</h2>${cuerpo}</section>`;
  const fila = (...xs) => `<tr>${xs.map(x => `<td>${esc(x)}</td>`).join('')}</tr>`, cab = (...xs) => `<tr>${xs.map(x => `<th>${esc(x)}</th>`).join('')}</tr>`;
  const res = ve.ganador === 'empate' ? t('Empate') : ve.ganador === S.lado ? t('Ganas el debate') : t('Gana {0}', rv.nombre);
  const html = `<!DOCTYPE html><html lang="${lgD()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DebatIA — ${esc(S.stu || t('Debate'))}</title>
<style>body{font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#1a2733;max-width:860px;margin:0 auto;padding:32px 20px}
h1{font-size:25px;margin:0 0 4px}h2{font-size:17px;margin:26px 0 8px;padding-bottom:5px;border-bottom:2px solid #eee}
.cab{color:#667;font-size:13.5px;margin:0 0 18px}.res{background:#f6f8fb;border-radius:12px;padding:16px 18px;font-size:17px}
table{border-collapse:collapse;width:100%;font-size:14px;margin-top:6px}td,th{border:1px solid #e5e7eb;padding:7px 10px;text-align:left;vertical-align:top}th{background:#f6f8fb}
.m{padding:8px 11px;border-radius:9px;margin:6px 0;background:#f6f8fb}.m.e{background:#eaf2fa;border-left:3px solid #1F6FB2}.m.o{background:#fff8e6}
.rol{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#889;margin-bottom:2px}.ok{color:#0E7C6B}.ko{color:#8A3617}
.pie{margin-top:30px;padding-top:12px;border-top:1px solid #eee;font-size:12px;color:#778}@media print{body{padding:0}h2{break-after:avoid}}</style></head><body>
<h1>DebatIA · ${esc(t('Informe del debate'))}</h1>
<p class="cab">${esc(S.stu || t('Debate sin nombre'))} · ${esc(fecha)} · ${esc(t('formato.' + S.formato))}</p>
<p class="res"><b>«${esc(S.mocionFija)}»</b><br>${esc(t('Tu postura'))}: ${esc(ladoN(S.lado))} · ${esc(t('Rival'))}: ${esc(rv.nombre)} (${esc(L(ESTILOS.find(x => x.id === S.estilo).n))}, ${esc(L(NIVELES.find(x => x.id === S.nivel).n))})<br><b>${esc(res)}</b> — ${esc(t('{0} movió {1} puntos y {2}, {3}. Cambiaron de voto {4} de {5} personas.', S.stu || t('Tu lado'), pp(ve.ganancia[S.lado]), rv.nombre, pp(ve.ganancia[otroLado(S.lado)]), ve.cambian, ve.comunes))}</p>
${S.esEjemplo ? `<p><i>${esc(t('Debate de demostración ficticio.'))}</i></p>` : ''}
${sec(t('Votación del público'), `<table>${cab('', ...VOTOS.map(ladoN))}${fila(t('Antes del debate'), ...VOTOS.map(v => nf(ve.pre.pct[v]) + ' %'))}${fila(t('Después del debate'), ...VOTOS.map(v => nf(ve.post.pct[v]) + ' %'))}</table><p>${esc(t('Público sintético de {0} personas con perfiles proporcionales a la población adulta de España (INE 2025). Sus votos no predicen los de un público real.', ve.comunes))}</p>`)}
${sec(t('Lo que mide el código'), `<table>${cab(t('Intervención'), t('Palabras'), t('Duración estimada'), t('Muletillas'), t('Conectores'))}${me.turnos.map((m, i) => fila(`${i + 1}. ${faseN(m.fase)}`, m.palabras, `${mmss(m.segEst)} / ${mmss(m.limite)}`, m.nMul, m.nCon)).join('')}</table>
<p>${esc(t('Palabras')) + ': ' + me.palabras} · ${esc(t('posibles muletillas cada 100 palabras'))}: ${f1(me.mulPor100)} · ${esc(t('diversidad léxica (MATTR, 0-1)'))}: ${f2(me.mattr)} · ${esc(t('palabras por frase de media'))}: ${f1(me.mediaFrase)}${me.ppm ? ' · ' + esc(t('palabras por minuto al dictar')) + ': ' + Math.round(me.ppm) : ''}</p>`)}
${fb ? sec(t('Comentarios de la IA'), `${fb.resumen ? `<p>${esc(fb.resumen)}</p>` : ''}<table>${cab(t('Dimensión'), t('Nivel'), t('Comentario'))}${RUBRICA.map(d => { const r = fb.rubrica[d.id]; return `<tr><td>${d.i} ${esc(L(d.n))}</td><td>${r.nivel === null ? '—' : `${r.nivel + 1}/4 — ${esc(L(d.d)[r.nivel])}`}</td><td>${esc(r.comentario)}${r.cita ? `<br><span class="${r.citaOk ? 'ok' : 'ko'}">${r.citaOk ? '✓' : '⚠'}</span> <i>«${esc(r.cita)}»</i>` : ''}</td></tr>`; }).join('')}</table>
${fb.fortalezas.length ? `<p><b>${esc(t('Fortalezas'))}:</b> ${esc(fb.fortalezas.join(' · '))}</p>` : ''}${fb.mejoras.length ? `<p><b>${esc(t('A mejorar'))}:</b> ${esc(fb.mejoras.join(' · '))}</p>` : ''}${fb.ejercicio ? `<p><b>${esc(t('Para el próximo debate'))}:</b> ${esc(fb.ejercicio)}</p>` : ''}`) : ''}
${sec(t('Transcripción'), S.turnos.map(x => `<div class="m ${x.quien === 'estudiante' ? 'e' : x.quien === 'moderador' ? 'o' : ''}"><span class="rol">${esc(x.quien === 'estudiante' ? (S.stu || t('Tú')) : x.quien === 'rival' ? rv.nombre : t('Moderador'))} · ${esc(faseN(x.fase))}</span>${esc(x.texto)}</div>`).join(''))}
<p class="pie">${esc(t('Generado con DebatIA (Fernando Borrás Rocher, Universidad Miguel Hernández de Elche). El público es sintético y la IA puede equivocarse: los comentarios son orientativos y no sustituyen la evaluación del profesorado. Las métricas y el recuento los calcula el código; las citas marcadas con ✓ se han comprobado literalmente.'))}</p></body></html>`;
  dl(nombreFichero('html'), html, 'text/html');
}

/* ── pantalla 6: progreso ────────────────────────────────────────────────────────────── */
function pintaProgreso() {
  const ses = S.sesiones, r = resumenProgreso(ses);
  if (!r.n) { $('progZona').innerHTML = `<div class="card"><p class="empty">${esc(t('Todavía no has terminado ningún debate. Cuando el público vote al final, aparecerá aquí.'))}</p></div>`; return; }
  $('progZona').innerHTML = `
  <div class="card an-stats">
    <div class="an-m"><span class="an-mn">${r.n}</span><small>${esc(t('debates'))}</small></div>
    <div class="an-m"><span class="an-mn">${r.victorias}</span><small>${esc(t('victorias'))}</small></div>
    <div class="an-m"><span class="an-mn">${esc(pp(r.ventajaMedia))}</span><small>${esc(t('ventaja media'))}</small></div>
    <div class="an-m"><span class="an-mn">${esc(f1(r.mulMedia))}</span><small>${esc(t('muletillas/100'))}</small></div>
  </div>
  <div class="card"><h3 class="an-h3">${esc(t('Tus debates'))}</h3>
    <ul class="an-sesiones">${ses.slice(0, 40).map(s => `<li><span class="an-emoji">${s.resultado === 'gana' ? '🏆' : s.resultado === 'empate' ? '🤝' : '🎯'}</span><span><b>${esc(s.mocion)}</b><small>${esc(new Date(s.fecha).toLocaleDateString(locale(), {day: 'numeric', month: 'short', year: 'numeric'}))} · ${esc(ladoN(s.lado))} · ${esc(s.rival)} · ${esc(t('{0} palabras', s.palabras))}</small></span><span class="an-pts" style="color:${s.ventaja > 0 ? 'var(--forjado)' : s.ventaja < 0 ? 'var(--aviso)' : 'var(--tinta)'}">${esc(pp(s.ventaja))}</span></li>`).join('')}</ul>
    <p class="help">${esc(t('La cifra de la derecha es tu ventaja: los puntos que ganó tu lado menos los que ganó el de tu rival.'))}</p></div>
  <div class="card"><div class="actions" style="margin-top:0">
    <button class="btn btn-ghost" id="btnProgJson" type="button">${ico('download')}<span>${esc(t('Descargar mis debates (JSON)'))}</span></button>
    <button class="btn btn-ghost" id="btnProgBorra" type="button">${ico('trash')}<span>${esc(t('Borrar el histórico'))}</span></button>
  </div></div>`;
  $('btnProgJson').onclick = () => dl('debatia_progreso.json', JSON.stringify(S.sesiones, null, 2), 'application/json');
  $('btnProgBorra').onclick = async () => { if (!confirm(t('¿Borrar todos tus debates guardados? No se puede deshacer.'))) return; S.sesiones = []; await guardaYa(); pintaProgreso(); toast(t('Histórico borrado')); };
}

/* ── fuentes del público en la ayuda ── */
function pintaFuentes() { $('fuentesTxt').innerHTML = `<b>${esc(t('Fuentes de la población'))}</b><br>` + Object.values(FUENTES).map(f => `${esc(f.txt)}${f.url ? ` · <a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.url)}</a>` : ''}`).join('<br>'); }
window.addEventListener('langchange', pintaFuentes);

/* ── arranque ── */
(async () => {
  const p = await cargaEstado();
  if (p) { S = {...S, ...p}; S.pob = limpiaPob(S.pob); if (!RIVALES.some(r => r.id === S.rivalId)) S.rivalId = 'mujer_40'; if (S.cur) S.cur.t0 = null; }
  iniciaUI(); pintaFuentes();
  go(0);
})();
