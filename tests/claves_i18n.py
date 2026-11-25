"""Lista las claves que la app traduce: t('…') del JS, data-i18n del HTML y textos de STEPS/NAV/GLOS/HUBS (más las dinámicas)."""
import re, json, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
js = ''.join((R/'src'/f).read_text(encoding='utf-8') for f in ['app.js', 'avatar.js'])
body = (R/'src'/'body.html').read_text(encoding='utf-8')
claves = []
def add(k):
    if k not in claves: claves.append(k)
lit = r"'((?:[^'\\]|\\.)*)'"
for m in re.finditer(r"\bt\(\s*" + lit, js): add(m.group(1).replace("\\'", "'"))
for m in re.finditer(r"\bt\(\s*[^()']*?\?\s*" + lit + r"\s*:\s*" + lit, js): add(m.group(1)); add(m.group(2))
for m in re.finditer(r'data-i18n="([^"]+)"', body): add(m.group(1))
for m in re.finditer(r'data-i18n-attr="([^"]+)"', body):
    for par in m.group(1).split(';'): add(par.split(':', 1)[1].strip())
for nombre in ['STEPS', 'HUBS', 'NAV', 'GLOS']:
    m = re.search(r'const ' + nombre + r' = (\[[\s\S]*?\]);\n', js)
    for s in re.findall(lit, m.group(1)): add(s.replace("\\'", "'"))
for k in ['apertura', 'replica', 'pregunta', 'respuesta', 'cierre', 'intro']: add('fase.' + k)
for k in ['favor', 'contra', 'indeciso', 'azar']: add('lado.' + k)
for k in ['corto', 'munk']: add('formato.' + k)
for k in ['id_desconocido', 'id_repetido', 'voto_invalido', 'ponente_corregido', 'reintento']: add('aviso.' + k)
for k in ['mujer', 'hombre']: add(k)
if __name__ == '__main__':
    print(json.dumps(claves, ensure_ascii=False, indent=0))
    print(len(claves))
