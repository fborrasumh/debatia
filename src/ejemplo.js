/* ══ DebatIA · ejemplo de demostración (sin clave y sin red). Debate FICTICIO escrito a mano en cada idioma;
      los votos del público se generan por código con una semilla fija y pasan por las mismas validaciones que los reales. ══ */
const EJ = {
  es: {
    turnos: [
      'Buenas tardes. Hoy defiendo que las universidades deberían permitir la inteligencia artificial generativa en los exámenes. En primer lugar, porque la inteligencia artificial ya está en las aulas y prohibirla solo premia a quien hace trampas sin ser visto. En segundo lugar, porque un examen debería medir lo que haremos en la vida profesional, y en cualquier trabajo vamos a usar estas herramientas a diario. O sea, evaluar sin ellas es como examinar a un contable sin calculadora. Y en tercer lugar, porque permitirla nos obliga a hacer mejores preguntas: preguntas que pidan criterio, justificación y responsabilidad, no memoria. No pido barra libre. Pido reglas claras: qué herramienta, para qué tarea y con qué declaración de uso.',
      'Gracias. Mi oponente habla de futuro, pero un examen no es el futuro: es una foto honesta de lo que sabe una persona hoy. Un examen mide lo que sabe una persona, no lo que sabe una máquina que tiene en el bolsillo. Si permitimos la inteligencia artificial generativa, ya no sabremos si quien aprueba entiende la materia o solo sabe pedirla. Y eso tiene consecuencias: un título universitario es una promesa a la sociedad de que esa persona domina unos conocimientos. Además, la desigualdad crece: quien pueda pagar la versión más potente partirá con ventaja. Usemos la inteligencia artificial para aprender, para practicar y para recibir comentarios. Pero el momento de demostrar lo aprendido debe ser nuestro, no de la máquina.',
      'Mi rival dice que un examen es una foto honesta. Pero esa foto ya está trucada: hoy quien quiere usar la inteligencia artificial la usa a escondidas, y quien respeta las normas sale perdiendo. Sobre la desigualdad, tiene razón en el riesgo, pero la solución es que la universidad ofrezca la misma herramienta a todo el estudiantado, igual que ofrece bibliotecas o programas. Y sobre la promesa del título: básicamente, la sociedad no necesita personas que memoricen, necesita personas que sepan decidir con buenas herramientas y responder de sus decisiones.',
      'Se dice que la foto ya está trucada. Si hay trampas, la respuesta es vigilar mejor, no legalizar la trampa. Y se nos propone que la universidad reparta la misma herramienta a todos. Suena bien, pero la herramienta cambia cada mes y nadie puede garantizar que funcione igual para todos. Hay algo más grave: para decidir con buenas herramientas primero hay que saber detectar cuándo la herramienta se equivoca. Y eso solo lo consigue quien ha aprendido sin ella. Sin esa base, el criterio que reclama mi oponente es imposible.',
      'Una pregunta para los dos: si la inteligencia artificial puede aprobar hoy muchos exámenes, ¿el problema está en la herramienta o en cómo estamos evaluando?',
      'Está en cómo evaluamos. Si una máquina aprueba un examen, ese examen medía memoria, no comprensión. Permitir la inteligencia artificial nos obliga a diseñar pruebas en las que haya que explicar por qué una respuesta es correcta, comparar fuentes y defender una decisión en voz alta. Eso es más difícil de copiar, no más fácil.',
      'En las dos cosas. Es verdad que hay exámenes que solo miden memoria y deben cambiar. Pero cambiar la evaluación no exige meter la máquina en el examen. Podemos hacer orales, casos prácticos y trabajos defendidos en clase sin inteligencia artificial, y así sabremos qué entiende cada estudiante.',
      'Pensemos en el mundo profesional: ¿un médico o una ingeniera que no supieran usar la inteligencia artificial estarían bien formados dentro de diez años?',
      'Necesitarán usarla, sin duda, y la universidad debe enseñarles a hacerlo. Pero un médico que no sepa reconocer un diagnóstico sin ayuda no puede supervisar a la máquina. Primero se aprende el oficio; después se aprende a delegar. El examen protege ese orden.',
      'No estarían bien formados. Y si nunca les hemos evaluado usándola, no sabremos si la usan bien. Hoy les exigimos que trabajen con estas herramientas y en el examen se las quitamos: eso no protege ningún orden, solo retrasa el aprendizaje que más van a necesitar.',
      'Esta tarde no discutimos si la inteligencia artificial es útil: lo es. Discutimos si el examen debe medir a la persona o a la persona con su máquina. Pido a quienes dudan que piensen en el médico, en la ingeniera, en el juez que mañana firmará con su nombre. Queremos saber que entienden lo que firman. Por eso, voten en contra de la moción.',
      'Mi rival nos pide elegir entre la persona y la máquina, pero esa elección ya no existe fuera del aula. Lo que sí podemos elegir es si evaluamos con reglas claras o seguimos fingiendo que la herramienta no está. Permitirla, con declaración de uso y preguntas que exijan criterio, hace los exámenes más honestos y más útiles. Por eso les pido que voten a favor.'
    ],
    citasE: ['prohibirla solo premia a quien hace trampas sin ser visto', 'evaluar sin ellas es como examinar a un contable sin calculadora', 'la universidad ofrezca la misma herramienta a todo el estudiantado', 'Si una máquina aprueba un examen, ese examen medía memoria, no comprensión', 'seguimos fingiendo que la herramienta no está'],
    citasR: ['Un examen mide lo que sabe una persona, no lo que sabe una máquina que tiene en el bolsillo', 'Si hay trampas, la respuesta es vigilar mejor, no legalizar la trampa', 'Primero se aprende el oficio; después se aprende a delegar', 'Queremos saber que entienden lo que firman'],
    motivos: {
      favor: ['Uso estas herramientas a diario y me parece absurdo prohibirlas.', 'El mundo laboral ya funciona así.', 'Prefiero reglas claras a prohibiciones que nadie cumple.'],
      contra: ['Un examen debe medir lo que sabe cada uno.', 'Me preocupa que se pierda el esfuerzo de estudiar.', 'No me fío de que se use bien.'],
      indeciso: ['Depende de cómo se haga.', 'No tengo una opinión clara todavía.', 'Veo ventajas e inconvenientes.'],
      a_favor: ['Me convenció que la prohibición premia al que hace trampas.', 'Lo de reglas claras y declarar el uso me parece razonable.'],
      sigue_favor: ['Sigo pensando lo mismo, y el debate me lo confirmó.'],
      a_contra: ['El argumento del médico que firma me hizo dudar.'],
      sigue_contra: ['Primero hay que aprender sin ayuda.', 'Vigilar mejor me parece más sensato.'],
      sigue_indeciso: ['Los dos tenían parte de razón.']
    },
    fb: {
      resumen: 'Defendiste la moción con una tesis clara y tres razones bien ordenadas, y supiste convertir la objeción de la desigualdad en una propuesta. Tu mejor momento fue la respuesta sobre la evaluación. Te faltó rebatir el argumento de fondo de tu rival: que sin aprender primero sin ayuda no se puede supervisar a la máquina.',
      rubrica: {
        argumentacion: {nivel: 2, comentario: 'Tesis y tres razones claras; la tercera (mejores preguntas) quedó poco desarrollada.', cita: 'En primer lugar, porque la inteligencia artificial ya está en las aulas'},
        evidencias: {nivel: 1, comentario: 'Usas analogías eficaces, pero ningún ejemplo concreto de una universidad que ya lo haga.', cita: 'evaluar sin ellas es como examinar a un contable sin calculadora'},
        refutacion: {nivel: 2, comentario: 'Respondes a la «foto trucada» y a la desigualdad; no rebates que hace falta una base previa.', cita: 'Mi rival dice que un examen es una foto honesta'},
        estructura: {nivel: 3, comentario: 'Apertura numerada y cierre que retoma la tesis.', cita: 'Pido reglas claras: qué herramienta, para qué tarea y con qué declaración de uso'},
        persuasion: {nivel: 2, comentario: 'Cierre directo al público; algunas muletillas restan fuerza.', cita: 'Por eso les pido que voten a favor'}
      },
      momentos: [
        {turno: 3, tipo: 'acierto', cita: 'Si una máquina aprueba un examen, ese examen medía memoria, no comprensión', comentario: 'Das la vuelta a la pregunta y conviertes una debilidad en argumento.'},
        {turno: 4, tipo: 'oportunidad', cita: 'eso no protege ningún orden, solo retrasa el aprendizaje', comentario: 'Afirmas sin explicar: aquí había que mostrar cómo se aprende a supervisar usando la herramienta.'}
      ],
      fortalezas: ['Estructura numerada, fácil de seguir.', 'Conviertes la objeción de la desigualdad en una propuesta concreta.'],
      mejoras: ['Rebate el argumento más fuerte de tu rival, no solo los secundarios.', 'Sustituye «o sea» y «básicamente» por pausas.'],
      ejercicio: 'Escribe en una frase el mejor argumento de tu rival y prepara un minuto de réplica solo contra él.'
    }
  },
  en: {
    turnos: [
      'Good afternoon. Today I argue that universities should allow generative artificial intelligence in exams. First, because artificial intelligence is already in the classroom and banning it only rewards those who cheat without being seen. Second, because an exam should measure what we will do in our professional lives, and in any job we will use these tools every day. I mean, assessing without them is like examining an accountant without a calculator. And third, because allowing it forces us to ask better questions: questions that demand judgement, justification and responsibility, not memory. I am not asking for a free-for-all. I am asking for clear rules: which tool, for which task and with what declaration of use.',
      'Thank you. My opponent talks about the future, but an exam is not the future: it is an honest snapshot of what a person knows today. An exam measures what a person knows, not what a machine in their pocket knows. If we allow generative artificial intelligence, we will no longer know whether those who pass understand the subject or only know how to ask for it. And that has consequences: a university degree is a promise to society that this person masters a body of knowledge. Moreover, inequality grows: whoever can pay for the most powerful version will start with an advantage. Let us use artificial intelligence to learn, to practise and to get feedback. But the moment of showing what we have learned must be ours, not the machine’s.',
      'My opponent says that an exam is an honest snapshot. But that snapshot is already doctored: today whoever wants to use artificial intelligence uses it secretly, and whoever respects the rules loses out. On inequality, the risk is real, but the solution is for the university to offer the same tool to every student, just as it offers libraries or software. And on the promise of the degree: basically, society does not need people who memorise, it needs people who can decide with good tools and answer for their decisions.',
      'We are told that the snapshot is already doctored. If there is cheating, the answer is better supervision, not legalising the cheating. And we are told that the university should hand out the same tool to everyone. It sounds good, but the tool changes every month and nobody can guarantee that it works the same for everyone. There is something more serious: to decide with good tools you first have to be able to spot when the tool is wrong. And only those who have learned without it can do that. Without that foundation, the judgement my opponent calls for is impossible.',
      'A question for both of you: if artificial intelligence can pass many exams today, is the problem the tool or the way we assess?',
      'It is the way we assess. If a machine passes an exam, that exam measured memory, not understanding. Allowing artificial intelligence forces us to design tests in which you have to explain why an answer is correct, compare sources and defend a decision out loud. That is harder to copy, not easier.',
      'Both. It is true that some exams only measure memory and must change. But changing assessment does not require putting the machine in the exam. We can use oral exams, case studies and work defended in class without artificial intelligence, and then we will know what each student understands.',
      'Let us think about professional life: would a doctor or an engineer who could not use artificial intelligence be well trained ten years from now?',
      'They will need to use it, no doubt, and the university must teach them how. But a doctor who cannot recognise a diagnosis without help cannot supervise the machine. First you learn the craft; then you learn to delegate. The exam protects that order.',
      'They would not be well trained. And if we have never assessed them using it, we will not know whether they use it well. Today we require them to work with these tools and in the exam we take them away: that does not protect any order, it only delays the learning they will need most.',
      'This afternoon we are not debating whether artificial intelligence is useful: it is. We are debating whether the exam should measure the person or the person with their machine. I ask those who are undecided to think of the doctor, the engineer, the judge who tomorrow will sign with their own name. We want to know that they understand what they sign. That is why I ask you to vote against the motion.',
      'My opponent asks us to choose between the person and the machine, but that choice no longer exists outside the classroom. What we can choose is whether we assess with clear rules or keep pretending that the tool is not there. Allowing it, with a declaration of use and questions that demand judgement, makes exams more honest and more useful. That is why I ask you to vote in favour.'
    ],
    citasE: ['banning it only rewards those who cheat without being seen', 'assessing without them is like examining an accountant without a calculator', 'the university to offer the same tool to every student', 'If a machine passes an exam, that exam measured memory, not understanding', 'keep pretending that the tool is not there'],
    citasR: ['An exam measures what a person knows, not what a machine in their pocket knows', 'If there is cheating, the answer is better supervision, not legalising the cheating', 'First you learn the craft; then you learn to delegate', 'We want to know that they understand what they sign'],
    motivos: {
      favor: ['I use these tools every day and banning them seems absurd.', 'The world of work already works this way.', 'I prefer clear rules to bans nobody follows.'],
      contra: ['An exam should measure what each person knows.', 'I worry that the effort of studying will be lost.', 'I do not trust that it will be used well.'],
      indeciso: ['It depends on how it is done.', 'I do not have a clear opinion yet.', 'I see pros and cons.'],
      a_favor: ['I was convinced that the ban rewards cheaters.', 'Clear rules and declaring use sound reasonable to me.'],
      sigue_favor: ['I still think the same, and the debate confirmed it.'],
      a_contra: ['The argument about the doctor who signs made me doubt.'],
      sigue_contra: ['You have to learn without help first.', 'Better supervision seems more sensible to me.'],
      sigue_indeciso: ['Both had a point.']
    },
    fb: {
      resumen: 'You defended the motion with a clear thesis and three well-ordered reasons, and you turned the inequality objection into a proposal. Your best moment was the answer about assessment. You did not rebut your opponent’s core argument: that without first learning unaided you cannot supervise the machine.',
      rubrica: {
        argumentacion: {nivel: 2, comentario: 'Clear thesis and three reasons; the third (better questions) was underdeveloped.', cita: 'First, because artificial intelligence is already in the classroom'},
        evidencias: {nivel: 1, comentario: 'Effective analogies, but no concrete example of a university that already does it.', cita: 'assessing without them is like examining an accountant without a calculator'},
        refutacion: {nivel: 2, comentario: 'You answer the “doctored snapshot” and inequality; you do not rebut the need for a prior foundation.', cita: 'My opponent says that an exam is an honest snapshot'},
        estructura: {nivel: 3, comentario: 'Numbered opening and a close that returns to the thesis.', cita: 'I am asking for clear rules: which tool, for which task and with what declaration of use'},
        persuasion: {nivel: 2, comentario: 'Direct close to the audience; a few fillers weaken it.', cita: 'That is why I ask you to vote in favour'}
      },
      momentos: [
        {turno: 3, tipo: 'acierto', cita: 'If a machine passes an exam, that exam measured memory, not understanding', comentario: 'You turn the question around and make a weakness into an argument.'},
        {turno: 4, tipo: 'oportunidad', cita: 'that does not protect any order, it only delays the learning', comentario: 'You assert without explaining: here you needed to show how people learn to supervise while using the tool.'}
      ],
      fortalezas: ['Numbered structure, easy to follow.', 'You turn the inequality objection into a concrete proposal.'],
      mejoras: ['Rebut your opponent’s strongest argument, not only the secondary ones.', 'Replace “I mean” and “basically” with pauses.'],
      ejercicio: 'Write your opponent’s best argument in one sentence and prepare a one-minute rebuttal against it alone.'
    }
  },
  pt: {
    turnos: [
      'Boa tarde. Hoje defendo que as universidades deveriam permitir a inteligência artificial generativa nos exames. Em primeiro lugar, porque a inteligência artificial já está nas salas de aula e proibi-la só premeia quem faz batota sem ser visto. Em segundo lugar, porque um exame deveria medir o que faremos na vida profissional, e em qualquer trabalho vamos usar estas ferramentas todos os dias. Quer dizer, avaliar sem elas é como examinar um contabilista sem calculadora. E em terceiro lugar, porque permiti-la obriga-nos a fazer melhores perguntas: perguntas que peçam critério, justificação e responsabilidade, não memória. Não peço liberdade total. Peço regras claras: que ferramenta, para que tarefa e com que declaração de uso.',
      'Obrigada. O meu oponente fala do futuro, mas um exame não é o futuro: é uma fotografia honesta do que uma pessoa sabe hoje. Um exame mede o que uma pessoa sabe, não o que sabe uma máquina que tem no bolso. Se permitirmos a inteligência artificial generativa, deixaremos de saber se quem passa entende a matéria ou só sabe pedi-la. E isso tem consequências: um diploma universitário é uma promessa à sociedade de que essa pessoa domina um conjunto de conhecimentos. Além disso, a desigualdade cresce: quem puder pagar a versão mais potente parte com vantagem. Usemos a inteligência artificial para aprender, para praticar e para receber comentários. Mas o momento de demonstrar o que aprendemos deve ser nosso, não da máquina.',
      'A minha adversária diz que um exame é uma fotografia honesta. Mas essa fotografia já está adulterada: hoje quem quer usar a inteligência artificial usa-a às escondidas, e quem respeita as regras sai a perder. Sobre a desigualdade, o risco existe, mas a solução é a universidade oferecer a mesma ferramenta a todos os estudantes, tal como oferece bibliotecas ou programas. E sobre a promessa do diploma: basicamente, a sociedade não precisa de pessoas que memorizem, precisa de pessoas que saibam decidir com boas ferramentas e responder pelas suas decisões.',
      'Diz-se que a fotografia já está adulterada. Se há batota, a resposta é vigiar melhor, não legalizar a batota. E propõe-se que a universidade distribua a mesma ferramenta a todos. Parece bem, mas a ferramenta muda todos os meses e ninguém pode garantir que funcione igual para todos. Há algo mais grave: para decidir com boas ferramentas é preciso primeiro saber detetar quando a ferramenta se engana. E isso só o consegue quem aprendeu sem ela. Sem essa base, o critério que o meu oponente reclama é impossível.',
      'Uma pergunta para os dois: se a inteligência artificial consegue hoje passar em muitos exames, o problema está na ferramenta ou na forma como avaliamos?',
      'Está na forma como avaliamos. Se uma máquina passa num exame, esse exame media memória, não compreensão. Permitir a inteligência artificial obriga-nos a desenhar provas em que é preciso explicar porque uma resposta está certa, comparar fontes e defender uma decisão em voz alta. Isso é mais difícil de copiar, não mais fácil.',
      'Nas duas coisas. É verdade que há exames que só medem memória e devem mudar. Mas mudar a avaliação não exige pôr a máquina no exame. Podemos fazer orais, casos práticos e trabalhos defendidos na aula sem inteligência artificial, e assim saberemos o que entende cada estudante.',
      'Pensemos no mundo profissional: um médico ou uma engenheira que não soubessem usar a inteligência artificial estariam bem formados daqui a dez anos?',
      'Vão precisar de a usar, sem dúvida, e a universidade deve ensiná-los a fazê-lo. Mas um médico que não saiba reconhecer um diagnóstico sem ajuda não pode supervisionar a máquina. Primeiro aprende-se o ofício; depois aprende-se a delegar. O exame protege essa ordem.',
      'Não estariam bem formados. E se nunca os avaliámos a usá-la, não saberemos se a usam bem. Hoje exigimos que trabalhem com estas ferramentas e no exame tiramo-las: isso não protege ordem nenhuma, só atrasa a aprendizagem de que mais vão precisar.',
      'Esta tarde não discutimos se a inteligência artificial é útil: é. Discutimos se o exame deve medir a pessoa ou a pessoa com a sua máquina. Peço a quem tem dúvidas que pense no médico, na engenheira, no juiz que amanhã vai assinar com o seu nome. Queremos saber que entendem o que assinam. Por isso, votem contra a moção.',
      'A minha adversária pede-nos que escolhamos entre a pessoa e a máquina, mas essa escolha já não existe fora da sala de aula. O que podemos escolher é se avaliamos com regras claras ou continuamos a fingir que a ferramenta não está lá. Permiti-la, com declaração de uso e perguntas que exijam critério, torna os exames mais honestos e mais úteis. Por isso peço-vos que votem a favor.'
    ],
    citasE: ['proibi-la só premeia quem faz batota sem ser visto', 'avaliar sem elas é como examinar um contabilista sem calculadora', 'a universidade oferecer a mesma ferramenta a todos os estudantes', 'Se uma máquina passa num exame, esse exame media memória, não compreensão', 'continuamos a fingir que a ferramenta não está lá'],
    citasR: ['Um exame mede o que uma pessoa sabe, não o que sabe uma máquina que tem no bolso', 'Se há batota, a resposta é vigiar melhor, não legalizar a batota', 'Primeiro aprende-se o ofício; depois aprende-se a delegar', 'Queremos saber que entendem o que assinam'],
    motivos: {
      favor: ['Uso estas ferramentas todos os dias e proibi-las parece-me absurdo.', 'O mundo do trabalho já funciona assim.', 'Prefiro regras claras a proibições que ninguém cumpre.'],
      contra: ['Um exame deve medir o que cada um sabe.', 'Preocupa-me que se perca o esforço de estudar.', 'Não confio que seja bem usada.'],
      indeciso: ['Depende de como se fizer.', 'Ainda não tenho uma opinião clara.', 'Vejo vantagens e inconvenientes.'],
      a_favor: ['Convenceu-me que a proibição premeia quem faz batota.', 'Regras claras e declarar o uso parece-me razoável.'],
      sigue_favor: ['Continuo a pensar o mesmo, e o debate confirmou-o.'],
      a_contra: ['O argumento do médico que assina fez-me duvidar.'],
      sigue_contra: ['Primeiro é preciso aprender sem ajuda.', 'Vigiar melhor parece-me mais sensato.'],
      sigue_indeciso: ['Os dois tinham parte de razão.']
    },
    fb: {
      resumen: 'Defendeu a moção com uma tese clara e três razões bem ordenadas, e soube transformar a objeção da desigualdade numa proposta. O seu melhor momento foi a resposta sobre a avaliação. Faltou rebater o argumento de fundo da sua adversária: que sem aprender primeiro sem ajuda não se pode supervisionar a máquina.',
      rubrica: {
        argumentacion: {nivel: 2, comentario: 'Tese e três razões claras; a terceira (melhores perguntas) ficou pouco desenvolvida.', cita: 'Em primeiro lugar, porque a inteligência artificial já está nas salas de aula'},
        evidencias: {nivel: 1, comentario: 'Usa analogias eficazes, mas nenhum exemplo concreto de uma universidade que já o faça.', cita: 'avaliar sem elas é como examinar um contabilista sem calculadora'},
        refutacion: {nivel: 2, comentario: 'Responde à «fotografia adulterada» e à desigualdade; não rebate que é precisa uma base prévia.', cita: 'A minha adversária diz que um exame é uma fotografia honesta'},
        estructura: {nivel: 3, comentario: 'Abertura numerada e fecho que retoma a tese.', cita: 'Peço regras claras: que ferramenta, para que tarefa e com que declaração de uso'},
        persuasion: {nivel: 2, comentario: 'Fecho dirigido ao público; alguns bordões tiram força.', cita: 'Por isso peço-vos que votem a favor'}
      },
      momentos: [
        {turno: 3, tipo: 'acierto', cita: 'Se uma máquina passa num exame, esse exame media memória, não compreensão', comentario: 'Dá a volta à pergunta e transforma uma fraqueza em argumento.'},
        {turno: 4, tipo: 'oportunidad', cita: 'isso não protege ordem nenhuma, só atrasa a aprendizagem', comentario: 'Afirma sem explicar: aqui era preciso mostrar como se aprende a supervisionar usando a ferramenta.'}
      ],
      fortalezas: ['Estrutura numerada, fácil de seguir.', 'Transforma a objeção da desigualdade numa proposta concreta.'],
      mejoras: ['Rebata o argumento mais forte da sua adversária, não só os secundários.', 'Substitua «quer dizer» e «basicamente» por pausas.'],
      ejercicio: 'Escreva numa frase o melhor argumento da sua adversária e prepare um minuto de réplica só contra ele.'
    }
  }
};

/* votos del ejemplo: antes 36 a favor / 42 en contra / 22 indecisos; después cambian 25 personas (semilla fija) */
function ejemploVotos(panel, lang) {
  const e = EJ[lang] || EJ.es, r = rng(77), ids = baraja(panel.map(p => p.id), r), pre = {}, post = {};
  const pick = (a, i) => a[i % a.length];
  ids.forEach((id, i) => { const v = i < 36 ? 'favor' : i < 78 ? 'contra' : 'indeciso'; pre[id] = {voto: v, motivo: pick(e.motivos[v], i)}; });
  const raw = ids.map((id, i) => {
    let v = pre[id].voto, k;
    if (i >= 78 && i < 91) v = 'favor'; else if (i >= 91 && i < 94) v = 'contra'; else if (i >= 36 && i < 43) v = 'favor'; else if (i < 2) v = 'contra';
    k = pre[id].voto === v ? 'sigue_' + v : 'a_' + v;
    const cita = v === 'favor' ? pick(e.citasE, i) : v === 'contra' ? pick(e.citasR, i) : '';
    return {id, voto: v, motivo: pick(e.motivos[k] || e.motivos.sigue_indeciso, i), cita, ponente: v === 'favor' ? 'A' : v === 'contra' ? 'B' : ''};
  });
  return {pre, rawPost: {votos: raw}};
}
