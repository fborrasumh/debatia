"""Prueba de DebatIA con IA simulada (sin claves reales):  python3 tests/smoke_test.py
   Recorre el debate completo y comprueba que el código pilla lo que la IA hace mal: votos repetidos, de personas que no existen,
   con valores no válidos o que faltan; citas inventadas o atribuidas al ponente equivocado; cifras del rival sin fuente;
   discursos demasiado largos; niveles fuera de escala, citas inventadas y notas en los comentarios. Además: ejemplo sin clave en
   los tres idiomas, idiomas, CSP, persistencia, descargas, modelos de los tres proveedores y móvil."""
import asyncio, sys, pathlib, re, json, csv
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from forja_test import Harness
ROOT = pathlib.Path(__file__).resolve().parent.parent
TURNO = {'n': 0}

async def reply(prov, system, user, info):
    ids = re.findall(r'^(P\d{3}) ·', user, re.M)
    if 'Simulas a personas' in system and 'aún no ha empezado' in user:
        v = [{'id': i, 'voto': ['favor', 'en contra', 'indeciso'][int(i[1:]) % 3], 'motivo': 'Motivo previo de ' + i} for i in ids]
        if 'P001' in ids:   # la IA miente: repite, inventa una persona, da un voto no válido y se olvida de P004 (se reintenta)
            v += [{'id': 'P001', 'voto': 'contra'}, {'id': 'P777', 'voto': 'favor'}]
            v = [x for x in v if x['id'] != 'P004']; v[2] = {'id': 'P003', 'voto': 'tal vez'}
        return ('j', {'votos': v})
    if 'Simulas a personas' in system:
        frase = re.search(r'Ponente A \(a favor\): (\S+(?: \S+){9})', user).group(1)
        rv = re.search(r'Ponente B \(en contra\): (\S+(?: \S+){9})', user).group(1)
        v = []
        for i in ids:
            k = int(i[1:])
            if k % 3 == 2: v.append({'id': i, 'voto': 'favor', 'motivo': 'Me convenció', 'cita': frase, 'ponente': 'A'})       # indecisos → a favor
            elif k % 3 == 1: v.append({'id': i, 'voto': 'contra', 'motivo': 'Sigo en contra', 'cita': rv, 'ponente': 'A' if k == 4 else 'B'})
            else: v.append({'id': i, 'voto': 'favor', 'motivo': 'Sigo a favor', 'cita': 'una frase que nadie pronunció en este debate de prueba'})
        return ('j', {'votos': v})
    if 'moderador neutral' in system:
        return ('t', '¿Qué coste tendría su propuesta para quienes no pueden permitírselo?' if 'Ponente' in user else 'Pregunta')
    if 'Participas en un debate formal' in system:
        TURNO['n'] += 1
        largo = ' '.join(['Esta es una frase de relleno muy larga para pasarse del tiempo.'] * 60) if TURNO['n'] == 2 else ''
        return ('t', f'Marta: **Señoras y señores**, el 73 % de los estudiantes opina lo contrario, intervención {TURNO["n"]}. Defiendo con firmeza mi postura ante este público. {largo}')
    if 'profesor de oratoria' in system:
        mio = re.search(r'\[E1 · ESTUDIANTE · [^\]]+\] (\S+(?: \S+){7})', user).group(1)
        return ('j', {'resumen': 'Buen trabajo, un 8/10.', 'rubrica': {'argumentacion': {'nivel': 7, 'comentario': 'Clara', 'cita': mio}, 'evidencias': {'nivel': 1, 'comentario': 'Pocas', 'cita': 'una cita que el estudiante nunca dijo en el debate'}},
            'momentos': [{'turno': 9, 'tipo': 'acierto', 'cita': mio, 'comentario': 'Bien'}], 'fortalezas': ['Orden'], 'mejoras': ['Pruebas'], 'ejercicio': 'Repite la apertura.'})
    return ('t', 'ok')

DISCURSO = ('Defiendo esta moción porque la semana de cuatro días mejora la salud, eh, la productividad y la conciliación familiar. '
            'Sin embargo, o sea, mi oponente dice que es cara, y se equivoca: el descanso reduce las bajas. Mi correo es ana@umh.es.')

async def main():
    ok = True
    def check(nombre, cond, extra=''):
        nonlocal ok; ok &= bool(cond); print(('✓' if cond else '✕'), nombre, '' if cond else extra)
    async with Harness(ROOT/'index.html', reply) as h:
        p = h.page
        check('CSP bloquea otros orígenes', await h.csp_bloquea())
        for prov, esperado in (('openai', 'gpt-5-mini'), ('gemini', 'gemini-2.5-pro'), ('anthropic', 'claude-sonnet-4-5')):
            ops = await h.modelos(prov)
            check(f'desplegable de modelos de la clave ({prov})', esperado in ops and '__otro' in ops and 'whisper-1' not in ops, str(ops))
        await p.keyboard.press('Escape'); await p.evaluate("localStorage.setItem(APP+'_prov','openai')")
        # ── idiomas ──
        check('selector es,en,pt', await p.evaluate("[...document.querySelectorAll('#selLang option')].map(o=>o.value).join()") == 'es,en,pt')
        f = await h.faltan_traducciones(); check('no faltan traducciones del HTML, pasos, botones y ayuda', f == [], str(f))
        es_btn = await p.inner_text('#btnStart')
        await h.idioma('en'); check('inglés: portada y barra', await p.inner_text('#btnStart') != es_btn and (await p.inner_text('#btnHelp')).strip().lower() == 'help')
        await h.idioma('pt'); check('portugués: portada y barra', (await p.inner_text('#btnHelp')).strip().lower() == 'ajuda')
        await h.idioma('es'); check('vuelta al español', await p.inner_text('#btnStart') == es_btn)
        # ── ejemplo sin clave, en cada idioma ──
        for l in ('es', 'en', 'pt'):
            await h.idioma(l); await p.evaluate('go(0)'); await p.click('#btnEjemplo'); await p.wait_for_timeout(400)
            r = await p.evaluate("(()=>{const v=veredicto(S.pre.votos,S.post.votos,S.panel.map(p=>p.id));return {g:v.ganador, gf:Math.round(v.ganancia.favor), ko:Object.values(S.post.votos).filter(x=>x.cita&&!x.citaOk).length, fbko:S.fbAvisos.length, mio:S.turnos.filter(x=>x.quien==='estudiante').length, lang:S.langDebate}})()")
            check(f'ejemplo {l}: gana «a favor» +18, todas las citas del público y de los comentarios verificadas', r == {'g': 'favor', 'gf': 18, 'ko': 0, 'fbko': 0, 'mio': 5, 'lang': l}, str(r))
            for s in range(7): await p.evaluate(f'go({s})'); await p.wait_for_timeout(120)
        await h.idioma('en'); await p.evaluate('go(4)'); await p.wait_for_timeout(200)
        check('el veredicto del ejemplo se repinta en inglés', 'You win the debate' in await p.inner_text('#verZona'))
        await h.idioma('pt'); check('cambiar de idioma recarga el ejemplo en portugués', 'inteligência' in await p.evaluate('S.turnos[0].texto') and 'Ganha o debate' in await p.inner_text('#verZona'))
        await h.idioma('es'); check('ninguna excepción en el ejemplo', h.errors == [], str(h.errors))
        # ── debate real con IA simulada ──
        await p.evaluate("localStorage.setItem('ia_openai_key','sk-test')")
        await p.click('#goHome'); await p.click('#btnStart'); await p.wait_for_timeout(200)
        check('«Preparar un debate» desde el ejemplo empieza uno nuevo', await p.evaluate('!S.esEjemplo && !S.pre && S.turnos.length===0'))
        await p.fill('#sname', 'Ana García'); await p.select_option('#selMocion', 'cuatro_dias')
        await p.click('[data-lado="favor"]'); await p.click('[data-rival="mujer_40"]'); await p.click('[data-estilo="socratico"]'); await p.click('[data-formato="corto"]')
        await p.click('#navNext'); await p.wait_for_timeout(200)
        check('público de 100 personas generado', await p.evaluate('step===2 && S.panel.length===100'))
        await p.fill('#pobN', '30'); await p.dispatch_event('#pobN', 'change'); await p.wait_for_timeout(100)
        check('cambiar el tamaño regenera el público (30)', await p.evaluate('S.panel.length') == 30)
        await p.click('#navNext'); check('no se puede empezar sin votación previa', await p.evaluate('step') == 2)
        await p.click('#btnPre'); await p.wait_for_selector('#mEnvio.on', timeout=5000)
        muestra = await p.inner_text('#envioTxt')
        check('aviso previo: muestra con la moción y perfiles, sin el nombre', 'cuatro días' in muestra and 'P001' in muestra and 'Ana' not in muestra)
        await p.check('#envioOk'); await p.click('#envioSi'); await h.esp('S.pre && S.pre.hecho')
        pre = await p.evaluate("({n:Object.keys(S.pre.votos).length, av:S.pre.avisos.map(a=>a.tipo), p1:S.pre.votos.P001.voto, p4:!!S.pre.votos.P004, p3:!!S.pre.votos.P003})")
        check('votación previa: repetido, persona inventada y voto no válido detectados', all(x in pre['av'] for x in ('id_repetido', 'id_desconocido', 'voto_invalido')), str(pre))
        check('de un voto repetido se queda el primero (P001 = en contra)', pre['p1'] == 'contra')
        check('P004 olvidada y P003 no válida se reintentan y obtienen voto', pre['p4'] and pre['p3'] and pre['n'] == 30 and 'reintento' in pre['av'], str(pre))
        check('la votación salió en lotes de 10 personas y en español', len([s for s in h.seen if 'aún no ha empezado' in s['user']]) >= 3 and 'español' in h.seen[0]['user'])
        check('la moción y el idioma quedan fijados', await p.evaluate("S.mocionFija.includes('cuatro días') && S.langDebate==='es'"))
        await p.click('#navNext'); await p.wait_for_timeout(300)
        check('debate: primero le toca al estudiante (a favor)', await p.evaluate("step===3 && plan()[S.ti].quien==='estudiante' && !$('cin').disabled"))
        for k in range(5):
            await h.esp("plan()[S.ti] && plan()[S.ti].quien==='estudiante' && !ocupado")
            if k == 0:
                await p.fill('#cin', 'muy corto'); await p.click('#btnSend'); check('rechaza intervenciones de menos de diez palabras', await p.evaluate('S.turnos.length') == 0)
            await p.fill('#cin', DISCURSO); await p.wait_for_timeout(50); await p.click('#btnSend')
        await h.esp('debateFin() && !ocupado')
        tr = await p.evaluate("S.turnos.map(x=>({q:x.quien,f:x.fase,l:x.lado,rec:!!x.recortado,cif:x.cifras||[],tx:x.texto}))")
        check('12 intervenciones en el orden Munk adaptado: E R E R M E R M R E R E', ''.join(x['q'][0] for x in tr) == 'ererme' + 'rmrere', ''.join(x['q'][0] for x in tr))
        mios = [x for x in tr if x['q'] == 'estudiante']
        check('el correo del estudiante se enmascara antes de enviarse', all('[CORREO]' in x['tx'] and 'ana@umh.es' not in x['tx'] for x in mios))
        check('nunca sale el nombre ni el correo hacia la IA', not any('ana@umh.es' in s['user'] or 'Ana García' in s['user'] for s in h.seen))
        rival = [x for x in tr if x['q'] == 'rival']
        check('el rival: sin markdown ni «Marta:»', all(not x['tx'].startswith('Marta') and '**' not in x['tx'] for x in rival))
        check('el código señala la cifra del rival sin fuente (73)', all('73' in x['cif'] for x in rival))
        check('el discurso larguísimo del rival se recorta', any(x['rec'] for x in rival) and max(len(x['tx'].split()) for x in rival) < 300)
        check('el rival recibe estilo, nivel y su postura (rechaza)', any('Socrático' in s['system'] and 'RECHAZAS' in s['system'] for s in h.seen))
        check('el moderador hace dos preguntas', len([x for x in tr if x['q'] == 'moderador']) == 2)
        await p.wait_for_timeout(400); nmsg = await p.locator('#msgs .db-msg').count(); check('transcripción en pantalla: presentación + 12 intervenciones', nmsg == 13, str(nmsg))
        await p.reload(); await p.wait_for_timeout(700)
        check('al recargar se conserva el debate completo', await p.evaluate('S.turnos.length===12 && debateFin() && S.pre.hecho'))
        await p.evaluate('go(4)'); await p.wait_for_timeout(200)
        await p.click('#btnPost'); await p.wait_for_selector('#mEnvio.on', timeout=5000)
        check('tras recargar, el aviso previo vuelve a pedirse antes de enviar', 'Ponente A' in await p.inner_text('#envioTxt'))
        await p.check('#envioOk'); await p.click('#envioSi'); await h.esp('S.post && S.post.hecho')
        post = await p.evaluate("(()=>{const v=veredicto(S.pre.votos,S.post.votos,S.panel.map(p=>p.id));return {g:v.ganador, gf:v.ganancia.favor, gc:v.ganancia.contra, ko:Object.values(S.post.votos).filter(x=>x.cita&&!x.citaOk).length, okA:Object.values(S.post.votos).filter(x=>x.citaOk&&x.ladoCita==='favor').length, corr:S.post.avisos.filter(a=>a.tipo==='ponente_corregido').length, ses:S.sesiones.length}})()")
        check('votación final: el público lee la transcripción anónima (Ponente A/B, sin «Ana»)', any('Ponente A (a favor)' in s['user'] and 'Ana' not in s['user'] for s in h.seen))
        check('citas inventadas detectadas y descartadas', post['ko'] == 10, str(post))
        check('cita atribuida al ponente equivocado: corregida (P004)', post['corr'] == 1, str(post))
        check('regla Munk calculada por el código: gana «a favor»', post['g'] == 'favor' and round(post['gf'] - post['gc']) > 0, str(post))
        check('el debate se guarda en el progreso', post['ses'] == 1)
        vz = await p.inner_text('#verZona')
        check('el veredicto dice que ganas y muestra lo que más pesó', 'Ganas el debate' in vz and 'Lo que más pesó' in vz and '10 cita(s) no aparecían' in vz, vz[:300])
        await h.descarga('#btnCsvPub', '/tmp/debatia.csv')
        filas = list(csv.reader(open('/tmp/debatia.csv', encoding='utf-8-sig'), delimiter=';'))
        check('CSV del público: cabecera + 30 filas, con BOM y «;»', len(filas) == 31 and filas[0][0] == 'id', str(filas[:2]))
        # ── informe ──
        await p.evaluate('go(5)'); await p.wait_for_timeout(200)
        inf = await p.inner_text('#infZona')
        check('métricas del código sin IA: palabras y muletillas', 'Lo que mide el código' in inf and await p.evaluate("metricasEstudiante(S.turnos,'es').nMul") == 10)
        await p.click('#btnFB'); await h.esp("S.fb && !ocupado")
        fb = await p.evaluate("({lv:S.fb.rubrica.argumentacion.nivel, c1:S.fb.rubrica.argumentacion.citaOk, c2:S.fb.rubrica.evidencias.citaOk, falta:S.fb.rubrica.refutacion.nivel, m:S.fb.momentos[0], av:S.fbAvisos.map(a=>a.tipo)})")
        check('nivel 7 → 3 y avisado', fb['lv'] == 3 and 'nivel_fuera' in fb['av'])
        check('cita del estudiante verificada; inventada marcada', fb['c1'] and not fb['c2'])
        check('dimensión sin nivel → «sin valorar»', fb['falta'] is None and 'sin valorar' in await p.inner_text('#infZona'))
        check('momento con turno inexistente (9): el código lo corrige al 1', fb['m']['turno'] == 1 and fb['m']['citaOk'] and 'turno_corregido' in fb['av'])
        check('detecta la nota que la IA no debía poner', 'nota' in fb['av'])
        nm = await h.descarga('#btnInforme', '/tmp/debatia.html'); html = open('/tmp/debatia.html', encoding='utf-8').read()
        check('informe HTML con resultado, métricas, rúbrica y transcripción', 'Ganas el debate' in html and 'Lo que mide el código' in html and 'Argumentación' in html and 'Transcripción' in html and nm.endswith('.html'))
        await h.descarga('#btnJson', '/tmp/debatia.json'); dj = json.load(open('/tmp/debatia.json', encoding='utf-8'))
        check('JSON sin clave de IA y con veredicto y fuentes', 'sk-test' not in json.dumps(dj) and dj['veredicto']['ganador'] == 'favor' and dj['publico']['fuentes'])
        # inglés: la IA recibe el idioma; el debate en curso sigue en su idioma
        await h.idioma('en'); await p.evaluate('go(5)'); await p.wait_for_timeout(200)
        check('el informe se repinta en inglés', 'What the code measures' in await p.inner_text('#infZona'))
        await h.idioma('es')
        # ── el rival falla (sin saldo): error legible y reintento ──
        await p.evaluate("nuevoDebate(false); S.lado='contra'; S.formato='corto'; go(2)"); await p.wait_for_timeout(200)
        await p.click('#btnPre'); await h.esp('S.pre && S.pre.hecho')
        h.reply_orig = h.reply
        async def sin_saldo(prov, system, user, info):
            if 'Participas en un debate' in system: return ('err', 429, '{"error":{"message":"You exceeded your current quota","code":"insufficient_quota"}}')
            return await reply(prov, system, user, info)
        h.reply = sin_saldo
        await p.evaluate('go(3)'); await h.esp("errorTurno!==''")
        check('sin saldo: el error se ve y hay botón de reintento', await p.locator('#btnReintenta').count() == 1 and await p.evaluate('S.turnos.length') == 0, await p.inner_text('#estadoChat'))
        h.reply = reply; await p.click('#btnReintenta'); await h.esp("plan()[S.ti].quien==='estudiante' && !ocupado")
        check('tras reintentar, el rival abre (el estudiante va en contra)', await p.evaluate("S.turnos.length===1 && S.turnos[0].quien==='rival' && S.turnos[0].lado==='favor'"))
        # ── proveedores: cabeceras ──
        for prov, k in (('gemini', 'AIza-test'), ('anthropic', 'sk-ant-test')):
            await p.evaluate(f"localStorage.setItem(APP+'_prov','{prov}'); localStorage.setItem(PROV['{prov}'].k,'{k}')")
            await p.fill('#cin', DISCURSO); await p.click('#btnSend'); await h.esp("plan()[S.ti].quien==='estudiante' && !ocupado")
            u = h.seen[-1]
            check(f'{prov}: la clave va en la cabecera, no en el cuerpo', u['prov'] == prov and u['auth'] and k not in u['user'] and (prov != 'anthropic' or u.get('browser_header') == 'true'), str(u)[:200])
        await p.evaluate("localStorage.setItem(APP+'_prov','openai')")
        check('ninguna excepción en todo el recorrido', h.errors == [], str(h.errors))
        # ── móvil ──
        for l in ('es', 'en', 'pt'):
            check(f'móvil sin desborde horizontal ({l})', not await h.desborde_movil(f"setLang('{l}'); aplicaEjemplo(); go(3)") and not await h.desborde_movil(f"setLang('{l}'); aplicaEjemplo(); go(4)") and not await h.desborde_movil(f"setLang('{l}'); aplicaEjemplo(); go(5)"))
        check('móvil: portada y pantalla de moción sin desborde', not await h.desborde_movil("go(0)") and not await h.desborde_movil("go(1)") and not await h.desborde_movil("go(2)"))
        # ── capturas ──
        await p.evaluate("setLang('es'); aplicaEjemplo()")
        for s, n in ((0, 'portada'), (1, 'mocion'), (2, 'publico'), (3, 'debate'), (4, 'veredicto'), (5, 'informe')):
            await p.evaluate(f'go({s})'); await p.wait_for_timeout(250); await h.shot(f'/tmp/cap_{n}.png')
    print('\nTODO OK' if ok else '\nHAY FALLOS'); sys.exit(0 if ok else 1)

asyncio.run(main())
