/* ══ DebatIA · datos de la app (sin lógica). Los textos que dependen del idioma van como {es, en, pt}; L() elige el activo. ══ */
const L = o => (o && typeof o === 'object' ? (o[typeof LANG !== 'undefined' ? LANG : 'es'] ?? o.es) : o);

/* ── banco de mociones (formato de los Munk Debates: una afirmación que se defiende o se rechaza) ── */
const CATS = {
  edu: {es: 'Educación', en: 'Education', pt: 'Educação'}, tec: {es: 'Tecnología', en: 'Technology', pt: 'Tecnologia'},
  soc: {es: 'Sociedad', en: 'Society', pt: 'Sociedade'}, eco: {es: 'Economía y trabajo', en: 'Economy and work', pt: 'Economia e trabalho'},
  sal: {es: 'Salud y ciencia', en: 'Health and science', pt: 'Saúde e ciência'}, amb: {es: 'Medio ambiente y ciudad', en: 'Environment and cities', pt: 'Ambiente e cidade'}
};
const MOCIONES = [
  {id: 'ia_examen', cat: 'edu', es: 'Las universidades deberían permitir el uso de la inteligencia artificial generativa en los exámenes.', en: 'Universities should allow the use of generative artificial intelligence in exams.', pt: 'As universidades deveriam permitir o uso da inteligência artificial generativa nos exames.'},
  {id: 'deberes', cat: 'edu', es: 'Los deberes escolares deberían prohibirse en la educación primaria.', en: 'Homework should be banned in primary school.', pt: 'Os trabalhos de casa deveriam ser proibidos no ensino básico.'},
  {id: 'moviles', cat: 'edu', es: 'Los teléfonos móviles deberían prohibirse en los institutos durante toda la jornada.', en: 'Mobile phones should be banned in secondary schools for the whole school day.', pt: 'Os telemóveis deveriam ser proibidos nas escolas secundárias durante todo o dia.'},
  {id: 'redes', cat: 'tec', es: 'Las redes sociales hacen más mal que bien a la democracia.', en: 'Social media does more harm than good to democracy.', pt: 'As redes sociais fazem mais mal do que bem à democracia.'},
  {id: 'robots', cat: 'tec', es: 'Las empresas que sustituyen empleos por robots o IA deberían pagar un impuesto específico.', en: 'Companies that replace jobs with robots or AI should pay a specific tax.', pt: 'As empresas que substituem empregos por robôs ou IA deveriam pagar um imposto específico.'},
  {id: 'voto', cat: 'soc', es: 'El voto en las elecciones generales debería ser obligatorio.', en: 'Voting in general elections should be compulsory.', pt: 'O voto nas eleições legislativas deveria ser obrigatório.'},
  {id: 'turismo', cat: 'soc', es: 'El turismo masivo hace más mal que bien a las ciudades que lo reciben.', en: 'Mass tourism does more harm than good to the cities that receive it.', pt: 'O turismo de massas faz mais mal do que bem às cidades que o recebem.'},
  {id: 'cuatro_dias', cat: 'eco', es: 'La semana laboral de cuatro días debería ser la norma.', en: 'The four-day working week should be the norm.', pt: 'A semana de trabalho de quatro dias deveria ser a norma.'},
  {id: 'teletrabajo', cat: 'eco', es: 'Teletrabajar debería ser un derecho para quien pueda hacer su trabajo a distancia.', en: 'Remote work should be a right for anyone who can do their job remotely.', pt: 'O teletrabalho deveria ser um direito para quem possa fazer o seu trabalho à distância.'},
  {id: 'genes', cat: 'sal', es: 'Debería permitirse editar los genes de embriones humanos para evitar enfermedades graves.', en: 'Editing the genes of human embryos to prevent serious diseases should be allowed.', pt: 'Deveria ser permitido editar os genes de embriões humanos para evitar doenças graves.'},
  {id: 'nuclear', cat: 'amb', es: 'La energía nuclear es imprescindible para frenar el cambio climático.', en: 'Nuclear energy is essential to curb climate change.', pt: 'A energia nuclear é imprescindível para travar as alterações climáticas.'},
  {id: 'coches', cat: 'amb', es: 'Los coches de combustión deberían prohibirse en el centro de las ciudades.', en: 'Combustion-engine cars should be banned from city centres.', pt: 'Os carros a combustão deveriam ser proibidos no centro das cidades.'}
];

/* ── el rival: 8 avatares 3D (los mismos de AnamnesIA: MPFB/MakeHuman CC0 con rig de TalkingHead) ── */
const RIVALES = [
  {id: 'mujer_25', nombre: 'Lucía', edad: 25, sexo: 'mujer', emoji: '👩'}, {id: 'mujer_40', nombre: 'Marta', edad: 40, sexo: 'mujer', emoji: '👩‍💼'},
  {id: 'mujer_58', nombre: 'Carmen', edad: 58, sexo: 'mujer', emoji: '👩‍🏫'}, {id: 'mujer_75', nombre: 'Pilar', edad: 75, sexo: 'mujer', emoji: '👵'},
  {id: 'hombre_25', nombre: 'Daniel', edad: 25, sexo: 'hombre', emoji: '👨'}, {id: 'hombre_40', nombre: 'Javier', edad: 40, sexo: 'hombre', emoji: '👨‍💼'},
  {id: 'hombre_58', nombre: 'Antonio', edad: 58, sexo: 'hombre', emoji: '👨‍🏫'}, {id: 'hombre_75', nombre: 'Manuel', edad: 75, sexo: 'hombre', emoji: '👴'}
];
/* estilo y nivel del rival: el nombre y la descripción se muestran; «p» es la instrucción (en español) que recibe la IA */
const ESTILOS = [
  {id: 'academico', i: '🎓', n: {es: 'Académico', en: 'Academic', pt: 'Académico'}, s: {es: 'Rigor, matices y razonamiento paso a paso', en: 'Rigour, nuance and step-by-step reasoning', pt: 'Rigor, nuances e raciocínio passo a passo'},
    p: 'Académico: razonas paso a paso, defines los términos, reconoces matices y concedes lo evidente para reforzar lo esencial.'},
  {id: 'retorico', i: '🔥', n: {es: 'Retórico', en: 'Rhetorical', pt: 'Retórico'}, s: {es: 'Emoción, anécdotas y frases memorables', en: 'Emotion, anecdotes and memorable lines', pt: 'Emoção, episódios e frases memoráveis'},
    p: 'Retórico: apelas a las emociones y a los valores del público, cuentas anécdotas verosímiles (presentadas como ejemplos, nunca como hechos verificados) y buscas frases memorables.'},
  {id: 'socratico', i: '❓', n: {es: 'Socrático', en: 'Socratic', pt: 'Socrático'}, s: {es: 'Preguntas que ponen a prueba tus premisas', en: 'Questions that test your premises', pt: 'Perguntas que põem à prova as suas premissas'},
    p: 'Socrático: haces preguntas incisivas a tu rival, señalas contradicciones en sus premisas y concedes de forma táctica para llevarle a tu terreno.'},
  {id: 'pragmatico', i: '⚖️', n: {es: 'Pragmático', en: 'Pragmatic', pt: 'Pragmático'}, s: {es: 'Costes, consecuencias y alternativas', en: 'Costs, consequences and alternatives', pt: 'Custos, consequências e alternativas'},
    p: 'Pragmático: hablas de costes, consecuencias prácticas, quién gana y quién pierde, y propones alternativas concretas.'}
];
const NIVELES = [
  {id: 'basico', i: '🌱', n: {es: 'Básico', en: 'Basic', pt: 'Básico'}, s: {es: 'Argumentos sencillos; deja huecos que puedes aprovechar', en: 'Simple arguments; leaves gaps you can exploit', pt: 'Argumentos simples; deixa lacunas que pode aproveitar'},
    p: 'Básico: usas argumentos sencillos y generales, no siempre respondes a todo lo que dice tu rival y dejas algún punto débil.'},
  {id: 'intermedio', i: '🌿', n: {es: 'Intermedio', en: 'Intermediate', pt: 'Intermédio'}, s: {es: 'Sólido y atento a tus argumentos', en: 'Solid and attentive to your arguments', pt: 'Sólido e atento aos seus argumentos'},
    p: 'Intermedio: argumentas con solidez y respondes a los argumentos principales de tu rival.'},
  {id: 'experto', i: '🌳', n: {es: 'Experto', en: 'Expert', pt: 'Especialista'}, s: {es: 'Refuta cada punto y anticipa tus objeciones', en: 'Rebuts every point and anticipates your objections', pt: 'Refuta cada ponto e antecipa as suas objeções'},
    p: 'Experto: refutas cada argumento de tu rival en su versión más fuerte, anticipas sus objeciones y explotas cualquier contradicción o falta de pruebas.'}
];
/* ── formato del debate: Munk adaptado a 1 contra 1 (minutos por intervención) ── */
const FORMATOS = {
  corto: {apertura: 2, replica: 1.5, respuesta: 1, cierre: 1},
  munk: {apertura: 3, replica: 2, respuesta: 1, cierre: 1.5}
};
const PPM_EST = 140;    // ritmo con el que se ESTIMA la duración hablada de un texto escrito (orientativo)
const PPM_RIVAL = 130;  // extensión que se pide al rival: minutos × 130 palabras

/* ── rúbrica de oratoria: la define el código (la IA solo elige el nivel 0-3 y lo justifica con una cita) ── */
const RUBRICA = [
  {id: 'argumentacion', i: '🧱', c: '#6B4FD8', n: {es: 'Argumentación', en: 'Argumentation', pt: 'Argumentação'}, d: {
    es: ['Afirmaciones sin razones', 'Tesis clara con alguna razón suelta', 'Tesis y razones bien conectadas', 'Línea argumental sólida, jerarquizada y consistente'],
    en: ['Claims without reasons', 'Clear thesis with some loose reasons', 'Thesis and reasons well connected', 'Solid, prioritised and consistent line of argument'],
    pt: ['Afirmações sem razões', 'Tese clara com alguma razão solta', 'Tese e razões bem ligadas', 'Linha argumentativa sólida, hierarquizada e consistente']}},
  {id: 'evidencias', i: '🔎', c: '#1F6FB2', n: {es: 'Evidencias y ejemplos', en: 'Evidence and examples', pt: 'Evidências e exemplos'}, d: {
    es: ['Sin apoyos', 'Ejemplos genéricos', 'Ejemplos pertinentes y concretos', 'Apoyos variados, pertinentes y bien explicados'],
    en: ['No support', 'Generic examples', 'Relevant, concrete examples', 'Varied, relevant and well-explained support'],
    pt: ['Sem apoios', 'Exemplos genéricos', 'Exemplos pertinentes e concretos', 'Apoios variados, pertinentes e bem explicados']}},
  {id: 'refutacion', i: '🛡️', c: '#E4572E', n: {es: 'Refutación', en: 'Rebuttal', pt: 'Refutação'}, d: {
    es: ['Ignora al rival', 'Alude al rival sin rebatirlo', 'Rebate sus argumentos principales', 'Rebate la versión más fuerte del rival y lo aprovecha'],
    en: ['Ignores the opponent', 'Mentions the opponent without rebutting', 'Rebuts the main arguments', 'Rebuts the strongest version of the opponent and turns it around'],
    pt: ['Ignora o rival', 'Alude ao rival sem o rebater', 'Rebate os argumentos principais', 'Rebate a versão mais forte do rival e tira partido dela']}},
  {id: 'estructura', i: '🧭', c: '#0E8C7A', n: {es: 'Estructura', en: 'Structure', pt: 'Estrutura'}, d: {
    es: ['Desordenado', 'Orden reconocible pero irregular', 'Introducción, desarrollo y cierre claros', 'Estructura clara con transiciones y señales para el público'],
    en: ['Disorganised', 'Recognisable but uneven order', 'Clear introduction, body and close', 'Clear structure with transitions and signposting for the audience'],
    pt: ['Desorganizado', 'Ordem reconhecível mas irregular', 'Introdução, desenvolvimento e fecho claros', 'Estrutura clara com transições e sinais para o público']}},
  {id: 'persuasion', i: '🎙️', c: '#C98200', n: {es: 'Persuasión y estilo', en: 'Persuasion and style', pt: 'Persuasão e estilo'}, d: {
    es: ['Plano o confuso', 'Correcto pero poco persuasivo', 'Conecta con el público y convence', 'Memorable: adapta el registro al público y deja frases que se recuerdan'],
    en: ['Flat or confusing', 'Correct but not very persuasive', 'Connects with the audience and convinces', 'Memorable: adapts register to the audience and leaves lines people remember'],
    pt: ['Plano ou confuso', 'Correto mas pouco persuasivo', 'Liga-se ao público e convence', 'Memorável: adapta o registo ao público e deixa frases que se recordam']}}
];

/* ── lo que el código cuenta en tu discurso (listas orientativas: una «posible muletilla» puede ser un uso legítimo) ── */
const MULETILLAS = {
  es: ['eh', 'ehm', 'em', 'mmm', 'o sea', 'en plan', 'digamos', 'básicamente', 'literalmente', 'vale', 'sabes', 'a ver', 'como que', 'tipo'],
  en: ['um', 'uh', 'er', 'erm', 'like', 'you know', 'basically', 'literally', 'actually', 'i mean', 'sort of', 'kind of', 'so yeah'],
  pt: ['hum', 'tipo', 'pronto', 'né', 'quer dizer', 'basicamente', 'literalmente', 'sabes', 'pois', 'portanto assim']
};
const CONECTORES = {
  es: ['en primer lugar', 'en segundo lugar', 'por último', 'además', 'sin embargo', 'no obstante', 'por tanto', 'por lo tanto', 'en consecuencia', 'por ejemplo', 'es decir', 'en cambio', 'aunque', 'porque', 'así que', 'en conclusión', 'en resumen', 'dado que', 'puesto que'],
  en: ['first', 'second', 'firstly', 'secondly', 'finally', 'moreover', 'furthermore', 'however', 'therefore', 'consequently', 'for example', 'for instance', 'that is', 'in contrast', 'although', 'because', 'in conclusion', 'in short', 'since'],
  pt: ['em primeiro lugar', 'em segundo lugar', 'por último', 'além disso', 'no entanto', 'contudo', 'portanto', 'por isso', 'por exemplo', 'ou seja', 'pelo contrário', 'embora', 'porque', 'em conclusão', 'em suma', 'dado que', 'uma vez que']
};
const REFUTA = {
  es: ['mi oponente', 'mi rival', 'ha dicho', 'has dicho', 'ha afirmado', 'usted dice', 'tú dices', 'sostiene que', 'se equivoca', 'te equivocas', 'no es cierto', 'al contrario', 'frente a lo que'],
  en: ['my opponent', 'you said', 'has said', 'claims that', 'argues that', 'is wrong', 'you are wrong', 'not true', 'on the contrary', 'contrary to'],
  pt: ['o meu oponente', 'a minha oponente', 'o meu adversário', 'a minha adversária', 'disse que', 'afirmou', 'defende que', 'está enganado', 'está enganada', 'não é verdade', 'pelo contrário', 'ao contrário do que']
};

/* ── el público sintético: población de España, adultos (INE 2025; datos y fuentes tomados de PanelIA) ── */
const FUENTES = {
  edad: {txt: 'INE · Estadística continua de población / Censo anual, población residente por edad simple a 1 de enero de 2025 (tabla 56934)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=56934'},
  sexo: {txt: 'INE · Censo anual de población 2025: 24.090.369 hombres y 25.037.928 mujeres (1 de enero de 2025)', url: 'https://www.ine.es/dyngs/Prensa/es/CensoVariables2025.htm'},
  ccaa: {txt: 'INE · España en cifras 2026, cifras de población a 1 de enero de 2025 por comunidad y ciudad autónoma', url: 'https://ine.es/prodyser/espa_cifras/02_POBLACION.pdf'},
  estudios: {txt: 'INE · EPA 2025, población de 16 y más años por nivel de formación alcanzado y grupo de edad (tabla 65947, miles de personas)', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=65947'}
};
const INE_EDAD = {18: 541048, 19: 539336, 20: 542720, 21: 541011, 22: 530297, 23: 534266, 24: 545337, 25: 538328, 26: 530132, 27: 542646, 28: 540956, 29: 545909,
  30: 554625, 31: 569020, 32: 583227, 33: 579789, 34: 587025, 35: 594234, 36: 602862, 37: 608299, 38: 619875, 39: 636872, 40: 657661, 41: 675794, 42: 709711, 43: 736060, 44: 767655,
  45: 785222, 46: 815933, 47: 824326, 48: 835442, 49: 826362, 50: 818832, 51: 796048, 52: 790695, 53: 775670, 54: 762736, 55: 751501, 56: 742011, 57: 743726, 58: 722822, 59: 713889,
  60: 719621, 61: 681641, 62: 655831, 63: 636746, 64: 634978, 65: 614009, 66: 596437, 67: 578177, 68: 535483, 69: 514981, 70: 486267, 71: 481403, 72: 473159, 73: 438480, 74: 421282,
  75: 429812, 76: 440715, 77: 394677, 78: 368513, 79: 374227, 80: 345232, 81: 328082, 82: 272004, 83: 240262, 84: 278573, 85: 172754, 86: 182772, 87: 189025, 88: 187740, 89: 163947,
  90: 142421, 91: 124131, 92: 104209, 93: 80717, 94: 65130, 95: 47673, 96: 35879, 97: 24450, 98: 17279, 99: 11685, 100: 6968, 101: 4364, 102: 2668, 103: 1404, 104: 824, 105: 810};
const INE_SEXO = {mujer: 25037928, hombre: 24090369};
const INE_CCAA = {AN: ['Andalucía', 8676713], AR: ['Aragón', 1364621], AS: ['Asturias', 1015128], IB: ['Illes Balears', 1249844], CN: ['Canarias', 2258866], CB: ['Cantabria', 593623],
  CL: ['Castilla y León', 2401221], CM: ['Castilla-La Mancha', 2126378], CT: ['Cataluña', 8124126], VC: ['Comunitat Valenciana', 5425182], EX: ['Extremadura', 1053345], GA: ['Galicia', 2714741],
  MD: ['Comunidad de Madrid', 7113886], MC: ['Región de Murcia', 1586989], NC: ['Navarra', 683854], PV: ['País Vasco', 2242343], RI: ['La Rioja', 326803], CE: ['Ceuta', 83567], ML: ['Melilla', 87067]};
/* EPA 2025 (miles): [edad mínima, sin estudios o primaria, ESO, bachillerato o FP media, superior]
   sin estudios o primaria = analfabetos + primarios incompletos + primaria; bachillerato o FP = 2.ª etapa general + profesional */
const INE_ESTUDIOS = [[16, 6.6 + 3.1 + 91.4, 1298.8, 586.8 + 142.7, 12.6], [20, 9.3 + 8.6 + 55.7, 456.3, 1040.6 + 331.8, 802.0], [25, 12.3 + 15.0 + 81.3, 510.3, 392.8 + 246.1, 1456.8],
  [30, 14.5 + 25.6 + 116.4, 593.1, 330.5 + 312.0, 1473.0], [35, 14.1 + 42.0 + 131.8, 765.7, 350.8 + 317.0, 1423.3], [40, 26.0 + 40.9 + 163.9, 939.1, 440.1 + 376.4, 1494.0],
  [45, 41.4 + 59.4 + 164.4, 1068.9, 536.7 + 396.7, 1780.0], [50, 35.0 + 51.1 + 190.5, 1215.9, 479.9 + 392.4, 1596.4], [55, 39.4 + 63.8 + 187.8, 1217.3, 498.2 + 384.8, 1287.4],
  [60, 33.5 + 74.4 + 258.1, 1190.4, 474.7 + 316.0, 999.6], [65, 35.5 + 121.0 + 438.3, 989.2, 403.6 + 184.6, 762.0], [70, 231.3 + 1075.7 + 2462.1, 1472.3, 561.4 + 254.2, 1135.6]];
const EST_CATS = ['primaria', 'eso', 'media', 'superior'];
const TRAMOS = [[18, 29], [30, 44], [45, 64], [65, 200]];   // tramos de edad para mostrar la composición del público
const EST_N = {primaria: {es: 'primaria o sin estudios', en: 'primary or no schooling', pt: 'primário ou sem estudos'}, eso: {es: 'ESO', en: 'lower secondary', pt: 'ensino básico (3.º ciclo)'},
  media: {es: 'bachillerato o FP', en: 'upper secondary or VET', pt: 'secundário ou profissional'}, superior: {es: 'estudios superiores', en: 'higher education', pt: 'ensino superior'}};
