// Pruebas de la lógica pura en Node:  node tests/nucleo_test.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const R = path.resolve(__dirname, '..');
const ctx = {console, LANG: 'es', document: {getElementById: () => null}, window: {}, module: undefined};
vm.createContext(ctx);
for (const f of ['forja/js/00-utils.js', 'forja/js/30-verify.js', 'src/datos.js', 'src/nucleo.js'].concat(process.argv.slice(2)))
  vm.runInContext(fs.readFileSync(path.join(R, f), 'utf8').replace(/^"use strict";/, ''), ctx, {filename: f});
let ok = true; const check = (n, c, x = '') => { ok = ok && !!c; console.log((c ? '✓ ' : '✕ ') + n, c ? '' : x); };
const E = s => vm.runInContext(s, ctx);
// público
const P = E('muestreaPanel({n:100, semilla:2026})'), P2 = E('muestreaPanel({n:100, semilla:2026})'), P3 = E('muestreaPanel({n:100, semilla:7})');
check('100 personas con id único', P.length === 100 && new Set(P.map(p => p.id)).size === 100);
check('misma semilla → mismo público', JSON.stringify(P) === JSON.stringify(P2));
check('otra semilla → otro público', JSON.stringify(P) !== JSON.stringify(P3));
const C = E('composicion')(P);
check('cuotas de sexo exactas (51/49 según INE)', C.sexo[0] === 51 && C.sexo[1] === 49, JSON.stringify(C.sexo));
check('edades dentro del rango', E('muestreaPanel({n:50, semilla:3, edadMin:18, edadMax:30})').every(p => p.edad >= 18 && p.edad <= 30));
check('limpiaPob recorta valores absurdos', JSON.stringify(E('limpiaPob({n:9999, semilla:-4, edadMin:90, edadMax:20})')) === JSON.stringify({n: 200, semilla: 1, edadMin: 20, edadMax: 90}));
// plan
const plan = E("planDebate('munk','contra')");
check('plan: 12 turnos, 5 del estudiante, 5 del rival, 2 del moderador', plan.length === 12 && plan.filter(x => x.quien === 'estudiante').length === 5 && plan.filter(x => x.quien === 'rival').length === 5 && plan.filter(x => x.quien === 'moderador').length === 2);
check('plan: abre a favor y cierra a favor (cierre en orden inverso)', plan[0].lado === 'favor' && plan[11].lado === 'favor' && plan[10].lado === 'contra');
// métricas
const m = E("metricasTurno({texto:'Eh, o sea, en primer lugar, mi oponente se equivoca. Sin embargo, básicamente, digamos que no. ¿Por qué? Porque los datos importan.', min:1}, 'es')");
check('muletillas: eh, o sea, básicamente, digamos', m.nMul === 4, JSON.stringify(m.muletillas));
check('conectores: en primer lugar, sin embargo, porque', m.nCon === 3, JSON.stringify(m.conectores));
check('refutación: mi oponente, se equivoca', m.nRef === 2, JSON.stringify(m.refuta));
check('una pregunta y cuatro frases', m.preguntas === 1 && m.frases === 4, m.frases);
check('«este» no cuenta como muletilla', E("metricasTurno({texto:'Este argumento es débil.', min:1})").nMul === 0);
const largo = 'palabra '.repeat(200);
check('fuera de tiempo: 200 palabras en 1 minuto', E(`metricasTurno({texto:${JSON.stringify(largo)}, min:1})`).fuera === true);
check('ppm real solo si se dictó', E("metricasTurno({texto:'uno dos tres cuatro cinco seis siete ocho nueve diez', min:1, dictado:true, segMic:12})").ppm === 50 && E("metricasTurno({texto:'uno dos', min:1})").ppm === null);
check('MATTR: texto repetido < texto variado', E("mattr('a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b a b'.split(' '))") < 0.1);
// rival
const rc = E("recortaPalabras('Uno dos tres. Cuatro cinco seis. Siete ocho nueve. Diez once doce.', 4)");
check('recorta en final de frase si se pasa del 135 %', rc.recortado && rc.texto === 'Uno dos tres.', rc.texto);
check('limpia markdown y la etiqueta con el nombre', E("limpiaDiscurso('Marta: **Señoras** y señores\\n- primero', 'Marta')") === 'Señoras y señores\nprimero');
// votos
const turnos = [{quien: 'estudiante', lado: 'favor', fase: 'apertura', texto: 'La inteligencia artificial ya está en las aulas y prohibirla solo premia a quien hace trampas sin ser visto.'},
  {quien: 'rival', lado: 'contra', fase: 'apertura', texto: 'Un examen mide lo que sabe una persona, no lo que sabe una máquina que tiene en el bolsillo.'},
  {quien: 'moderador', lado: null, fase: 'pregunta', texto: '¿Qué medimos exactamente cuando evaluamos a un estudiante universitario hoy?'}];
ctx.T = turnos;
const raw = {votos: [
  {id: 'P001', voto: 'A favor', motivo: 'ok', cita: 'prohibirla solo premia a quien hace trampas', ponente: 'A'},
  {id: 'P002', voto: 'against', motivo: 'ok', cita: 'no lo que sabe una máquina que tiene en el bolsillo', ponente: 'A'},
  {id: 'P003', voto: 'indeciso', motivo: 'ok', cita: 'esta frase no aparece en ningún momento del debate de hoy'},
  {id: 'P003', voto: 'favor'}, {id: 'P999', voto: 'favor'}, {id: 'P004', voto: 'quizá'},
  {id: 'P005', voto: 'favor', cita: 'Qué medimos exactamente cuando evaluamos a un estudiante'}]};
const V = E(`validaVotos(${JSON.stringify(raw)}, ['P001','P002','P003','P004','P005','P006'], T)`);
check('votos válidos y sinónimos normalizados', V.votos.P001.voto === 'favor' && V.votos.P002.voto === 'contra' && V.votos.P003.voto === 'indeciso');
check('cita verificada y atribuida a su ponente', V.votos.P001.citaOk && V.votos.P001.ladoCita === 'favor' && V.votos.P002.ladoCita === 'contra');
check('la IA atribuyó mal el ponente: el código corrige y avisa', V.avisos.some(a => a.tipo === 'ponente_corregido' && a.id === 'P002'));
check('cita inventada → no verificada', V.votos.P003.citaOk === false);
check('cita del moderador → no cuenta', V.votos.P005.citaOk === false);
check('id repetido, desconocido y voto inválido → avisos', ['id_repetido', 'id_desconocido', 'voto_invalido'].every(t => V.avisos.some(a => a.tipo === t)));
check('faltan P004 y P006', JSON.stringify(V.faltan) === '["P004","P006"]');
// veredicto Munk
const pre = {}, post = {}, ids = [];
for (let i = 0; i < 100; i++) { const id = 'P' + i; ids.push(id); pre[id] = {voto: i < 36 ? 'favor' : i < 78 ? 'contra' : 'indeciso'}; }
for (let i = 0; i < 100; i++) { const id = 'P' + i; let v = pre[id].voto; if (i >= 78 && i < 91) v = 'favor'; if (i >= 91 && i < 94) v = 'contra'; if (i >= 36 && i < 43) v = 'favor'; if (i < 2) v = 'contra'; post[id] = {voto: v}; }
const ve = E('veredicto')(pre, post, ids);
check('recuento previo 36/42/22 y final 54/40/6', ve.pre.c.favor === 36 && ve.pre.c.contra === 42 && ve.post.c.favor === 54 && ve.post.c.contra === 40 && ve.post.c.indeciso === 6, JSON.stringify([ve.pre.c, ve.post.c]));
check('regla Munk: gana «a favor» (+18 frente a −2)', ve.ganador === 'favor' && Math.round(ve.ganancia.favor) === 18 && Math.round(ve.ganancia.contra) === -2);
check('transiciones suman 100 y cambian 25', Object.values(ve.transiciones).flatMap(Object.values).reduce((a, b) => a + b) === 100 && ve.cambian === 25);
delete post.P5;
const ve2 = E('veredicto')(pre, post, ids);
check('quien no votó en las dos rondas se excluye', ve2.comunes === 99 && ve2.excluidos === 1);
check('empate si las ganancias son iguales', E('veredicto')({a: {voto: 'favor'}, b: {voto: 'contra'}}, {a: {voto: 'favor'}, b: {voto: 'contra'}}, ['a', 'b']).ganador === 'empate');
// feedback
const fbRaw = {resumen: 'Buen debate, un 8/10.', rubrica: {argumentacion: {nivel: 5, cita: 'prohibirla solo premia a quien hace trampas'}, evidencias: {nivel: '2', cita: 'una cita que el estudiante nunca dijo en el debate'}},
  momentos: [{turno: 3, tipo: 'acierto', cita: 'la inteligencia artificial ya está en las aulas'}, {turno: 1, cita: 'otra frase completamente inventada por la IA aquí'}]};
const F = E(`revisaFeedback(${JSON.stringify(fbRaw)}, T)`);
check('nivel fuera de rango se recorta a 3', F.fb.rubrica.argumentacion.nivel === 3 && F.avisos.some(a => a.tipo === 'nivel_fuera'));
check('cita del estudiante verificada / inventada marcada', F.fb.rubrica.argumentacion.citaOk && !F.fb.rubrica.evidencias.citaOk);
check('dimensión sin nivel → nula y avisada', F.fb.rubrica.refutacion.nivel === null && F.avisos.some(a => a.tipo === 'nivel_falta'));
check('turno inexistente: el código localiza la cita y lo corrige', F.fb.momentos[0].turno === 1 && F.fb.momentos[0].citaOk);
check('momento con cita inventada → no verificado', F.fb.momentos[1].citaOk === false);
check('detecta una nota en el comentario (8/10)', F.avisos.some(a => a.tipo === 'nota'));
console.log(ok ? '\nTODO OK' : '\nHAY FALLOS'); process.exit(ok ? 0 : 1);
