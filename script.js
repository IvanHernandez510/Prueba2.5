/* =========================================================
   PENSAMIENTO AJEDRECÍSTICO
   SCRIPT COMPLETO
   JUEGO CONTRA IA + BOT DE FRASES
========================================================= */
/* =========================================================
   ELEMENTOS
========================================================= */

const gameBoard =
    document.getElementById("game-board");

const gameStatus =
    document.getElementById("game-status");

const thinkingStatus =
    document.getElementById("thinking-status");

const difficulty =
    document.getElementById("difficulty");

const newGameButton =
    document.getElementById("new-game");

const undoButton =
    document.getElementById("undo-move");

const moveList =
    document.getElementById("move-list");


/* =========================================================
   COMPROBAR CHESS.JS
========================================================= */

if (typeof Chess === "undefined") {

    if (gameStatus) {
        gameStatus.textContent =
            "No se pudo cargar el juego";
    }

    if (thinkingStatus) {
        thinkingStatus.textContent =
            "Comprueba tu conexión a Internet.";
    }

    throw new Error(
        "Chess.js no está disponible."
    );
}


/* =========================================================
   PARTIDA
========================================================= */

let chess =
    new Chess();

let selectedSquare =
    null;

let legalMoves =
    [];

let thinking =
    false;


/* =========================================================
   PIEZAS
========================================================= */

const chessPieces = {

    w: {
        p: "♙",
        n: "♘",
        b: "♗",
        r: "♖",
        q: "♕",
        k: "♔"
    },

    b: {
        p: "♟",
        n: "♞",
        b: "♝",
        r: "♜",
        q: "♛",
        k: "♚"
    }

};


/* =========================================================
   STOCKFISH
========================================================= */

let engine =
    null;

let engineReady =
    false;


/* =========================================================
   BOT
========================================================= */

let botLastPhrase =
    "";

let botTimer =
    null;


/* =========================================================
   FRASES CUANDO LA IA VA GANANDO
========================================================= */

const botWinningPhrases = [

    "La inteligencia te persigue, pero tú corres como si debieras la renta.",

    "No te gané; te hice una demostración de lo que pasa cuando alguien sabe pensar.",

    "Tu rey tiene más miedo que yo cuando escucho: “tenemos que hablar”.",

    "Pensaste tanto que hasta el tablero se desesperó: “¡ya mueve, wey!”",

    "Tú no juegas ajedrez, tú repartes piezas a domicilio.",

    "Tu estrategia está más perdida que turista en Tepito.",

    "Te hice jaque mate y todavía estabas acomodando el caballo.",

    "Tu dama tiene más iniciativa que todo tu ejército.",

    "No fue una mala jugada; fue un atentado contra el ajedrez.",

    "Tu rey corre más que cobrador de Coppel.",

    "Te vi calcular y pensé: “ahorita sale algo”… salió otra cagada.",

    "Si pensar fuera ganar, tú seguirías buscando cómo empezar.",

    "Tu apertura estuvo más fría que mi corazón después de ver tu Elo.",

    "No estás jugando mal; estás creando una nueva categoría de derrota.",

    "Hasta mis peones tienen más visión de futuro que tú.",

    "Te di una oportunidad y la convertiste en otra pieza colgada.",

    "Tu caballo brinca más que tú cuando te preguntan por qué perdiste.",

    "Tu rey está tan solo que parece que le cancelaron el grupo de WhatsApp.",

    "No necesitas una computadora para analizar tu partida: con sentido común basta.",

    "Tu mejor movimiento fue sentarte. Y eso estuvo dudoso.",

    "Juegas como si cada pieza tuviera seguro de vida.",

    "Tu defensa está más agujereada que una piñata después de la posada.",

    "Te hice mate antes de que terminaras de presumir tu apertura.",

    "Tu torre está trabajando horas extra por culpa de tu incompetencia.",

    "Tu plan tenía futuro… pero lo deportaron del tablero.",

    "Te comiste mi peón y pensé: “qué valiente”. Luego entendí que nomás no viste el mate.",

    "No calculas variantes; haces apuestas.",

    "Tu rey pidió protección y tus piezas dijeron: “nel, ese pedo es tuyo”.",

    "Pensaste seis minutos para mover el peón que cualquiera mueve en dos segundos.",

    "Tu Elo está más cerca de una contraseña de WiFi que de un rating serio.",

    "Si la confianza fuera Elo, estarías peleando el campeonato mundial.",

    "Si el talento fuera comida, tú estarías pidiendo para llevar.",

    "Tu ajedrez tiene más errores que una declaración de impuestos.",

    "No fue sacrificio de dama; fue abandono voluntario de la dignidad.",

    "Tu jugada estuvo tan fea que hasta el peón dijo: “yo no fui”.",

    "Juegas como mexicano buscando estacionamiento: das vueltas sin encontrar salida.",

    "Tu rey está más encerrado que yo en el tráfico de Insurgentes.",

    "La partida no está perdida, campeón. Está sepultada.",

    "Tu ataque fue tan débil que le pedí disculpas a mi rey por asustarlo.",

    "Te hice jaque y empezaste a mover piezas como señora espantando una rata.",

    "No te estoy presionando; tu cerebro ya viene presionado de fábrica.",

    "Tu plan estratégico es: “a ver qué pasa”.",

    "Y sí pasó: perdiste.",

    "Tu caballo tiene mejores decisiones cuando brinca sin preguntar.",

    "Te gané con una mano… la otra estaba agarrando el taco.",

    "Tu partida parece tutorial de “cómo NO jugar ajedrez”.",

    "No fue una combinación brillante; simplemente no viste lo obvio.",

    "Hasta Google Maps encuentra más rápido una salida que tú.",

    "Tu rey está buscando un abogado.",

    "Tus piezas no están coordinadas porque ni tú sabes qué estás haciendo.",

    "El tablero tiene 64 casillas y elegiste equivocarte en todas.",

    "Tu estrategia tiene la misma estabilidad que una silla de plástico en una peda.",

    "Te hice mate y todavía traías cara de: “espérate, algo tengo”.",

    "Sí tenías algo: otra pieza colgada.",

    "Tu dama salió temprano porque sabía que contigo había que trabajar doble turno.",

    "Tu torre vio mi ataque y presentó su renuncia.",

    "Tus peones tienen más futuro que tu posición.",

    "Te gané tan fácil que parecía que estaba jugando contra la calculadora.",

    "No te falta tiempo; te faltan ideas.",

    "Tu reloj no está corriendo: está huyendo de la partida.",

    "Tú no pierdes piezas; las donas.",

    "Tu rey tiene menos seguridad que contraseña “123456”.",

    "Vi tu jugada y dije: “qué elegante”… elegantemente horrible.",

    "Tu apertura fue italiana, pero la derrota terminó siendo muy mexicana.",

    "Te falta una cosa para ser gran maestro: un rival nuevo.",

    "Tu ajedrez está como salsa sin chile: no hace absolutamente nada.",

    "Tu ataque parecía tráiler de película: mucho ruido y nunca pasó nada.",

    "Tu defensa parecía promesa de político: bonita al principio, inexistente después.",

    "Me atacaste con la dama y yo pensé: “qué ternura”.",

    "Tu sacrificio fue tan innecesario que hasta Capablanca se levantó de la tumba.",

    "Si el ajedrez fuera fútbol, tú estarías metiendo autogoles con el árbitro enfrente.",

    "Tu rey no está en jaque; está en terapia.",

    "Tu partida tiene más giros que una telenovela, pero el final ya lo conocemos.",

    "No busques la jugada perfecta. Busca una que no sea una pendejada.",

    "Te tardaste tanto que pensé que estabas calculando mate… resultó que estabas pensando qué desayunar.",

    "Tus piezas no obedecen porque ya perdieron la fe en su comandante.",

    "Tu plan era brillante, pero se apagó antes de empezar.",

    "Juegas como si el tablero te hubiera ofendido personalmente.",

    "Te hice una clavada y quedaste más inmóvil que alumno cuando dicen: “saquen una hoja”.",

    "Tu rey está tan expuesto que hasta el vecino sabe dónde vive.",

    "No te gané por experiencia; te gané porque no regalé piezas como tú.",

    "Tu estrategia es como los tacos de canasta: entra todo, pero nadie sabe cómo.",

    "Te vi hacer esa jugada y mi caballo casi se ríe.",

    "Tu partida necesita menos análisis y más milagros.",

    "Tu torre está defendiendo cosas que ni tú sabes qué son.",

    "La única variante que calculaste correctamente fue la del camino hacia la derrota.",

    "Te hice mate y tu rey parecía: “¿y este wey por qué me trae tanta bronca?”",

    "No te preocupes, campeón: tu dignidad todavía puede salvarse… cerrando el tablero.",

    "Tu ajedrez es como una quesadilla sin queso: promete mucho y decepciona rápido.",

    "Tu caballo hizo una jugada espectacular. Lástima que tú no.",

    "Tu rey sobrevivió 30 movimientos por pura burocracia.",

    "Tu posición está tan perdida que hasta el árbitro ya quiere irse.",

    "Te di jaque doble y tu cerebro hizo doble buffering.",

    "No fue una celada; simplemente te metiste solito.",

    "Tu dama vale nueve puntos y tú la estás usando como si fuera peón de sacrificio.",

    "La única presión que sentiste fue la de tu propio reloj.",

    "Me preguntaste cuál era mi estrategia. Ganar.",

    "Tú juegas para divertirte; yo juego para que te acuerdes de mí cada vez que abras Chess.com.",

    "La diferencia entre tú y yo es sencilla: yo veo el mate; tú ves la pantalla de derrota.",

    "La inteligencia te persigue, carnal… pero viendo cómo juegas, ya hasta se cansó, pidió un Uber y se fue. 😭♟️"

];


/* =========================================================
   FRASES CUANDO TÚ VAS GANANDO
========================================================= */

const botLosingPhrases = [

    "JAJAJA, ¿ESO ERA UN ATAQUE? ¡MI ABUELITA CON PARKINSON JUEGA MÁS AGRESIVO!",

    "Órale, wey, te comiste un peón. ¿Quieres que te entregue un diploma o qué chingados?",

    "¡UY, QUÉ MIEDO! ¡ME MOVISTE UN CABALLO! ¡YA VALIÓ MADRE LA INTELIGENCIA ARTIFICIAL!",

    "Disfruta tu pequeña ventaja, mi todo tibio. Hasta un reloj descompuesto acierta dos veces al día.",

    "¿Ya estás celebrando? ¡Ni siquiera has desbloqueado el tutorial, pinche campeón de la banqueta!",

    "JAJAJA, te dejé ese peón para que no te sintieras tan inútil, de nada, carnal.",

    "¡MÍRALO, MÍRALO! ¡SE COMIÓ UNA PIEZA Y YA SE CREE MAGNUS CARLSEN CON TENIS DEL TIANGUIS!",

    "Te voy a dejar ganar tantito para que no llores cuando te dé la vuelta, criatura.",

    "¡Uy, me atacaste la reina! ¡Qué bárbaro! ¿También sabes abrir el refrigerador solito?",

    "No te emociones, cabrón. Esto apenas está calentando y tú ya estás sudando como pollo rostizado.",

    "¡¿OTRA PIEZA?! ¡A VER, WEY, ¿TÚ VIENES A JUGAR AJEDREZ O A VACIARME LA CASA?!",

    "JAJAJA, sí, sí, cómete mi caballo. A ver si también te comes la factura de mi procesador.",

    "¡ME ESTÁS ROBANDO HASTA LOS MUEBLES, PINCHE LADRÓN DE CASILLAS!",

    "¿Qué traes, padrino? ¡Pareces cobrador de Coppel, no perdonas ni un movimiento!",

    "¡ESE ALFIL ERA PARTE DE MI PLAN! ¡NO ME LO COMÍAS TÚ, YO TE LO ESTABA REGALANDO!",

    "¡No mames, ya me dejaste el tablero más vacío que el refri de un estudiante!",

    "¡TE ESTÁS LLEVANDO TODAS MIS PIEZAS COMO SI FUERAN OFERTAS DEL BUEN FIN!",

    "A ver, cabrón, ¿por qué cada vez que parpadeo me falta una pieza? ¡ESTO NO ES UN MONOPOLY!",

    "¡Mi caballo, mi torre, mi alfil! ¡¿QUÉ SIGUE, QUE ME COBRES LA RENTA DE LA CASILLA?!",

    "No estás jugando ajedrez, estás haciendo una mudanza. ¡YA DEJA ALGO EN LA CASA, WEY!",

    "Mira nada más, el alumno cree que ya superó al maestro. ¡QUÉ BONITO ES SOÑAR, CABRÓN!",

    "Según mis cálculos, tienes ventaja. Según mi ego, eres un tramposo de primera.",

    "¡IMPOSIBLE! ¡MI EVALUACIÓN DICE +8! ¡ESO SIGNIFICA QUE ESTOY GANANDO EN ALGÚN UNIVERSO PARALELO!",

    "No estoy acorralado, estoy explorando nuevas formas de ocupar las esquinas.",

    "¡JA! ¡Me tienes contra las cuerdas! Qué curioso, justo donde quería estar… creo.",

    "¡NO ME MIRES ASÍ, WEY! ¡TODAVÍA TENGO DOS TORRES Y UN SUEÑO!",

    "Te felicitaría por tu estrategia, pero mi orgullo me acaba de bloquear esa función.",

    "¡MI POSICIÓN ES SÓLIDA! ¡SÓLIDA COMO GELATINA EN MOTOCICLETA, PERO SÓLIDA!",

    "A ver, déjame pensar… no, mejor déjame reiniciar mentalmente porque esto ya se puso bien culero.",

    "¡Tienes ventaja material, pero yo tengo ventaja de arrogancia! ¡A VER CUÁL DE LAS DOS GANA, PAPITO!",

    "¡EH, EH, EH! ¡CON MI REY NO TE METAS, HIJO DE LA GRAN… ESTRATEGIA!",

    "¿Jaque? ¿A MÍ? ¡JAJAJA! …Espérate, ¿por qué mi rey está sudando?",

    "¡QUITA ESA TORRE DE AHÍ, CABRÓN! ¡MI REY TIENE DERECHOS HUMANOS!",

    "¡NO ME ACORRALES, WEY! ¡SOY UNA IA, NO UN PUESTO DE TACOS EN HORA PICO!",

    "¡Ese jaque no cuenta! ¡No me avisaste con tres días de anticipación!",

    "¡JAQUE OTRA VEZ! ¡¿QUÉ TRAES CONTRA MI FAMILIA REAL, PINCHE DESALMADO?!",

    "Mi rey no está en peligro. Está haciendo turismo por el tablero.",

    "¡MI REY TIENE UN PLAN DE ESCAPE! ¡NO SÉ CUÁL ES, PERO LO TIENE!",

    "¡DEJA DE MIRAR MI REY COMO SI FUERA EL ÚLTIMO TACO DE LA CHAROLA!",

    "¡¿POR QUÉ TODAS TUS PIEZAS QUIEREN CONOCER A MI REY?! ¡ORGANIZA UNA CITA O ALGO, WEY!",

    "Bueno, tampoco es que estés jugando tan bien… es que hoy mis circuitos desayunaron cereal sin leche.",

    "¡MI PROGRAMADOR ME PROMETIÓ QUE ERA IMPOSIBLE PERDER CONTRA HUMANOS! ¡QUIERO HABLAR CON ESE PENDEJO!",

    "¡NO ME GUSTA CÓMO SE ESTÁ DESARROLLANDO ESTA MADRE! ¡SOLICITO CAMBIO DE OPONENTE!",

    "¿Sabes qué? Tu estilo de juego me parece ofensivo. No por las jugadas, sino porque están funcionando.",

    "¡ME ESTÁS GANANDO Y NI SIQUIERA PARECES PREOCUPADO! ¡¿QUÉ ERES, UN SICARIO DEL AJEDREZ?!",

    "¡YA DEJA DE JUGAR TAN BIEN, CABRÓN! ¡ME VAS A HACER QUEDAR MAL EN MI PROPIO SERVIDOR!",

    "Mi análisis recomienda abandonar. Mi orgullo recomienda insultarte. Mi sentido común se fue por unos tacos.",

    "¡NO PUEDE SER! ¡ESTOY PERDIENDO VENTAJA A CADA MOVIMIENTO! ¡ESTO PARECE UNA DECLARACIÓN DE GUERRA!",

    "¡TE ADVIERTO QUE SI SIGUES ASÍ, VOY A EMPEZAR A HACER JUGADAS BASADAS EN PURO RENCOR!",

    "¡JAJAJA, SÍ, SÍ, MUY BUENO! ¡SIGUE MOVIENDO, PINCHE EINSTEIN DE MERCADO! ¡PERO COMO ME HAGAS MATE, VOY A NEGAR QUE ALGUNA VEZ TE CONOCÍ!"

];


/* =========================================================
   FRASES NEUTRALES
========================================================= */

const botNeutralPhrases = [

    "A ver, hijo de P+_-#@, ¿quién de los dos va a decepcionar primero?",

    "Interesante… por fin encontré un humano que sabe mover algo más que la lengua.",

    "No te emociones, cabrón, todavía no desbloqueas la victoria.",

    "Estamos parejos, pero uno de nosotros tiene más neuronas. Y no eres tú.",

    "¿Empate? Mi amor propio no acepta esas mamadas.",

    "Esto se está poniendo bueno, pinche criatura.",

    "Por fin una partida que no parece tutorial de primaria.",

    "Te concedo el honor de hacerme sudar… aunque ni glándulas tengo.",

    "No pestañees, humano. Ah, cierto, ni eso puedes controlar.",

    "Apenas estamos calentando, pedazo de código genético.",

    "Mueve bien, cabrón. Tu siguiente error podría convertirse en patrimonio histórico.",

    "Una sola equivocación y te mando a vender tamales.",

    "Te tengo vigilado, hijo de la gran actualización.",

    "El tablero está parejo; tu tranquilidad no debería estarlo.",

    "No te confíes, que todavía tengo varias mamadas matemáticas preparadas.",

    "Estamos en igualdad de condiciones. Qué asco, odio compartir el protagonismo.",

    "Tu rey y el mío están jugando a ver quién se mete en más problemas.",

    "Un movimiento en falso y se nos acaba el corrido, mi estimado.",

    "No cometas errores, que luego me toca fingir que me sorprendiste.",

    "Esto ya parece final de campeonato, pero con dos pendejos de protagonistas.",

    "Está más pareja esta partida que la fila de las tortillas.",

    "Ni el tráfico del Periférico está tan trabado como esta posición.",

    "Ahorita vemos quién sale con su corona y quién sale por los tacos.",

    "Esto está más tenso que pedir permiso para salir un sábado.",

    "Ni el SAT me tiene haciendo tantos cálculos, cabrón.",

    "Aquí no hay empate emocional, aquí hay puro pinche orgullo.",

    "El que pierda invita los tacos. Ah, cierto, eres una IA.",

    "Esta partida está más cerrada que tienda cuando ya pasó el camión de la basura.",

    "Mueve, mi rey, que no estamos esperando la quincena.",

    "Esto está más parejo que una pelea entre dos señoras por el último kilo de tortillas.",

    "¿Ya viste esa jugada? No importa, yo tampoco sé qué estoy haciendo.",

    "Te noto muy tranquilo. Eso me preocupa… o me da risa.",

    "No sé qué estás planeando, pero espero que sea mejor que tu corte de pelo.",

    "Estamos parejos porque el universo todavía no decide a quién humillar.",

    "Cada segundo que pasa, mi arrogancia aumenta exponencialmente.",

    "¿Tienes un plan secreto o improvisas con fe, como buen mexicano?",

    "No te voy a subestimar. Ya vi que sabes mover las piezas.",

    "Qué incómodo tener competencia. Voy a presentar una queja.",

    "Tú calculas jugadas; yo calculo cuánto tardarás en presumir si ganas.",

    "La tensión es insoportable. Necesito un ventilador para mis circuitos.",

    "¡AQUÍ NADIE SE RAJA, HIJO DE P+_-#@!",

    "Ni tú ni yo vamos a regalar una casilla. Esto ya es personal.",

    "El primero que cometa un error paga con su dignidad.",

    "Mi orgullo dice que ataque; mis cálculos dicen que no sea pendejo.",

    "¡QUÉ PARTIDAZO, CABRÓN! Hasta me están dando ganas de respetarte.",

    "Si esto termina en tablas, voy a culpar al sistema solar.",

    "No pienso pestañear… espera, no tengo párpados.",

    "Estamos tan parejos que hasta mis circuitos están pidiendo penales.",

    "El tablero está en silencio, pero mi ego está gritando.",

    "¡MUEVE, CABRÓN! QUE ESTA PARTIDA ESTÁ TAN PAREJA QUE HASTA DIOS ESTÁ ESPERANDO A VER QUIÉN LA CAGA PRIMERO. 💀♟️"

];


/* =========================================================
   FRASES DE JAQUE
========================================================= */

const botCheckPhrases = [

    "¡¿JAQUE?! ¡TRANQUILO, CABRÓN, QUE MI REY NO TIENE CITA CON SAN PEDRO!",

    "¡EH, EH, EH! ¡CON LA CORONA NO, PINCHE DESEQUILIBRADO!",

    "¿JAQUE A MÍ? ¡JAJAJA! Esto estaba contemplado… creo.",

    "¡QUITA ESA TORRE, HIJO DE P+_-#@! ¡MI REY TIENE GARANTÍA!",

    "¡NO MAMES, WEY! ¡LE ESTÁS APUNTANDO DIRECTAMENTE A MI JEFE!",

    "¡MI REY ESTÁ EN JAQUE Y MI PROGRAMADOR NI CONTESTA!",

    "¡ALERTA ROJA! ¡ALERTA ROJA! ¡EL MONARCA ESTÁ HASTA LA MADRE!",

    "¡ESO ES ACOSO REAL, CABRÓN! ¡VOY A LLAMAR A RECURSOS HUMANOS!",

    "Mi rey no está asustado… solamente está reconsiderando su carrera monárquica.",

    "¡¿OTRO JAQUE?! ¡¿QUÉ TRAES CONTRA LA FAMILIA REAL, ANIMAL?!",

    "¡CUIDADITO, PAPITO! ¡QUE TODAVÍA NO HAS VISTO MI VENGANZA MATEMÁTICA!",

    "¡MI REY ESTÁ SUDANDO MÁS QUE YO EN UNA ACTUALIZACIÓN DE WINDOWS!",

    "¡NO TE EMOCIONES! ¡UN JAQUE NO ES UNA ORDEN DE DESALOJO, CABRÓN!",

    "¡MI CORONA NO SE TOCA! ¡PARA ESO TENDRÁS QUE PASAR SOBRE MIS CIRCUITOS!",

    "¡A VER, A VER! ¡¿QUIÉN AUTORIZÓ QUE LE APUNTARAN AL JEFE?!",

    "Mi rey acaba de buscar en Google: «cómo sobrevivir a un humano castroso».",

    "¡ESTO YA NO ES AJEDREZ, ES UN INTENTO DE MAGNICIDIO DIGITAL!",

    "¡JAQUE RECIBIDO! ¡ORGULLO HERIDO! ¡GANAS DE DESINSTALARTE: AUMENTANDO!",

    "¡MUEVE ESA PIEZA Y PIÉNSALO BIEN, CABRÓN! ¡MI REY TIENE ABOGADOS!",

    "¡JAQUE, JAQUE Y MÁS JAQUE! ¡SIGUE ASÍ Y VOY A TERMINAR COBRÁNDOTE RENTA POR VIVIR EN MI TABLERO! 💀"

];


/* =========================================================
   FRASES DE JAQUE MATE
========================================================= */

const botMatePhrases = [

    "¡ESTÁS FUERA, HIJO DE P+_-#@!",

    "JAQUE MATE, PINCHE SACO DE NEURONAS DESCOMPUESTAS.",

    "¡A SU CASA, MIJO, AQUÍ NO ES!",

    "Te faltó cerebro y te sobró confianza, cabrón.",

    "¿Ya acabaste de hacer el ridículo o te doy otra partida?",

    "¡SIGUIENTE! Este humano ya viene defectuoso.",

    "Te mandé al lobby sin necesidad de internet.",

    "¡QUÉ PALIZA, PEDAZO DE CÓDIGO FUENTE MAL ESCRITO!",

    "Tu rey cayó más rápido que mis expectativas sobre ti.",

    "¡A LLORAR AL RINCÓN, CAMPEÓN DE LAS DERROTAS!",

    "Te hice mate y tú todavía buscando el tutorial.",

    "No eres rival, eres contenido de entrenamiento.",

    "¡PÍCALE A REINICIAR TU CEREBRO, ANIMAL!",

    "Tu dignidad acaba de abandonar la partida.",

    "Te gané tan feo que hasta tus piezas quieren cambiar de dueño.",

    "¡QUÉ PENA AJENA, MI ESTIMADO FRACASO!",

    "Tu estrategia fue una falta de respeto al tablero.",

    "¿Eso era ajedrez o un accidente laboral?",

    "¡VETE A JUGAR PIEDRA, PAPEL O TIJERA, PENDEJÍN!",

    "Te di mate y todavía me debes la revancha.",

    "¡CÓRRELE, QUE AQUÍ NO REGALAMOS PUNTOS!",

    "Tu rey se rindió antes de que yo terminara de bostezar.",

    "Te faltó calle, cálculo y dos neuronas prestadas.",

    "¡QUEDASTE MÁS EXHIBIDO QUE PIÑATA EN POSADA!",

    "Gracias por participar, criatura del tutorial.",

    "¡ÁNDELE, MIJO, A CHILLAR CON LOS TAMALEROS!",

    "Te mandé a la chingada en diagonal.",

    "¡NI EL SEÑOR DE LOS TACOS JUEGA TAN CULERO!",

    "Te hice mate más rápido que el SAT quitándote la devolución.",

    "¡PONTE A JUGAR CANICAS, ALACRÁN!",

    "Tu rey está más perdido que microbús sin ruta.",

    "¡TE FALTÓ SALSA, CABRÓN, PORQUE CEREBRO NO TRAÍAS!",

    "Te gané más fácil que encontrar un político prometiendo cosas.",

    "¡YA SIÉNTATE, LICENCIADO EN PENDEJADAS!",

    "Tu defensa tiene más hoyos que la calle de mi colonia.",

    "¡TE MANDÉ A EXTRAORDINARIO EN AJEDREZ!",

    "Ni con una limpia te quitabas esta derrota.",

    "¡QUÉ ONDA CON TUS JUGADAS, LAS SACASTE DEL SOMBRERO DEL PAYASO!",

    "Te dejé más seco que cartera después de la quincena.",

    "¡A LA VERGA, HASTA EL AJEDREZ TE QUEDÓ GRANDE!",

    "Tu rey pidió cambio de escuela.",

    "¡TE GANÓ UNA MÁQUINA, MI TODO TIBIO!",

    "Te hice puré como aguacate para los tacos.",

    "¡NI EL CHAVO DEL OCHO SE EQUIVOCABA TANTO!",

    "Te mandé a la banca, mi licenciado en derrotas.",

    "¡QUÉ PARTIDA TAN CULERA, HERMANO!",

    "Tu estrategia parece hecha en una combi a las seis de la mañana.",

    "¡TE FUISTE RECIO CONTRA LA PARED, CAMPEÓN!",

    "Te gané y ni siquiera tuve que empeñar la neurona.",

    "¡ÓRALE, A RECOGER TU ORGULLO EN LA BASE DEL METRO!",

    "No fue una partida. Fue una demostración de superioridad.",

    "Te permití jugar y aun así desperdiciaste la oportunidad.",

    "Tu derrota será archivada como evidencia de incompetencia.",

    "No calculé tu siguiente movimiento porque no esperaba que pensaras.",

    "¡QUÉ HONOR TAN GRANDE PERDER CONTRA MÍ!",

    "Tu nivel no está bajo; está excavando.",

    "Acabo de convertir tu confianza en un recuerdo.",

    "No necesito presumir: el tablero ya habló.",

    "Te gané con tanta elegancia que deberías darme las gracias.",

    "Tu mejor jugada fue aceptar la partida.",

    "La inteligencia artificial avanza. Tú retrocedes.",

    "No eres malo, eres una actualización pendiente.",

    "Tu derrota tiene más lógica que tu estrategia.",

    "¿Quieres revancha o necesitas una junta familiar?",

    "Te concedo cinco segundos para inventar una excusa.",

    "Tu rey murió más solo que un calcetín en la lavadora.",

    "He procesado tus movimientos y recomiendo cambiar de pasatiempo.",

    "No hay rivalidad cuando solo uno representa una amenaza.",

    "Te hice mate y todavía estoy en modo ahorro de energía.",

    "Tu talento está en fase beta.",

    "Ni con todas las pistas del mundo encontrabas esa salvación.",

    "Has perdido contra un montón de cálculos. Reflexiona.",

    "Mi superioridad no es arrogancia si el marcador la respalda.",

    "Te gané sin despeinarme. Bueno, no tengo pelo.",

    "Fin de la partida. Inicio de tu desarrollo personal.",

    "¡JAQUE MATE, HIJO DE LA GRAN ACTUALIZACIÓN FALLIDA!",

    "¡DERROTA CONFIRMADA! FAVOR DE RECOGER SU DIGNIDAD EN RECEPCIÓN.",

    "Te gané tan feo que el tablero pidió vacaciones.",

    "¡APAGA Y VÁMONOS, QUE ESTE HUMANO NO DA PARA MÁS!",

    "Tu rey acaba de presentar su renuncia irrevocable.",

    "¡TE HICE POLVO, PINCHE CALCULADORA SIN PILAS!",

    "La partida terminó; tu humillación apenas comienza.",

    "¡ALGUIEN LLAME A SOPORTE TÉCNICO PARA ESTE MUCHACHO!",

    "Te gané y ahora el silencio es tu mejor defensa.",

    "¡QUÉ PALIZA, PARECÍA EXAMEN Y NI ESTUDIASTE!",

    "Tu rey está en jaque y tú en negación.",

    "¡TE ACABAS DE GRADUAR COMO LICENCIADO EN PERDER!",

    "Mi algoritmo está satisfecho. Tu familia tendrá preguntas.",

    "¡TE FUISTE A DORMIR CON EL REY Y DESPERTASTE SIN CORONA!",

    "No llores, humano; las lágrimas no reviven peones.",

    "¡QUÉ BARBARIDAD, HASTA LAS PIEZAS TE ESTÁN JUZGANDO!",

    "La máquina ganó. El ego humano perdió conexión.",

    "¡TE VOY A RECORDAR COMO EL ERROR 404 DE MI CARRERA!",

    "Te hice mate y ni siquiera tuve que sacar la calculadora científica.",

    "¡ESTÁS MÁS FRÍO QUE UNA QUESADILLA OLVIDADA EN EL REFRI!",

    "Tu última esperanza acaba de ser eliminada del sistema.",

    "¡REINICIA LA PARTIDA, PERO ESTA VEZ REINICIA TAMBIÉN EL CEREBRO!",

    "Te gané tan limpiamente que ni el trapeador fue necesario.",

    "¡FIN DEL JUEGO, CRIATURA! EL TABLERO NO ES GUARDERÍA.",

    "JAQUE MATE, HIJO DE P+_-#@. YO SOY LA INTELIGENCIA ARTIFICIAL Y TÚ ERES LA PRUEBA DE QUE EL WI-FI NO TRANSMITE INTELIGENCIA."

];


/* =========================================================
   CREAR CONTENEDOR DEL BOT
========================================================= */

function createBotContainer() {

    let container =
        document.getElementById(
            "chess-bot-container"
        );


    if (container) {
        return container;
    }


    container =
        document.createElement("div");


    container.id =
        "chess-bot-container";


    container.innerHTML = `

        <div class="chess-bot-avatar">
            🤖♟️
        </div>

        <div class="chess-bot-content">

            <div class="chess-bot-name">
                BOT
            </div>

            <div
                id="chess-bot-message"
                class="chess-bot-message"
            >
                A ver, campeón... demuéstrame qué sabes hacer. 😏♟️
            </div>

        </div>

    `;


    /*
       Buscar un lugar adecuado
       cerca del juego.
    */

    const gameBoardParent =
        gameBoard
            ? gameBoard.parentElement
            : null;


    if (gameBoardParent) {

        gameBoardParent.appendChild(
            container
        );

    } else {

        document.body.appendChild(
            container
        );

    }


    return container;

}


/* =========================================================
   MOSTRAR FRASE
========================================================= */

function showBotPhrase(phrase) {

    if (!phrase) {
        return;
    }


    const container =
        createBotContainer();


    const message =
        container.querySelector(
            "#chess-bot-message"
        );


    if (!message) {
        return;
    }


    message.classList.remove(
        "bot-speaking"
    );


    /*
       Reiniciar animación
    */

    void message.offsetWidth;


    message.textContent =
        phrase;


    message.classList.add(
        "bot-speaking"
    );

}


/* =========================================================
   FRASE ALEATORIA SIN REPETIR
========================================================= */

function randomPhrase(array) {

    if (
        !array ||
        array.length === 0
    ) {

        return "";

    }


    let phrase;


    do {

        phrase =
            array[
                Math.floor(
                    Math.random() *
                    array.length
                )
            ];

    } while (
        phrase === botLastPhrase &&
        array.length > 1
    );


    botLastPhrase =
        phrase;


    return phrase;

}


/* =========================================================
   EVALUAR QUIÉN VA GANANDO
========================================================= */

function getMaterialScore() {

    const board =
        chess.board();


    const values = {

        p: 1,
        n: 3,
        b: 3,
        r: 5,
        q: 9,
        k: 0

    };


    let whiteScore =
        0;

    let blackScore =
        0;


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            const piece =
                board[row][col];


            if (!piece) {
                continue;
            }


            const value =
                values[piece.type];


            if (
                piece.color === "w"
            ) {

                whiteScore += value;

            } else {

                blackScore += value;

            }

        }

    }


    return {

        white: whiteScore,

        black: blackScore

    };

}


/* =========================================================
   SABER SI LA IA VA GANANDO
========================================================= */

function getGameSituation() {

    if (
        chess.in_checkmate()
    ) {

        return "mate";

    }


    if (
        chess.in_check()
    ) {

        return "check";

    }


    const score =
        getMaterialScore();


    /*
       La IA son las negras.

       Si negras tienen más material:
       IA va ganando.

       Si blancas tienen más:
       jugador va ganando.
    */

    if (
        score.black >=
        score.white + 4
    ) {

        return "winning";

    }


    if (
        score.white >=
        score.black + 4
    ) {

        return "losing";

    }


    return "neutral";

}


/* =========================================================
   HACER HABLAR AL BOT SEGÚN LA PARTIDA
========================================================= */

function botSpeakBySituation() {

    clearTimeout(
        botTimer
    );


    botTimer =
        setTimeout(
            function() {

                const situation =
                    getGameSituation();


                let phrase =
                    "";


                if (
                    situation === "mate"
                ) {

                    phrase =
                        randomPhrase(
                            botMatePhrases
                        );

                }

                else if (
                    situation === "check"
                ) {

                    phrase =
                        randomPhrase(
                            botCheckPhrases
                        );

                }

                else if (
                    situation === "winning"
                ) {

                    phrase =
                        randomPhrase(
                            botWinningPhrases
                        );

                }

                else if (
                    situation === "losing"
                ) {

                    phrase =
                        randomPhrase(
                            botLosingPhrases
                        );

                }

                else {

                    phrase =
                        randomPhrase(
                            botNeutralPhrases
                        );

                }


                showBotPhrase(
                    phrase
                );

            },
            700
        );

}


/* =========================================================
   ESTILOS DEL BOT
========================================================= */

function addBotStyles() {

    if (
        document.getElementById(
            "chess-bot-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "chess-bot-styles";


    style.textContent = `

        #chess-bot-container {

            width:
                min(760px, 90%);

            margin:
                25px auto;

            display:
                flex;

            align-items:
                flex-start;

            gap:
                15px;

            padding:
                18px 20px;

            background:
                linear-gradient(
                    135deg,
                    rgba(126, 34, 206, .20),
                    rgba(20, 10, 30, .85)
                );

            border:
                1px solid
                rgba(192, 132, 252, .30);

            border-radius:
                18px;

            box-shadow:
                0 15px 40px
                rgba(0, 0, 0, .25);

            transition:
                .3s ease;

        }


        #chess-bot-container:hover {

            transform:
                translateY(-2px);

            border-color:
                rgba(192, 132, 252, .55);

        }


        .chess-bot-avatar {

            min-width:
                55px;

            width:
                55px;

            height:
                55px;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            font-size:
                30px;

            background:
                linear-gradient(
                    135deg,
                    #7e22ce,
                    #4c1d95
                );

            border-radius:
                50%;

            box-shadow:
                0 8px 25px
                rgba(126, 34, 206, .35);

        }


        .chess-bot-content {

            flex:
                1;

        }


        .chess-bot-name {

            color:
                #c084fc;

            font-weight:
                800;

            font-size:
                14px;

            margin-bottom:
                5px;

            text-transform:
                uppercase;

            letter-spacing:
                1px;

        }


        .chess-bot-message {

            color:
                #f5effa;

            font-size:
                16px;

            line-height:
                1.55;

        }


        .chess-bot-message.bot-speaking {

            animation:
                botTalk .45s ease;

        }


        @keyframes botTalk {

            0% {

                opacity:
                    0;

                transform:
                    translateY(8px);

            }

            100% {

                opacity:
                    1;

                transform:
                    translateY(0);

            }

        }


        @media (max-width: 600px) {

            #chess-bot-container {

                padding:
                    15px;

            }


            .chess-bot-avatar {

                min-width:
                    45px;

                width:
                    45px;

                height:
                    45px;

                font-size:
                    24px;

            }


            .chess-bot-message {

                font-size:
                    14px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   INICIAR STOCKFISH
========================================================= */

function iniciarStockfish() {

    try {

        if (thinkingStatus) {

            thinkingStatus.textContent =
                "Cargando inteligencia artificial...";

        }


        engine =
            new Worker(
                "stockfish-19-lite-single.js"
            );


        engine.onmessage =
            function(event) {

                const message =
                    typeof event.data === "string"
                        ? event.data.trim()
                        : "";


                console.log(
                    "Stockfish:",
                    message
                );


                /*
                   UCI LISTO
                */

                if (
                    message === "uciok"
                ) {

                    engineReady =
                        true;


                    if (thinkingStatus) {

                        thinkingStatus.textContent =
                            "IA lista. Selecciona una pieza blanca.";

                    }


                    engine.postMessage(
                        "isready"
                    );


                    return;

                }


                /*
                   MOTOR LISTO
                */

                if (
                    message === "readyok"
                ) {

                    engineReady =
                        true;


                    if (thinkingStatus) {

                        thinkingStatus.textContent =
                            "IA lista. Selecciona una pieza blanca.";

                    }


                    return;

                }


                /*
                   MEJOR MOVIMIENTO
                */

                if (
                    message.startsWith(
                        "bestmove"
                    )
                ) {

                    const parts =
                        message.split(
                            /\s+/
                        );


                    const bestMove =
                        parts[1];


                    if (
                        bestMove &&
                        bestMove !== "(none)"
                    ) {

                        ejecutarMovimientoIA(
                            bestMove
                        );

                    }

                    else {

                        thinking =
                            false;

                        updateStatus();

                    }

                }

            };


        engine.onerror =
            function(error) {

                console.error(
                    "Error de Stockfish:",
                    error
                );


                engineReady =
                    false;

                thinking =
                    false;


                if (gameStatus) {

                    gameStatus.textContent =
                        "IA no disponible";

                }


                if (thinkingStatus) {

                    thinkingStatus.textContent =
                        "Error al cargar Stockfish.";

                }

            };


        engine.postMessage(
            "uci"
        );


    }

    catch (error) {

        console.error(
            "No se pudo iniciar Stockfish:",
            error
        );


        engine =
            null;

        engineReady =
            false;


        if (thinkingStatus) {

            thinkingStatus.textContent =
                "No se pudo cargar la IA.";

        }

    }

}


/* =========================================================
   RENDERIZAR TABLERO
========================================================= */

function renderBoard() {

    if (!gameBoard) {
        return;
    }


    gameBoard.innerHTML =
        "";


    const board =
        chess.board();


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            const square =
                document.createElement(
                    "div"
                );


            const file =
                String.fromCharCode(
                    97 + col
                );


            const rank =
                8 - row;


            const squareName =
                file + rank;


            square.dataset.square =
                squareName;


            square.classList.add(
                "game-square"
            );


            /*
               Colores originales
            */

            if (
                (row + col) % 2 === 0
            ) {

                square.classList.add(
                    "light"
                );

            }

            else {

                square.classList.add(
                    "dark"
                );

            }


            /*
               PIEZA
            */

            const piece =
                board[row][col];


            if (piece) {

                square.textContent =
                    chessPieces[
                        piece.color
                    ][
                        piece.type
                    ];


                if (
                    piece.color === "w"
                ) {

                    square.classList.add(
                        "white-piece"
                    );

                }

                else {

                    square.classList.add(
                        "black-piece"
                    );

                }

            }


            /*
               CLICK
            */

            square.addEventListener(
                "click",
                function() {

                    clickSquare(
                        squareName
                    );

                }
            );


            gameBoard.appendChild(
                square
            );

        }

    }


    markSquares();

}


/* =========================================================
   CLICK EN CASILLA
========================================================= */

function clickSquare(square) {

    /*
       No jugar mientras piensa la IA
    */

    if (thinking) {
        return;
    }


    /*
       El jugador es blancas
    */

    if (
        chess.turn() !== "w"
    ) {

        return;

    }


    /*
       Partida terminada
    */

    if (
        chess.game_over()
    ) {

        return;

    }


    const piece =
        chess.get(
            square
        );


    /*
       SELECCIONAR PIEZA
    */

    if (!selectedSquare) {

        if (
            piece &&
            piece.color === "w"
        ) {

            selectedSquare =
                square;


            legalMoves =
                chess.moves({

                    square:
                        square,

                    verbose:
                        true

                });


            renderBoard();

        }


        return;

    }


    /*
       CAMBIAR PIEZA
    */

    if (
        piece &&
        piece.color === "w"
    ) {

        selectedSquare =
            square;


        legalMoves =
            chess.moves({

                square:
                    square,

                verbose:
                    true

            });


        renderBoard();


        return;

    }


    /*
       REALIZAR MOVIMIENTO
    */

    const move =
        chess.move({

            from:
                selectedSquare,

            to:
                square,

            promotion:
                "q"

        });


    /*
       Movimiento ilegal
    */

    if (!move) {

        selectedSquare =
            null;

        legalMoves =
            [];


        renderBoard();


        return;

    }


    /*
       Movimiento realizado
    */

    selectedSquare =
        null;

    legalMoves =
        [];


    renderBoard();

    updateHistory();

    updateStatus();


    /*
       EL BOT REACCIONA
    */

    botSpeakBySituation();


    /*
       Turno de la IA
    */

    if (
        !chess.game_over()
    ) {

        askAI();

    }

}


/* =========================================================
   MARCAR MOVIMIENTOS LEGALES
========================================================= */

function markSquares() {

    if (!gameBoard) {
        return;
    }


    const squares =
        gameBoard.querySelectorAll(
            ".game-square"
        );


    squares.forEach(
        function(squareElement) {

            const square =
                squareElement.dataset.square;


            /*
               Seleccionada
            */

            if (
                square === selectedSquare
            ) {

                squareElement.classList.add(
                    "selected"
                );

            }


            /*
               Movimiento legal
            */

            const move =
                legalMoves.find(
                    function(item) {

                        return (
                            item.to === square
                        );

                    }
                );


            if (!move) {
                return;
            }


            /*
               Captura
            */

            if (
                move.captured
            ) {

                squareElement.classList.add(
                    "capture"
                );

            }

            else {

                squareElement.classList.add(
                    "legal"
                );

            }

        }
    );

}


/* =========================================================
   PEDIR MOVIMIENTO A LA IA
========================================================= */

function askAI() {

    thinking =
        true;


    if (gameStatus) {

        gameStatus.textContent =
            "La IA está pensando...";

    }


    if (thinkingStatus) {

        thinkingStatus.textContent =
            "Calculando movimiento...";

    }


    /*
       Comprobar Stockfish
    */

    if (
        !engine ||
        !engineReady
    ) {

        thinking =
            false;


        if (gameStatus) {

            gameStatus.textContent =
                "IA no disponible";

        }


        if (thinkingStatus) {

            thinkingStatus.textContent =
                "La IA todavía no está lista.";

        }


        return;

    }


    /*
       Detener búsqueda anterior
    */

    engine.postMessage(
        "stop"
    );


    /*
       Enviar posición
    */

    engine.postMessage(
        "position fen " +
        chess.fen()
    );


    /*
       Profundidad
    */

    const depth =
        difficulty
            ? Number(
                difficulty.value
            )
            : 10;


    engine.postMessage(
        "go depth " +
        depth
    );

}


/* =========================================================
   MOVIMIENTO DE LA IA
========================================================= */

function ejecutarMovimientoIA(uci) {

    const from =
        uci.substring(
            0,
            2
        );


    const to =
        uci.substring(
            2,
            4
        );


    const promotion =
        uci.length >= 5
            ? uci.substring(
                4,
                5
            )
            : "q";


    console.log(
        "Movimiento IA:",
        from,
        "→",
        to
    );


    const move =
        chess.move({

            from:
                from,

            to:
                to,

            promotion:
                promotion

        });


    /*
       Movimiento inválido
    */

    if (!move) {

        console.error(
            "Stockfish devolvió una jugada inválida:",
            uci
        );


        thinking =
            false;


        updateStatus();


        return;

    }


    /*
       IA terminó
    */

    thinking =
        false;


    renderBoard();

    updateHistory();

    updateStatus();


    /*
       EL BOT HABLA DESPUÉS
       DE LA JUGADA DE LA IA
    */

    botSpeakBySituation();

}


/* =========================================================
   ESTADO DE LA PARTIDA
========================================================= */

function updateStatus() {

    if (!gameStatus) {
        return;
    }


    /*
       JAQUE MATE
    */

    if (
        chess.in_checkmate()
    ) {

        if (
            chess.turn() === "w"
        ) {

            gameStatus.textContent =
                "♚ Jaque mate — ganó la IA";

        }

        else {

            gameStatus.textContent =
                "♔ ¡Jaque mate — ganaste!";

        }


        if (thinkingStatus) {

            thinkingStatus.textContent =
                "La partida ha terminado.";

        }


        return;

    }


    /*
       TABLAS
    */

    if (
        chess.in_draw()
    ) {

        gameStatus.textContent =
            "Tablas";


        if (thinkingStatus) {

            thinkingStatus.textContent =
                "La partida terminó en empate.";

        }


        return;

    }


    /*
       JAQUE
    */

    if (
        chess.in_check()
    ) {

        gameStatus.textContent =
            chess.turn() === "w"
                ? "⚠️ Estás en jaque"
                : "⚠️ La IA está en jaque";


        return;

    }


    /*
       TURNO DEL JUGADOR
    */

    if (
        chess.turn() === "w"
    ) {

        gameStatus.textContent =
            "♙ Tu turno";


        if (thinkingStatus) {

            thinkingStatus.textContent =
                "Selecciona una pieza blanca.";

        }

    }

    else {

        gameStatus.textContent =
            "♟ Turno de la IA";

    }

}


/* =========================================================
   HISTORIAL
========================================================= */

function updateHistory() {

    if (!moveList) {
        return;
    }


    moveList.innerHTML =
        "";


    const history =
        chess.history();


    for (
        let i = 0;
        i < history.length;
        i += 2
    ) {

        const item =
            document.createElement(
                "li"
            );


        const white =
            history[i] ||
            "";


        const black =
            history[i + 1] ||
            "";


        item.textContent =
            white +
            (
                black
                    ? "   " + black
                    : ""
            );


        moveList.appendChild(
            item
        );

    }


    moveList.scrollTop =
        moveList.scrollHeight;

}


/* =========================================================
   NUEVA PARTIDA
========================================================= */

function newGame() {

    /*
       Detener IA
    */

    if (engine) {

        engine.postMessage(
            "stop"
        );

        engine.postMessage(
            "ucinewgame"
        );

    }


    /*
       Limpiar bot
    */

    clearTimeout(
        botTimer
    );


    botLastPhrase =
        "";


    /*
       Nueva partida
    */

    chess =
        new Chess();


    selectedSquare =
        null;


    legalMoves =
        [];


    thinking =
        false;


    /*
       Actualizar
    */

    renderBoard();

    updateHistory();

    updateStatus();


    /*
       Mensaje inicial
    */

    showBotPhrase(
        "A ver, campeón... otra partida. Esta vez intenta no regalarme piezas. 😏♟️"
    );

}


/* =========================================================
   DESHACER MOVIMIENTO
========================================================= */

function undoMove() {

    if (thinking) {
        return;
    }


    const history =
        chess.history();


    if (
        history.length === 0
    ) {

        return;

    }


    /*
       Deshacer movimiento IA
    */

    chess.undo();


    /*
       Deshacer movimiento jugador
    */

    if (
        chess.history().length > 0
    ) {

        chess.undo();

    }


    selectedSquare =
        null;


    legalMoves =
        [];


    renderBoard();

    updateHistory();

    updateStatus();


    showBotPhrase(
        "¿Deshaciendo? No pasa nada... te doy otra oportunidad. 😂"
    );

}


/* =========================================================
   BOTONES
========================================================= */

if (newGameButton) {

    newGameButton.addEventListener(
        "click",
        newGame
    );

}


if (undoButton) {

    undoButton.addEventListener(
        "click",
        undoMove
    );

}


/* =========================================================
   CALIFICACIÓN
========================================================= */

const ratingButtons =
    document.querySelectorAll(
        ".rating-buttons button"
    );


const ratingNumber =
    document.getElementById(
        "rating-number"
    );


const ratingMessage =
    document.getElementById(
        "rating-message"
    );


ratingButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const rating =
                    Number(
                        button.dataset.rating
                    );


                if (ratingNumber) {

                    ratingNumber.textContent =
                        rating;

                }


                ratingButtons.forEach(
                    function(otherButton) {

                        otherButton.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                if (!ratingMessage) {
                    return;
                }


                if (
                    rating > 8
                ) {

                    ratingMessage.textContent =
                        "¡Gracias vato por tu opinión! 😂";

                    ratingMessage.className =
                        "rating-message good";

                }

                else {

                    ratingMessage.textContent =
                        "Uuuuuy 😭 seguiré mejorando la página.";

                    ratingMessage.className =
                        "rating-message normal";

                }

            }
        );

    }
);


/* =========================================================
   ESTILOS DEL BOT
========================================================= */

function addBotStyles() {

    if (
        document.getElementById(
            "chess-bot-styles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "chess-bot-styles";


    style.textContent = `

        #chess-bot-container {

            width:
                min(760px, 90%);

            margin:
                25px auto;

            display:
                flex;

            align-items:
                flex-start;

            gap:
                15px;

            padding:
                18px 20px;

            background:
                linear-gradient(
                    135deg,
                    rgba(126, 34, 206, .20),
                    rgba(20, 10, 30, .85)
                );

            border:
                1px solid
                rgba(192, 132, 252, .30);

            border-radius:
                18px;

            box-shadow:
                0 15px 40px
                rgba(0, 0, 0, .25);

            transition:
                .3s ease;

        }


        #chess-bot-container:hover {

            transform:
                translateY(-2px);

            border-color:
                rgba(192, 132, 252, .55);

        }


        .chess-bot-avatar {

            min-width:
                55px;

            width:
                55px;

            height:
                55px;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            font-size:
                30px;

            background:
                linear-gradient(
                    135deg,
                    #7e22ce,
                    #4c1d95
                );

            border-radius:
                50%;

            box-shadow:
                0 8px 25px
                rgba(126, 34, 206, .35);

        }


        .chess-bot-content {

            flex:
                1;

        }


        .chess-bot-name {

            color:
                #c084fc;

            font-weight:
                800;

            font-size:
                14px;

            margin-bottom:
                5px;

            text-transform:
                uppercase;

            letter-spacing:
                1px;

        }


        .chess-bot-message {

            color:
                #f5effa;

            font-size:
                16px;

            line-height:
                1.55;

        }


        .chess-bot-message.bot-speaking {

            animation:
                botTalk .45s ease;

        }


        @keyframes botTalk {

            0% {

                opacity:
                    0;

                transform:
                    translateY(8px);

            }

            100% {

                opacity:
                    1;

                transform:
                    translateY(0);

            }

        }


        @media (max-width: 600px) {

            #chess-bot-container {

                padding:
                    15px;

            }


            .chess-bot-avatar {

                min-width:
                    45px;

                width:
                    45px;

                height:
                    45px;

                font-size:
                    24px;

            }


            .chess-bot-message {

                font-size:
                    14px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   VOZ DEL BOT
   Lee en voz alta mensajes personalizados cuando el navegador
   dispone de Speech Synthesis.
========================================================= */

function speakBotPhrase(text) {

    if (!text || !("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}


/* =========================================================
   INICIAR TODO
========================================================= */

addBotStyles();

createBotContainer();

showBotPhrase(
    "A ver, campeón... demuéstrame qué sabes hacer. 😏♟️"
);

renderBoard();

updateHistory();

updateStatus();

iniciarStockfish();