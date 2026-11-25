# DebatIA

Entrenador de oratoria con debates al estilo Munk. Aplicación web de un solo fichero (`index.html`) más los avatares 3D de la carpeta `avatar/`.

**Usar la app:** https://fborrasumh.github.io/debatia/

**Idiomas:** español (por defecto), inglés y portugués, con selector en la barra superior (o `?lang=en` / `?lang=pt` en la URL).

Inspirada en el formato de los Munk Debates (Toronto), sin relación con su organización.

## Qué hace

- **Moción y rival.** Eliges una moción del banco (12, en seis áreas) o escribes la tuya, tu postura (a favor, en contra o al azar) y un rival IA: 8 avatares por edad y sexo, 4 estilos (académico, retórico, socrático, pragmático) y 3 niveles.
- **Público sintético.** Entre 10 y 200 personas (100 por defecto) con sexo, edad, comunidad autónoma y estudios repartidos según la población adulta de España (INE 2025, mismos datos y fuentes que PanelIA). Se reparten por cuotas exactas y con una semilla: la misma semilla da el mismo público.
- **Votación previa.** La IA decide cómo votaría cada persona (a favor, en contra o indecisa) solo con la moción, en lotes de 10.
- **Debate en formato Munk adaptado a 1 contra 1.** Son 12 turnos: aperturas, réplicas, dos preguntas del moderador IA que responden los dos ponentes y cierres en orden inverso. Hay dos formatos de tiempos (práctica corta y Munk adaptado). Puedes escribir o dictar, y el rival puede hablar en voz alta con el avatar 3D de AnamnesIA (TalkingHead).
- **Votación final y veredicto.** El público lee la transcripción **sin saber quién es el estudiante**: los ponentes aparecen como A y B. Vuelve a votar y da la cita que más le pesó. Gana quien más puntos porcentuales gana entre las dos votaciones (regla Munk).
- **Informe de oratoria.** Métricas calculadas por el código y comentarios de la IA en una rúbrica de 5 dimensiones con niveles 0-3, citas de lo que dijiste, momentos clave y un ejercicio. No hay nota.
- **Progreso.** Todos tus debates terminados, guardados en el navegador.
- **Ejemplo sin clave.** Un debate ficticio completo en cada idioma.

## La IA propone, el código comprueba

- **Votos.** El código descarta los ids repetidos o que no son del público y los votos con valores no válidos. Reintenta una vez con las personas sin voto. Solo cuentan quienes votaron en las dos rondas.
- **Citas del público.** Cada cita se busca literalmente en la transcripción. Si no aparece, no cuenta como decisiva. Si aparece, el código decide de qué ponente es, aunque la IA diga otra cosa.
- **Ganador.** El recuento, las transiciones entre votos y el ganador los calcula el código.
- **Rival.** El código quita el formato de texto escrito y recorta en un final de frase si se pasa más de un 35 % de su tiempo. También señala las cifras que no estaban en la moción ni en las intervenciones del estudiante.
- **Comentarios.** Los niveles de la rúbrica se limitan a 0-3. Las citas deben estar en las intervenciones del estudiante, y si una cita apunta a otra intervención, el código la corrige. Además avisa si la IA pone una nota.
- **Métricas.** El código cuenta palabras, estima la duración a 140 ppm frente al tiempo de cada fase y mide el ritmo real si se dicta. También cuenta posibles muletillas, conectores y referencias al rival por cada 100 palabras, la diversidad léxica (MATTR) y la longitud media de frase.

## Cómo se usa la IA

Con la propia clave de OpenAI, Google Gemini o Anthropic Claude. La clave se guarda solo en el navegador y no hace falta servidor. Un debate con 100 personas son unas 28 llamadas: 10 por cada votación, 5 del rival, 2 del moderador y 1 para los comentarios.

## Privacidad

- **En el navegador:** los debates, el progreso, la clave, el público, el recuento y las métricas. El dictado, la voz y el avatar también los hace el navegador, sin enviar audio.
- **Hacia el proveedor de IA:** la moción, las intervenciones y los perfiles sintéticos del público. El nombre del estudiante no se envía, y en sus intervenciones se enmascaran correos, teléfonos y documentos de identidad. Antes del primer envío se muestra una muestra de lo que sale.

## Límites

- El público es una simulación: sus votos **no predicen** los de un público real. Los modelos tienden a respuestas moderadas, pueden apoyarse en estereotipos de edad o de región y pueden premiar los discursos largos (por eso el veredicto muestra las palabras de cada ponente).
- La duración de un texto escrito es una estimación. Las listas de muletillas y conectores son orientativas.
- El rival puede inventar datos aunque tenga instrucciones de no hacerlo. El código señala las cifras sin fuente, pero no comprueba afirmaciones sin números.
- Los comentarios de la IA son orientativos y no sustituyen la evaluación del profesorado.
- El avatar es un prototipo: se carga desde `avatar/` y necesita la app servida por web (GitHub Pages). Si se abre el `index.html` suelto, el debate funciona igual, pero sin avatar.
- Probado con IA simulada. Todavía no se ha probado con claves reales.

## Desarrollo

`src/` contiene el código (`nucleo.js` es la lógica pura, probada en Node), `forja/` los módulos comunes de Forja y `python3 build.py` monta el `index.html`. Para las pruebas: `node tests/nucleo_test.js` y `python3 tests/smoke_test.py` (Playwright con IA simulada).

## Autoría

Fernando Borrás Rocher (Universidad Miguel Hernández de Elche). Reutiliza el avatar 3D de AnamnesIA (MPFB/MakeHuman CC0, TalkingHead MIT) y la población sintética de PanelIA.

ORCID: Fernando Borrás Rocher [0000-0002-5519-4573](https://orcid.org/0000-0002-5519-4573)

Licencia MIT.
