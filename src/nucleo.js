/* ══ DebatIA · lógica pura: sin DOM y sin red, para poder probarla en Node.
      Aquí vive «la IA propone, el código comprueba»: la IA habla, vota y comenta; el código construye el público,
      mide el discurso, valida cada voto, cuenta, decide el ganador con la regla Munk y comprueba cada cita. ══ */

/* ── público sintético: muestreo por cuotas con semilla (misma semilla → mismo público) ── */
function rng(seed) { let a = (Number(seed) >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
const suma = a => a.reduce((s, x) => s + x, 0);
const normaliza = w => { const s = suma(w); return s > 0 ? w.map(x => x / s) : w.map(() => 1 / w.length); };
function elige(w, r) { const u = r() * suma(w); let acc = 0; for (let i = 0; i < w.length; i++) { acc += w[i]; if (u < acc) return i; } return w.length - 1; }
function baraja(a, r) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
/* reparto exacto por cuotas (método del mayor resto) */
function cuotas(p, n) {
  const q = normaliza(p).map(x => x * n), base = q.map(Math.floor), falta = n - suma(base);
  q.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, falta).forEach(([, i]) => base[i]++);
  return base;
}
const tramoDe = edad => TRAMOS.findIndex(([a, b]) => edad >= a && edad <= b);
function pesosEdad(min = 18, max = 105) { const e = []; for (let a = Math.max(18, min); a <= Math.min(105, max); a++) e.push([a, INE_EDAD[a] || 0]); return e; }
function estudiosPesos(edad) { let f = INE_ESTUDIOS[0]; for (const g of INE_ESTUDIOS) if (edad >= g[0]) f = g; return f.slice(1); }
const pobDefecto = () => ({n: 100, semilla: 2026, edadMin: 18, edadMax: 105});
function limpiaPob(p) {
  const e = (x, a, b, d) => { const v = Math.round(+x); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
  const o = {n: e(p?.n, 10, 200, 100), semilla: e(p?.semilla, 1, 1e9, 2026), edadMin: e(p?.edadMin, 18, 105, 18), edadMax: e(p?.edadMax, 18, 105, 105)};
  if (o.edadMin > o.edadMax) [o.edadMin, o.edadMax] = [o.edadMax, o.edadMin];
  return o;
}
/* edad (por tramos con cuotas exactas), sexo y comunidad por cuotas; estudios condicionados a la edad (EPA) */
function muestreaPanel(pob) {
  pob = limpiaPob(pob);
  const r = rng(pob.semilla), n = pob.n, pe = pesosEdad(pob.edadMin, pob.edadMax), totE = suma(pe.map(x => x[1]));
  const asigna = p => baraja(cuotas(p, n).flatMap((c, i) => Array(c).fill(i)), r);
  const pTramo = TRAMOS.map((_, i) => suma(pe.filter(([a]) => tramoDe(a) === i).map(x => x[1])) / totE);
  const edades = asigna(pTramo).map(i => { const c = pe.filter(([a]) => tramoDe(a) === i); return c[elige(c.map(x => x[1]), r)][0]; });
  const sx = asigna([INE_SEXO.mujer, INE_SEXO.hombre]), cks = Object.keys(INE_CCAA), cc = asigna(cks.map(k => INE_CCAA[k][1]));
  return edades.map((edad, i) => ({id: 'P' + String(i + 1).padStart(3, '0'), edad, sexo: ['mujer', 'hombre'][sx[i]], ccaa: cks[cc[i]], estudios: EST_CATS[elige(estudiosPesos(edad), r)]}));
}
/* descripción de una persona para el prompt (en español: los prompts se escriben una vez) */
const perfilTxt = p => `${p.id} · ${p.sexo} · ${p.edad} años · ${INE_CCAA[p.ccaa]?.[0] || p.ccaa} · ${EST_N[p.estudios]?.es || p.estudios}`;
function composicion(P) {
  const n = P.length || 1, cuenta = (f, cats) => cats.map(c => P.filter(p => f(p) === c).length);
  const cc = {}; P.forEach(p => { cc[p.ccaa] = (cc[p.ccaa] || 0) + 1; });
  return {n: P.length, sexo: cuenta(p => p.sexo, ['mujer', 'hombre']), tramos: cuenta(p => tramoDe(p.edad), [0, 1, 2, 3]), estudios: cuenta(p => p.estudios, EST_CATS),
    ccaa: Object.entries(cc).sort((a, b) => b[1] - a[1]), edadMedia: P.reduce((s, p) => s + p.edad, 0) / n};
}

/* ── el plan del debate: Munk adaptado a 1 contra 1. Cada lado abre, replica, responde dos preguntas y cierra;
      el cierre va en orden inverso a la apertura para que cada lado tenga una primera y una última palabra. ── */
function planDebate(formato, ladoEst) {
  const f = FORMATOS[formato] || FORMATOS.munk, q = l => (l === ladoEst ? 'estudiante' : 'rival');
  const T = (fase, lado, min) => ({fase, lado, quien: lado ? q(lado) : 'moderador', min});
  return [T('apertura', 'favor', f.apertura), T('apertura', 'contra', f.apertura), T('replica', 'favor', f.replica), T('replica', 'contra', f.replica),
    T('pregunta', null, 0), T('respuesta', 'favor', f.respuesta), T('respuesta', 'contra', f.respuesta),
    T('pregunta', null, 0), T('respuesta', 'contra', f.respuesta), T('respuesta', 'favor', f.respuesta),
    T('cierre', 'contra', f.cierre), T('cierre', 'favor', f.cierre)];
}

/* ── lo que el código mide en un discurso ── */
const palabras = s => String(s || '').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
function cuentaFrases(texto, lista) {
  const n = ' ' + norm(texto) + ' ', out = {};
  for (const f of lista || []) { const k = ' ' + norm(f) + ' '; let c = 0, i = 0; while ((i = n.indexOf(k, i)) >= 0) { c++; i += k.length - 1; } if (c) out[f] = c; }
  return out;
}
/* diversidad léxica: TTR medio en ventanas móviles de 50 palabras (MATTR), que no depende de la longitud */
function mattr(ws, w = 50) {
  if (!ws.length) return 0;
  if (ws.length < w) return new Set(ws).size / ws.length;
  let s = 0; for (let i = 0; i <= ws.length - w; i++) s += new Set(ws.slice(i, i + w)).size / w;
  return s / (ws.length - w + 1);
}
const sumaObj = o => Object.values(o).reduce((s, x) => s + x, 0);
function metricasTurno(tu, lang = 'es') {
  const tx = String(tu.texto || ''), ws = palabras(tx).map(w => w.toLowerCase()), n = ws.length;
  const frases = tx.split(/[.!?…]+/).filter(s => palabras(s).length);
  const lim = (tu.min || 0) * 60, segEst = n / PPM_EST * 60;
  const mul = cuentaFrases(tx, MULETILLAS[lang] || MULETILLAS.es), con = cuentaFrases(tx, CONECTORES[lang] || CONECTORES.es), ref = cuentaFrases(tx, REFUTA[lang] || REFUTA.es);
  const ppm = tu.dictado && tu.segMic >= 10 ? n / (tu.segMic / 60) : null;
  return {palabras: n, segEst, limite: lim, pctTiempo: lim ? segEst / lim : 0, fuera: !!lim && segEst > lim * 1.1, corto: !!lim && segEst < lim * 0.5, ppm,
    muletillas: mul, nMul: sumaObj(mul), conectores: con, nCon: sumaObj(con), refuta: ref, nRef: sumaObj(ref),
    preguntas: (tx.match(/\?/g) || []).length, frases: frases.length, mediaFrase: n / Math.max(1, frases.length), ws};
}
function metricasEstudiante(turnos, lang = 'es') {
  const mine = turnos.filter(x => x.quien === 'estudiante'), por = mine.map(x => ({fase: x.fase, ...metricasTurno(x, lang)}));
  const ws = por.flatMap(m => m.ws), n = ws.length || 0, mulT = {}, conT = {};
  por.forEach(m => { for (const [k, v] of Object.entries(m.muletillas)) mulT[k] = (mulT[k] || 0) + v; for (const [k, v] of Object.entries(m.conectores)) conT[k] = (conT[k] || 0) + v; });
  const dict = por.filter(m => m.ppm);
  const tras = mine.map((x, i) => [x, por[i]]).filter(([x]) => x.fase !== 'apertura');
  return {
    turnos: por.map(({ws: _w, ...m}) => m), palabras: n, mattr: mattr(ws), mediaFrase: n / Math.max(1, suma(por.map(m => m.frases))),
    muletillas: mulT, nMul: sumaObj(mulT), mulPor100: n ? sumaObj(mulT) / n * 100 : 0,
    conectores: conT, nCon: sumaObj(conT), conPor100: n ? sumaObj(conT) / n * 100 : 0,
    refutaTras: suma(tras.map(([, m]) => m.nRef)), turnosRefuta: tras.filter(([, m]) => m.nRef > 0).length, turnosTras: tras.length,
    fuera: por.filter(m => m.fuera).length, cortos: por.filter(m => m.corto).length, ppm: dict.length ? suma(dict.map(m => m.ppm)) / dict.length : null,
    preguntas: suma(por.map(m => m.preguntas))
  };
}

/* ── discursos del rival: sin formato de texto escrito y, si se pasa mucho de su tiempo, recortado en un final de frase ── */
function limpiaDiscurso(tx, nombre = '') {
  let s = String(tx || '').replace(/\r/g, '').replace(/^\s*#+\s*/gm, '').replace(/\*\*|__|`/g, '').replace(/^\s*[-*•]\s+/gm, '').replace(/^\s*\d+[.)]\s+/gm, '');
  if (nombre) s = s.replace(new RegExp('^\\s*' + nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[:：-]\\s*', 'i'), '');
  s = s.replace(/^\s*["«“]([\s\S]*)["»”]\s*$/, '$1');
  return s.replace(/\n{3,}/g, '\n\n').trim();
}
function recortaPalabras(tx, objetivo) {
  const tope = Math.round(objetivo * 1.35);
  if (palabras(tx).length <= tope) return {texto: tx, recortado: false};
  const frases = tx.match(/[^.!?…]+[.!?…]+["»”)]?\s*/g) || [tx];
  let out = '';
  for (const f of frases) { if (palabras(out + f).length > tope && out) break; out += f; }
  if (palabras(out).length > tope) out = palabras(out).slice(0, tope).join(' ') + '…';
  return {texto: out.trim(), recortado: true};
}

/* ── votos del público: el código valida cada uno y comprueba la cita en la transcripción ── */
const VOTOS = ['favor', 'contra', 'indeciso'];
function normVoto(v) {
  const s = norm(v).replace(/ /g, '');
  if (/^(afavor|favor|for|infavor|pro|si|yes|sim|aprueba|apoya)$/.test(s)) return 'favor';
  if (/^(encontra|contra|against|con|no|nao|rechaza)$/.test(s)) return 'contra';
  if (/^(indeciso|indecisa|indecisos|undecided|neutral|neutro|neutra|abstencion|nose|naosei|dontknow)$/.test(s)) return 'indeciso';
  return null;
}
/* en qué intervención aparece literalmente una cita (solo intervenciones de los ponentes) */
function turnoDeCita(turnos, cita) {
  if (norm(cita).length < 12) return -1;
  return turnos.findIndex(x => x.quien !== 'moderador' && esFiel(x.texto, cita));
}
function validaVotos(raw, ids, turnos = null) {
  const lista = Array.isArray(raw?.votos) ? raw.votos : Array.isArray(raw) ? raw : [];
  const esperados = new Set(ids), votos = {}, avisos = [];
  for (const v of lista) {
    const id = String(v?.id || '').trim().toUpperCase();
    if (!esperados.has(id)) { avisos.push({tipo: 'id_desconocido', id: id || '—'}); continue; }
    if (votos[id]) { avisos.push({tipo: 'id_repetido', id}); continue; }
    const voto = normVoto(v.voto);
    if (!voto) { avisos.push({tipo: 'voto_invalido', id, dado: String(v.voto ?? '')}); continue; }
    const r = {voto, motivo: String(v.motivo || '').trim().slice(0, 300)};
    if (turnos) {
      r.cita = String(v.cita || '').trim().slice(0, 400);
      const k = r.cita ? turnoDeCita(turnos, r.cita) : -1;
      r.citaOk = k >= 0; r.turno = k >= 0 ? k : null; r.ladoCita = k >= 0 ? turnos[k].lado : null;
      const dice = String(v.ponente || '').trim().toUpperCase(), ladoDicho = dice === 'A' ? 'favor' : dice === 'B' ? 'contra' : null;
      if (k >= 0 && ladoDicho && ladoDicho !== r.ladoCita) avisos.push({tipo: 'ponente_corregido', id});
    }
    votos[id] = r;
  }
  return {votos, faltan: ids.filter(id => !votos[id]), avisos};
}
function recuento(votos, ids) {
  const c = {favor: 0, contra: 0, indeciso: 0}; ids.forEach(id => { const v = votos[id]?.voto; if (v) c[v]++; });
  const n = suma(Object.values(c)), pct = {}; VOTOS.forEach(k => { pct[k] = n ? c[k] / n * 100 : 0; });
  return {c, n, pct};
}
/* regla de los Munk Debates: gana quien más puntos porcentuales gana entre la votación previa y la final.
   Solo cuentan las personas que votaron en las dos rondas (así las dos cifras se comparan sobre el mismo público). */
function veredicto(pre, post, panelIds) {
  const comunes = panelIds.filter(id => pre[id]?.voto && post[id]?.voto);
  const a = recuento(pre, comunes), b = recuento(post, comunes);
  const ganancia = {favor: b.pct.favor - a.pct.favor, contra: b.pct.contra - a.pct.contra};
  const ganador = !comunes.length ? null : Math.abs(ganancia.favor - ganancia.contra) < 0.5 ? 'empate' : ganancia.favor > ganancia.contra ? 'favor' : 'contra';
  const tr = {}; VOTOS.forEach(x => { tr[x] = {favor: 0, contra: 0, indeciso: 0}; });
  comunes.forEach(id => tr[pre[id].voto][post[id].voto]++);
  return {pre: a, post: b, ganancia, ganador, transiciones: tr, cambian: comunes.filter(id => pre[id].voto !== post[id].voto).length,
    comunes: comunes.length, excluidos: panelIds.length - comunes.length};
}
/* intervenciones que el público cita como decisivas (solo citas verificadas) */
function citasDecisivas(pre, post, turnos) {
  const por = {};
  for (const [id, v] of Object.entries(post)) {
    if (!v.citaOk) continue;
    const k = v.turno, o = por[k] || (por[k] = {turno: k, lado: turnos[k].lado, quien: turnos[k].quien, fase: turnos[k].fase, n: 0, atraidos: 0, citas: {}});
    o.n++; if (pre[id]?.voto !== v.voto && v.voto === o.lado) o.atraidos++;
    const c = v.cita; o.citas[c] = (o.citas[c] || 0) + 1;
  }
  return Object.values(por).map(o => ({...o, cita: Object.entries(o.citas).sort((a, b) => b[1] - a[1])[0][0]})).sort((a, b) => b.n - a.n || a.turno - b.turno);
}

/* ── comentario de oratoria: la IA elige niveles y comenta; el código fija la rúbrica y comprueba las citas ── */
const MARCAS_NOTA = /\b\d{1,2}(?:[.,]\d)?\s*\/\s*10\b|\b\d{1,2}(?:[.,]\d)?\s*(?:sobre|de|out of|em)\s*10\b/i;
function revisaFeedback(raw, turnos) {
  const mios = turnos.filter(x => x.quien === 'estudiante'), todo = mios.map(x => x.texto).join('\n'), avisos = [];
  const r = raw && typeof raw === 'object' ? raw : {}, rb = r.rubrica && typeof r.rubrica === 'object' ? r.rubrica : {};
  const rubrica = {};
  for (const d of RUBRICA) {
    const x = Array.isArray(rb) ? (rb.find(y => String(y?.id || y?.dimension || '').toLowerCase() === d.id) || {}) : (rb[d.id] || {});
    let nivel = Math.round(parseFloat(String(x.nivel ?? '').replace(',', '.')));
    if (!Number.isFinite(nivel)) { nivel = null; avisos.push({tipo: 'nivel_falta', campo: d.id}); }
    else if (nivel < 0 || nivel > 3) { avisos.push({tipo: 'nivel_fuera', campo: d.id, dado: nivel}); nivel = Math.min(3, Math.max(0, nivel)); }
    const cita = String(x.cita || '').trim();
    rubrica[d.id] = {nivel, comentario: String(x.comentario || '').trim(), cita, citaOk: !!cita && esFiel(todo, cita)};
    if (cita && !rubrica[d.id].citaOk) avisos.push({tipo: 'cita_no_verificada', campo: d.id});
  }
  const momentos = (Array.isArray(r.momentos) ? r.momentos : []).map(m => {
    const cita = String(m?.cita || '').trim(), dicho = Math.round(+m?.turno);
    let turno = Number.isFinite(dicho) && dicho >= 1 && dicho <= mios.length ? dicho : null;
    let ok = turno ? esFiel(mios[turno - 1].texto, cita) : false;
    if (!ok && cita) { const k = mios.findIndex(x => esFiel(x.texto, cita)); if (k >= 0) { if (Number.isFinite(dicho) && dicho !== k + 1) avisos.push({tipo: 'turno_corregido', dado: dicho, calculado: k + 1}); turno = k + 1; ok = true; } }
    if (!ok) avisos.push({tipo: 'cita_no_verificada', campo: 'momento'});
    return {turno, tipo: m?.tipo === 'oportunidad' ? 'oportunidad' : 'acierto', cita, citaOk: ok, comentario: String(m?.comentario || '').trim()};
  }).filter(m => m.cita || m.comentario);
  const lista = x => (Array.isArray(x) ? x : []).map(y => String(y || '').trim()).filter(Boolean).slice(0, 6);
  const fb = {resumen: String(r.resumen || '').trim(), rubrica, momentos, fortalezas: lista(r.fortalezas), mejoras: lista(r.mejoras), ejercicio: String(r.ejercicio || '').trim()};
  if (MARCAS_NOTA.test([fb.resumen, ...fb.fortalezas, ...fb.mejoras].join(' '))) avisos.push({tipo: 'nota'});
  return {fb, avisos};
}

/* ── progreso ── */
function resumenProgreso(ses) {
  const n = ses.length;
  if (!n) return {n: 0, victorias: 0, empates: 0, ventajaMedia: 0, palabras: 0, mulMedia: 0};
  return {n, victorias: ses.filter(s => s.resultado === 'gana').length, empates: ses.filter(s => s.resultado === 'empate').length,
    ventajaMedia: suma(ses.map(s => s.ventaja || 0)) / n, palabras: suma(ses.map(s => s.palabras || 0)), mulMedia: suma(ses.map(s => s.mulPor100 || 0)) / n};
}

if (typeof module !== 'undefined' && module.exports) module.exports = {rng, cuotas, muestreaPanel, limpiaPob, composicion, planDebate, palabras, cuentaFrases, mattr, metricasTurno, metricasEstudiante, limpiaDiscurso, recortaPalabras, normVoto, validaVotos, recuento, veredicto, citasDecisivas, revisaFeedback, resumenProgreso, perfilTxt, turnoDeCita};
