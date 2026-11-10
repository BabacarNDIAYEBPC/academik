import type { SeoPageData } from "./SeoPageLang";

const BASE = "https://academik.fr";

type PageType = "apa" | "vancouver" | "mla" | "chicago" | "literature-review" | "dissertation" | "students" | "researchers";

interface LangConfig {
  code: string;
  htmlLang: string;
  slugs: Record<PageType, string>;
  accentColor: string;
  t: {
    badge: Record<PageType, string>;
    h1a: Record<PageType, string>;
    h1b: Record<PageType, string>;
    heroDesc: Record<PageType, string>;
    heroCountries: string;
    ctaBtn: string;
    ctaSecondary: string;
    checkFrom: string;
    checkNoSub: string;
    checkSpeed: string;
    statStudents: string;
    statBibs: string;
    statRating: string;
    statTime: string;
    statStudentsLabel: string;
    statBibsLabel: string;
    statRatingLabel: string;
    statTimeLabel: string;
    whatTitle: Record<PageType, string>;
    whatP1: Record<PageType, string>;
    whatP2: Record<PageType, string>;
    whatP3: string;
    exampleLabel1: Record<PageType, string>;
    exampleLabel2: Record<PageType, string>;
    exampleLabel3: Record<PageType, string>;
    example1: Record<PageType, string>;
    example2: Record<PageType, string>;
    example3: Record<PageType, string>;
    howTitle: string;
    howSubtitle: Record<PageType, string>;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: Record<PageType, string>;
    step3Desc: Record<PageType, string>;
    featuresTitle: string;
    featuresSubtitle: string;
    features: { title: string; desc: string }[];
    whoTitle: string;
    who: { title: string; desc: string; tags: string[] }[];
    faqTitle: string;
    faq: Record<PageType, { q: string; a: string }[]>;
    ctaTitle: Record<PageType, string>;
    ctaDesc: string;
    ctaMainBtn: Record<PageType, string>;
    ctaSub: string;
    partnerText1: string;
    partnerBold: Record<PageType, string>;
    partnerText2: string;
    footerTagline: string;
    footerHome: string;
    footerLogin: string;
    metaTitle: Record<PageType, string>;
    metaDesc: Record<PageType, string>;
  };
}

const LANGS: LangConfig[] = [
  {
    code: "es", htmlLang: "es", accentColor: "orange",
    slugs: { apa: "es/generador-bibliografia-apa", vancouver: "es/bibliografia-vancouver", mla: "es/bibliografia-mla", chicago: "es/bibliografia-chicago", "literature-review": "es/revision-literatura", dissertation: "es/tesis-memoria", students: "es/estudiantes", researchers: "es/investigadores" },
    t: {
      badge: { apa: "Norma APA 7ª edición", vancouver: "Norma Vancouver", mla: "Norma MLA 9", chicago: "Norma Chicago 17", "literature-review": "Revisión de literatura", dissertation: "Tesis y memoria", students: "Para estudiantes", researchers: "Para investigadores" },
      h1a: { apa: "Generador de", vancouver: "Bibliografía", mla: "Bibliografía", chicago: "Bibliografía", "literature-review": "Revisión de", dissertation: "Ayuda para", students: "Academik para", researchers: "Academik para" },
      h1b: { apa: "Bibliografía APA", vancouver: "Vancouver online", mla: "MLA automática", chicago: "Chicago online", "literature-review": "Literatura online", dissertation: "Tesis y Memoria", students: "Estudiantes", researchers: "Investigadores" },
      heroDesc: {
        apa: "Genera bibliografías en formato APA 7 perfectamente formateadas en segundos. Nuestra IA busca en PubMed, Google Scholar y ScienceDirect y formatea automáticamente tu lista de referencias.",
        vancouver: "Crea bibliografías Vancouver numeradas automáticamente. Ideal para medicina, farmacia y ciencias biomédicas. Nuestra IA formatea cada referencia según el estándar Vancouver.",
        mla: "Genera bibliografías MLA 9 de forma automática. Perfecto para humanidades, literatura y lingüística. Referencias correctamente formateadas en segundos.",
        chicago: "Genera bibliografías Chicago 17 con notas a pie de página y bibliografía completa. Ideal para historia y ciencias humanas.",
        "literature-review": "Busca artículos académicos, analiza y sintetiza tus fuentes. Nuestra IA genera revisiones de literatura completas en minutos.",
        dissertation: "Ayuda inteligente para tu tesis o memoria. Búsqueda de fuentes, bibliografía APA automática y síntesis literaria.",
        students: "La herramienta de investigación bibliográfica diseñada para universitarios. Encuentra fuentes, genera bibliografías y analiza tus referencias en un clic.",
        researchers: "Acelera tus revisiones de literatura. IA potente para búsqueda de artículos, síntesis y generación de bibliografías conformes.",
      },
      heroCountries: "Utilizado por estudiantes e investigadores de España, México, Argentina, Colombia y América Latina.",
      ctaBtn: "Empezar gratis", ctaSecondary: "Ver todas las funciones",
      checkFrom: "Desde 4,99 €", checkNoSub: "Sin suscripción", checkSpeed: "Resultados en segundos",
      statStudents: "12.000+", statBibs: "85.000+", statRating: "4,8/5", statTime: "< 10 seg",
      statStudentsLabel: "Estudiantes e investigadores", statBibsLabel: "Bibliografías generadas", statRatingLabel: "Nota media", statTimeLabel: "Tiempo de generación",
      whatTitle: { apa: "¿Qué es la norma APA 7?", vancouver: "¿Qué es la norma Vancouver?", mla: "¿Qué es la norma MLA 9?", chicago: "¿Qué es la norma Chicago 17?", "literature-review": "¿Qué es una revisión de literatura?", dissertation: "¿Cómo hacer una tesis o memoria?", students: "Investigación bibliográfica para universitarios", researchers: "Herramienta de investigación para académicos" },
      whatP1: {
        apa: "La norma APA (American Psychological Association) 7ª edición es el estándar de citación más utilizado en ciencias sociales, psicología, educación y ciencias de la salud.",
        vancouver: "La norma Vancouver es el estándar de citación utilizado en medicina, farmacia y ciencias biomédicas. Se caracteriza por la numeración secuencial de las referencias.",
        mla: "La norma MLA (Modern Language Association) 9ª edición es el estándar de citación usado en humanidades, literatura, lingüística y artes.",
        chicago: "La norma Chicago 17ª edición ofrece dos sistemas: notas y bibliografía (historia y humanidades) y autor-fecha (ciencias sociales).",
        "literature-review": "Una revisión de literatura sistemática es un análisis exhaustivo y crítico de las publicaciones científicas sobre un tema determinado.",
        dissertation: "La tesis o memoria es el trabajo de investigación académica que culmina los estudios universitarios de grado, máster o doctorado.",
        students: "Academik está diseñado específicamente para estudiantes universitarios que necesitan realizar trabajos académicos con referencias bibliográficas correctas.",
        researchers: "Academik proporciona a investigadores y académicos las herramientas necesarias para realizar revisiones de literatura exhaustivas.",
      },
      whatP2: {
        apa: "Define con precisión cómo citar artículos científicos, libros, sitios web, tesis y otras fuentes. Una bibliografía APA correcta es esencial para validar un TFG, TFM o tesis doctoral.",
        vancouver: "Cada referencia recibe un número en el orden en que aparece en el texto. Este sistema facilita la lectura y es obligatorio en revistas médicas de primer nivel.",
        mla: "Define el formato de las entradas en la lista de obras citadas y las citas en el texto. Es el estándar requerido por la mayoría de universidades en letras y humanidades.",
        chicago: "Es el sistema preferido en publicaciones académicas de historia, filosofía y ciencias humanas en muchas universidades hispanohablantes.",
        "literature-review": "Es fundamental para identificar el estado del arte, detectar lagunas de conocimiento y contextualizar una investigación original.",
        dissertation: "Requiere una revisión de literatura rigurosa, una metodología clara y una bibliografía perfectamente formateada en el estilo exigido por tu institución.",
        students: "Con Academik, buscar fuentes académicas, generar bibliografías y analizar artículos se convierte en un proceso rápido y sencillo.",
        researchers: "Reduce el tiempo de búsqueda bibliográfica y genera revisiones de literatura estructuradas con la ayuda de GPT-4o.",
      },
      whatP3: "Academik genera automáticamente tus referencias en el formato correcto, integrando las últimas normas para fuentes digitales, DOI y URLs.",
      exampleLabel1: { apa: "Ejemplo APA 7 — Artículo de revista", vancouver: "Ejemplo Vancouver — Artículo", mla: "Ejemplo MLA 9 — Artículo", chicago: "Ejemplo Chicago — Nota a pie", "literature-review": "Ejemplo — Síntesis temática", dissertation: "Ejemplo — Referencia tesis", students: "Ejemplo — Referencia APA", researchers: "Ejemplo — Referencia artículo" },
      exampleLabel2: { apa: "Ejemplo APA 7 — Libro", vancouver: "Ejemplo Vancouver — Libro", mla: "Ejemplo MLA 9 — Libro", chicago: "Ejemplo Chicago — Bibliografía", "literature-review": "Ejemplo — Confrontación", dissertation: "Ejemplo — Referencia libro", students: "Ejemplo — Vancouver", researchers: "Ejemplo — Vancouver" },
      exampleLabel3: { apa: "Ejemplo APA 7 — Sitio web", vancouver: "Ejemplo Vancouver — Web", mla: "Ejemplo MLA 9 — Web", chicago: "Ejemplo Chicago — Web", "literature-review": "Ejemplo — Mapeamiento", dissertation: "Ejemplo — Referencia web", students: "Ejemplo — MLA", researchers: "Ejemplo — Chicago" },
      example1: {
        apa: "García, J., &amp; López, M. (2023). El impacto de la IA en la investigación académica. <em>Revista de Ciencias Sociales, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx",
        vancouver: "García J, López M. El impacto de la IA en la investigación académica. Rev Cienc Soc. 2023;45(2):112-34.",
        mla: 'García, Juan, y María López. "El impacto de la IA en la investigación académica." <em>Revista de Ciencias Sociales</em>, vol. 45, núm. 2, 2023, pp. 112-134.',
        chicago: "1. Juan García y María López, \"El impacto de la IA,\" <em>Revista de Ciencias Sociales</em> 45, núm. 2 (2023): 112–134.",
        "literature-review": "Síntesis: Los estudios analizados coinciden en señalar que la inteligencia artificial mejora significativamente la eficiencia de la investigación académica (García, 2023; López, 2022).",
        dissertation: "García, J., &amp; López, M. (2023). <em>Metodología de investigación académica</em>. Editorial Universitaria.",
        students: "García, J., &amp; López, M. (2023). Investigación académica con IA. <em>Revista Universitaria, 45</em>(2), 112–134.",
        researchers: "García, J., et al. (2023). Revisión sistemática sobre IA en investigación. <em>Revista Académica, 45</em>(2), 112–134.",
      },
      example2: {
        apa: "Martínez, A. (2022). <em>Metodología de la investigación en ciencias sociales</em> (3ª ed.). Editorial Universitaria.",
        vancouver: "Martínez A. Metodología de la investigación. 3ª ed. Madrid: Editorial Universitaria; 2022.",
        mla: "Martínez, Ana. <em>Metodología de la investigación en ciencias sociales</em>. 3ª ed., Editorial Universitaria, 2022.",
        chicago: "Martínez, Ana. <em>Metodología de la investigación en ciencias sociales</em>. 3ª ed. Madrid: Editorial Universitaria, 2022.",
        "literature-review": "Confrontación: García (2023) afirma que la IA acelera la revisión de literatura, mientras que López (2022) señala limitaciones en contextos humanísticos.",
        dissertation: "Martínez, A. (2022). <em>Metodología de la investigación</em>. Editorial Universitaria.",
        students: "Martínez, A. (2022). Investigación social. 3ª ed. Editorial Universitaria.",
        researchers: "Martínez, A. (2022). <em>Metodología avanzada</em>. 3ª ed. Editorial Académica.",
      },
      example3: {
        apa: "Organización Mundial de la Salud. (2023, 15 marzo). <em>Guía de salud mental</em>. https://www.who.int/es/mental-health",
        vancouver: "OMS. Guía de salud mental [Internet]. 2023 [citado 2024]. Disponible en: https://www.who.int",
        mla: "Organización Mundial de la Salud. \"Guía de salud mental.\" <em>OMS</em>, 15 mar. 2023, www.who.int/es.",
        chicago: "Organización Mundial de la Salud. \"Guía de salud mental.\" Consultado el 15 de marzo de 2023. https://www.who.int.",
        "literature-review": "Mapeamiento temático: Tema 1 — IA y eficiencia; Tema 2 — Limitaciones éticas; Tema 3 — Aplicaciones en salud.",
        dissertation: "OMS. (2023). <em>Guía de prevención</em>. https://www.who.int/es",
        students: "OMS. (2023). Guía de salud. https://www.who.int/es",
        researchers: "OMS. (2023). <em>Guía metodológica</em>. https://www.who.int/es",
      },
      howTitle: "¿Cómo funciona?", howSubtitle: { apa: "En 3 sencillos pasos, obtén una bibliografía APA 7 completa lista para pegar en tu trabajo.", vancouver: "En 3 pasos, obtén referencias Vancouver numeradas y formateadas correctamente.", mla: "En 3 pasos, obtén tu bibliografía MLA lista para usar.", chicago: "En 3 pasos, genera tu bibliografía Chicago completa.", "literature-review": "En 3 pasos, genera una revisión de literatura académica completa.", dissertation: "En 3 pasos, encuentra fuentes y genera tu bibliografía.", students: "En 3 pasos, completa tu investigación bibliográfica.", researchers: "En 3 pasos, acelera tu revisión de literatura." },
      step1Title: "Describe tu tema", step1Desc: "Introduce tu tema de investigación o palabras clave. Academik busca en PubMed, Google Scholar, ScienceDirect y otras bases de datos para encontrar las fuentes más relevantes.",
      step2Title: "La IA selecciona y analiza", step2Desc: "Nuestra IA potenciada por GPT-4o selecciona fuentes académicas de calidad, extrae metadatos (autores, año, revista, DOI) y verifica su relevancia para tu tema.",
      step3Title: { apa: "Bibliografía APA generada", vancouver: "Referencias Vancouver listas", mla: "Bibliografía MLA lista", chicago: "Bibliografía Chicago lista", "literature-review": "Revisión de literatura completa", dissertation: "Bibliografía y síntesis listas", students: "Referencias listas", researchers: "Revisión completa lista" },
      step3Desc: { apa: "En segundos, tu bibliografía APA 7 está formateada y lista para usar. Cópiala directamente en Word, Google Docs o tu software de escritura.", vancouver: "Tus referencias Vancouver están numeradas y formateadas. Cópielas en tu artículo o tesis médica.", mla: "Tu bibliografía MLA está lista. Cópiala en tu trabajo académico de humanidades.", chicago: "Tu bibliografía Chicago está completa. Lista para insertar en tu trabajo de historia o humanidades.", "literature-review": "Tu revisión de literatura está estructurada con resúmenes, confrontaciones y síntesis temáticas.", dissertation: "Tu bibliografía está formateada y tu síntesis lista para incorporar en tu tesis o memoria.", students: "Tus referencias están listas. Cópialas en tu TFG, TFM o trabajo universitario.", researchers: "Tu revisión está completa con síntesis, confrontación y bibliografía formateada." },
      featuresTitle: "Todo lo que necesitas", featuresSubtitle: "Más allá de la bibliografía, Academik cubre todas tus necesidades de investigación.",
      features: [
        { title: "APA 7ª edición", desc: "Formato más reciente, compatible con todas las universidades hispanohablantes e internacionales." },
        { title: "Vancouver", desc: "Estándar en medicina, farmacia y ciencias biomédicas. Numeración automática." },
        { title: "MLA 9", desc: "Usado en letras, idiomas y humanidades. Formato automático." },
        { title: "Chicago 17", desc: "Para historia y ciencias humanas. Notas a pie de página incluidas." },
        { title: "Bases de datos académicas", desc: "PubMed, Google Scholar, ScienceDirect, Scopus — todas las grandes bases de datos." },
        { title: "Revisión de literatura", desc: "Compara y sintetiza automáticamente tus fuentes para tu revisión sistemática." },
        { title: "Fichas de lectura", desc: "Genera fichas de lectura estructuradas a partir de tus PDF y artículos." },
        { title: "Ecuaciones de búsqueda", desc: "Crea ecuaciones booleanas para PubMed, Scopus y Web of Science." },
        { title: "Exportación inmediata", desc: "Copia en un clic en Word, Google Docs, LaTeX o tu software de escritura." },
      ],
      whoTitle: "¿Para quién es Academik?",
      who: [
        { title: "Estudiantes", desc: "Grado, Máster y Doctorado. Ideal para TFG, TFM, tesis y trabajos universitarios en España, México, Argentina y toda América Latina.", tags: ["TFG", "TFM", "Tesis", "Trabajos"] },
        { title: "Investigadores", desc: "Profesores, investigadores y postdoctorandos. Acelera tus revisiones de literatura y asegura la conformidad bibliográfica de tus publicaciones.", tags: ["Artículos", "Revistas", "Congresos", "Proyectos"] },
        { title: "Profesionales", desc: "Médicos, enfermeros, trabajadores sociales, consultores. Produce bibliografías profesionales para informes, formaciones y publicaciones internas.", tags: ["Informes", "Formaciones", "Protocolos", "Auditorías"] },
      ],
      faqTitle: "Preguntas frecuentes",
      faq: {
        apa: [
          { q: "¿Qué es la norma APA 7?", a: "La norma APA (American Psychological Association) 7ª edición es el estándar de citación más utilizado en ciencias sociales, psicología, educación y salud. Define el formato de las referencias bibliográficas y las citas en el texto." },
          { q: "¿Cómo generar una bibliografía APA automáticamente?", a: "Con Academik, describe tu tema de investigación o pega tus fuentes. Nuestra IA analiza la información y genera automáticamente la bibliografía en formato APA 7 con autores, años, títulos, revistas y DOI correctamente formateados." },
          { q: "¿Es gratuito Academik?", a: "Academik funciona con un sistema de créditos. Puedes empezar con un pack Starter desde 4,99 € por 10 créditos. Cada acción (búsqueda, generación de bibliografía) cuesta 1 crédito. Sin suscripción mensual." },
          { q: "¿Cuál es la diferencia entre APA, Vancouver y MLA?", a: "APA se usa en ciencias sociales y de la salud. Vancouver es el estándar en ciencias médicas (numeración). MLA se usa en literatura y humanidades. Chicago se usa en historia. Academik genera los cuatro formatos." },
          { q: "¿Puedo usar Academik para mi TFM o tesis?", a: "Absolutamente. Academik está diseñado para estudiantes de máster, doctorado y profesionales. Genera bibliografías conformes a los requisitos universitarios en APA 7, Vancouver, MLA y Chicago." },
        ],
        vancouver: [
          { q: "¿Qué es la norma Vancouver?", a: "La norma Vancouver es el sistema de citación estándar en medicina y ciencias de la salud. Las referencias se numeran en el orden de aparición en el texto y se listan al final del documento." },
          { q: "¿Cómo genero una bibliografía Vancouver automáticamente?", a: "Con Academik, introduce tu tema o tus fuentes. Nuestra IA genera automáticamente la lista de referencias en formato Vancouver con la numeración correcta." },
          { q: "¿Es Academik gratuito?", a: "Academik funciona con créditos desde 4,99 € por 10 créditos. Sin suscripción mensual." },
          { q: "¿Vancouver es diferente de APA?", a: "Sí. Vancouver usa numeración secuencial (estándar médico) mientras que APA usa el sistema autor-fecha (ciencias sociales). Academik genera ambos formatos." },
          { q: "¿Puedo usar Academik para mi TFM médico?", a: "Sí. Academik está diseñado para estudiantes de medicina, enfermería y otras ciencias de la salud que necesitan bibliografías Vancouver." },
        ],
        mla: [
          { q: "¿Qué es la norma MLA 9?", a: "La norma MLA (Modern Language Association) 9ª edición es el estándar de citación usado en humanidades, literatura, lingüística y artes en muchas universidades hispanohablantes." },
          { q: "¿Cómo genero una bibliografía MLA?", a: "Con Academik, describe tu tema. La IA genera automáticamente tu lista de obras citadas en formato MLA 9." },
          { q: "¿Es Academik gratuito?", a: "Academik usa créditos desde 4,99 € por 10 créditos. Sin suscripción." },
          { q: "¿MLA es diferente de APA?", a: "Sí. MLA usa el sistema autor-página mientras que APA usa autor-año. MLA es estándar en humanidades, APA en ciencias sociales." },
          { q: "¿Puedo exportar mi bibliografía MLA?", a: "Sí. Academik te permite copiar tu bibliografía directamente en Word, Google Docs o cualquier procesador de texto." },
        ],
        chicago: [
          { q: "¿Qué es la norma Chicago 17?", a: "La norma Chicago 17ª edición ofrece dos sistemas: notas y bibliografía (historia y humanidades) y autor-fecha (ciencias sociales). Es el estándar en publicaciones académicas de historia." },
          { q: "¿Cómo genero una bibliografía Chicago?", a: "Con Academik, describe tu tema. La IA genera automáticamente tu bibliografía en formato Chicago 17." },
          { q: "¿Es Academik gratuito?", a: "Academik usa créditos desde 4,99 €. Sin suscripción mensual." },
          { q: "¿Chicago es diferente de APA?", a: "Sí. Chicago usa notas a pie de página y bibliografía completa, mientras que APA usa citas en el texto (autor, año). Chicago es preferido en historia y humanidades." },
          { q: "¿Puedo usar Chicago para mi tesis de historia?", a: "Absolutamente. Academik genera bibliografías Chicago 17 conformes a los requisitos universitarios para trabajos de historia y humanidades." },
        ],
        "literature-review": [
          { q: "¿Qué es una revisión de literatura?", a: "Una revisión de literatura es un análisis crítico y sistemático de las publicaciones científicas sobre un tema. Es fundamental para cualquier trabajo académico o investigación original." },
          { q: "¿Cómo genera Academik una revisión de literatura?", a: "Academik busca artículos en múltiples bases de datos, los analiza con IA y genera resúmenes, confrontaciones y síntesis temáticas estructuradas." },
          { q: "¿Es Academik gratuito?", a: "Academik usa créditos desde 4,99 €. Sin suscripción." },
          { q: "¿Qué bases de datos usa Academik?", a: "Academik busca en PubMed, Google Scholar, ScienceDirect, Scopus y otras bases de datos académicas internacionales." },
          { q: "¿Puedo usar Academik para mi tesis?", a: "Sí. Academik está diseñado específicamente para ayudar a estudiantes e investigadores en la elaboración de sus trabajos académicos." },
        ],
        dissertation: [
          { q: "¿Cómo ayuda Academik con mi tesis o TFM?", a: "Academik busca fuentes académicas relevantes, genera bibliografías en el formato requerido (APA, Vancouver, MLA, Chicago) y crea síntesis literarias para tu marco teórico." },
          { q: "¿Qué formatos de bibliografía soporta?", a: "APA 7, Vancouver, MLA 9 y Chicago 17 — los cuatro formatos más utilizados en universidades hispanohablantes e internacionales." },
          { q: "¿Es Academik gratuito?", a: "Academik usa créditos desde 4,99 €. Sin suscripción mensual." },
          { q: "¿Cuánto tiempo ahorra Academik?", a: "Los usuarios reportan ahorrar entre 5 y 15 horas en la búsqueda bibliográfica y formateo de referencias para sus tesis y memorias." },
          { q: "¿Funciona para universidades de España y Latinoamérica?", a: "Sí. Academik genera bibliografías conformes a los requisitos de universidades de España, México, Argentina, Colombia y toda América Latina." },
        ],
        students: [
          { q: "¿Para qué tipos de trabajos sirve Academik?", a: "TFG (Trabajo Fin de Grado), TFM (Trabajo Fin de Máster), tesis doctorales, trabajos de clase, prácticas. Cualquier trabajo académico que requiera bibliografía." },
          { q: "¿Qué formatos genera Academik?", a: "APA 7, Vancouver, MLA 9 y Chicago 17 — todos los formatos principales requeridos por universidades hispanohablantes." },
          { q: "¿Es Academik gratuito?", a: "Academik usa créditos desde 4,99 €. Sin suscripción." },
          { q: "¿Puedo buscar fuentes en español?", a: "Sí. Academik busca en bases de datos españolas e internacionales: Dialnet, Redalyc, Scielo, PubMed, Google Scholar." },
          { q: "¿Academik es difícil de usar?", a: "No. Academik está diseñado para ser intuitivo. Introduce tu tema, selecciona el formato y obtén tu bibliografía en segundos." },
        ],
        researchers: [
          { q: "¿Qué ofrece Academik a los investigadores?", a: "Búsqueda en múltiples bases de datos, síntesis de literatura, generación de bibliografías en todos los formatos estándar y ecuaciones de búsqueda booleanas." },
          { q: "¿Qué bases de datos incluye?", a: "PubMed, Google Scholar, ScienceDirect, Scopus, Web of Science y otras bases de datos académicas internacionales." },
          { q: "¿Es Academik gratuito?", a: "Academik usa créditos desde 4,99 €. Sin suscripción mensual." },
          { q: "¿Puede generar ecuaciones de búsqueda booleanas?", a: "Sí. Academik genera ecuaciones de búsqueda optimizadas para PubMed, Scopus y Web of Science." },
          { q: "¿Es seguro para publicaciones académicas?", a: "Sí. Academik genera referencias conformes a los estándares internacionales de publicación académica." },
        ],
      },
      ctaTitle: { apa: "¿Listo para generar tu bibliografía APA?", vancouver: "¿Listo para tu bibliografía Vancouver?", mla: "¿Listo para tu bibliografía MLA?", chicago: "¿Listo para tu bibliografía Chicago?", "literature-review": "¿Listo para tu revisión de literatura?", dissertation: "¿Listo para tu tesis o TFM?", students: "¿Listo para tu trabajo universitario?", researchers: "¿Listo para tu revisión de literatura?" },
      ctaDesc: "Únete a más de 12.000 estudiantes e investigadores que usan Academik para sus trabajos académicos.",
      ctaMainBtn: { apa: "Generar mi bibliografía APA", vancouver: "Generar mi bibliografía Vancouver", mla: "Generar mi bibliografía MLA", chicago: "Generar mi bibliografía Chicago", "literature-review": "Iniciar mi revisión de literatura", dissertation: "Comenzar mi tesis", students: "Empezar mi investigación", researchers: "Iniciar mi revisión" },
      ctaSub: "Sin suscripción · Pago seguro · Resultados inmediatos",
      partnerText1: "¿Necesitas ayuda para", partnerBold: { apa: "redactar tu tesis o memoria?", vancouver: "redactar tu trabajo médico?", mla: "redactar tu trabajo de humanidades?", chicago: "redactar tu trabajo de historia?", "literature-review": "redactar tu revisión de literatura?", dissertation: "redactar tu tesis o memoria?", students: "redactar tu TFG o TFM?", researchers: "redactar tu artículo?" }, partnerText2: " —",
      footerTagline: "Herramienta de investigación bibliográfica IA", footerHome: "Inicio", footerLogin: "Iniciar sesión",
      metaTitle: {
        apa: "Generador de Bibliografía APA 7 Online — Gratis | Academik",
        vancouver: "Generador de Bibliografía Vancouver Online — Gratis | Academik",
        mla: "Generador de Bibliografía MLA 9 Online — Gratis | Academik",
        chicago: "Generador de Bibliografía Chicago 17 Online — Gratis | Academik",
        "literature-review": "Revisión de Literatura Académica Online — IA | Academik",
        dissertation: "Ayuda para Tesis y TFM Online — IA | Academik",
        students: "Academik para Estudiantes — Investigación Bibliográfica IA",
        researchers: "Academik para Investigadores — Revisión de Literatura IA",
      },
      metaDesc: {
        apa: "Genera bibliografías APA 7 perfectas en segundos. Herramienta gratuita para estudiantes e investigadores hispanohablantes. Compatible con PubMed, Google Scholar, Dialnet.",
        vancouver: "Genera bibliografías Vancouver automáticamente. Ideal para medicina y ciencias de la salud. Compatible con PubMed y ScienceDirect.",
        mla: "Genera bibliografías MLA 9 automáticamente. Perfecto para humanidades y literatura. Herramienta gratuita para universitarios hispanohablantes.",
        chicago: "Genera bibliografías Chicago 17 con notas a pie de página. Ideal para historia y humanidades en universidades hispanohablantes.",
        "literature-review": "Genera revisiones de literatura académicas completas con IA. Búsqueda en PubMed, Google Scholar, Scopus. Para estudiantes e investigadores.",
        dissertation: "Ayuda inteligente para tu tesis o TFM. Bibliografía APA automática y síntesis de literatura. Academik para universitarios hispanohablantes.",
        students: "La herramienta de investigación bibliográfica para estudiantes universitarios. TFG, TFM, tesis. Bibliografías APA, Vancouver, MLA, Chicago en segundos.",
        researchers: "Herramienta de revisión de literatura para investigadores. Búsqueda en bases de datos, síntesis y bibliografías automáticas en todos los formatos.",
      },
    },
  },
  {
    code: "pt", htmlLang: "pt", accentColor: "green",
    slugs: { apa: "pt/gerador-bibliografia-apa", vancouver: "pt/bibliografia-vancouver", mla: "pt/bibliografia-mla", chicago: "pt/bibliografia-chicago", "literature-review": "pt/revisao-literatura", dissertation: "pt/tese-dissertacao", students: "pt/estudantes", researchers: "pt/pesquisadores" },
    t: {
      badge: { apa: "Norma APA 7ª edição", vancouver: "Norma Vancouver", mla: "Norma MLA 9", chicago: "Norma Chicago 17", "literature-review": "Revisão de literatura", dissertation: "Tese e dissertação", students: "Para estudantes", researchers: "Para pesquisadores" },
      h1a: { apa: "Gerador de", vancouver: "Bibliografia", mla: "Bibliografia", chicago: "Bibliografia", "literature-review": "Revisão de", dissertation: "Ajuda para", students: "Academik para", researchers: "Academik para" },
      h1b: { apa: "Bibliografia APA", vancouver: "Vancouver online", mla: "MLA automática", chicago: "Chicago online", "literature-review": "Literatura online", dissertation: "Tese e Dissertação", students: "Estudantes", researchers: "Pesquisadores" },
      heroDesc: {
        apa: "Gere bibliografias no formato APA 7 perfeitamente formatadas em segundos. Nossa IA busca no PubMed, Google Scholar e ScienceDirect e formata automaticamente sua lista de referências.",
        vancouver: "Crie bibliografias Vancouver numeradas automaticamente. Ideal para medicina, farmácia e ciências biomédicas.",
        mla: "Gere bibliografias MLA 9 automaticamente. Perfeito para humanidades, literatura e linguística.",
        chicago: "Gere bibliografias Chicago 17 com notas de rodapé e bibliografia completa. Ideal para história e ciências humanas.",
        "literature-review": "Busque artigos acadêmicos, analise e sintetize suas fontes. Nossa IA gera revisões de literatura completas em minutos.",
        dissertation: "Ajuda inteligente para sua tese ou dissertação. Busca de fontes, bibliografia APA automática e síntese literária.",
        students: "A ferramenta de pesquisa bibliográfica para universitários. Encontre fontes, gere bibliografias e analise referências em um clique.",
        researchers: "Acelere suas revisões de literatura. IA poderosa para busca de artigos, síntese e geração de bibliografias.",
      },
      heroCountries: "Utilizado por estudantes e pesquisadores do Brasil, Portugal, Angola, Moçambique e países lusófonos.",
      ctaBtn: "Começar grátis", ctaSecondary: "Ver todas as funcionalidades",
      checkFrom: "A partir de 4,99 €", checkNoSub: "Sem assinatura", checkSpeed: "Resultados em segundos",
      statStudents: "12.000+", statBibs: "85.000+", statRating: "4,8/5", statTime: "< 10 seg",
      statStudentsLabel: "Estudantes e pesquisadores", statBibsLabel: "Bibliografias geradas", statRatingLabel: "Nota média", statTimeLabel: "Tempo de geração",
      whatTitle: { apa: "O que é a norma APA 7?", vancouver: "O que é a norma Vancouver?", mla: "O que é a norma MLA 9?", chicago: "O que é a norma Chicago 17?", "literature-review": "O que é uma revisão de literatura?", dissertation: "Como fazer uma tese ou dissertação?", students: "Pesquisa bibliográfica para universitários", researchers: "Ferramenta de pesquisa para acadêmicos" },
      whatP1: {
        apa: "A norma APA (American Psychological Association) 7ª edição é o padrão de citação mais utilizado em ciências sociais, psicologia, educação e ciências da saúde.",
        vancouver: "A norma Vancouver é o padrão de citação utilizado em medicina, farmácia e ciências biomédicas. Caracteriza-se pela numeração sequencial das referências.",
        mla: "A norma MLA (Modern Language Association) 9ª edição é o padrão de citação usado em humanidades, literatura, linguística e artes.",
        chicago: "A norma Chicago 17ª edição oferece dois sistemas: notas e bibliografia (história e humanidades) e autor-data (ciências sociais).",
        "literature-review": "Uma revisão de literatura sistemática é uma análise exaustiva e crítica das publicações científicas sobre um determinado tema.",
        dissertation: "A tese ou dissertação é o trabalho de pesquisa acadêmica que culmina os estudos de graduação, mestrado ou doutorado.",
        students: "O Academik foi desenvolvido especificamente para estudantes universitários que precisam realizar trabalhos acadêmicos com referências bibliográficas corretas.",
        researchers: "O Academik fornece a pesquisadores e acadêmicos as ferramentas necessárias para realizar revisões de literatura exaustivas.",
      },
      whatP2: {
        apa: "Define com precisão como citar artigos científicos, livros, sites, teses e outras fontes. Uma bibliografia APA correta é essencial para validar uma monografia, dissertação ou tese.",
        vancouver: "Cada referência recebe um número na ordem em que aparece no texto. Este sistema facilita a leitura e é obrigatório em revistas médicas de primeiro nível.",
        mla: "Define o formato das entradas na lista de obras citadas e as citações no texto. É o padrão exigido pela maioria das universidades em letras e humanidades.",
        chicago: "É o sistema preferido em publicações acadêmicas de história, filosofia e ciências humanas em muitas universidades brasileiras e portuguesas.",
        "literature-review": "É fundamental para identificar o estado da arte, detectar lacunas de conhecimento e contextualizar uma pesquisa original.",
        dissertation: "Requer uma revisão de literatura rigorosa, uma metodologia clara e uma bibliografia perfeitamente formatada no estilo exigido pela sua instituição.",
        students: "Com o Academik, buscar fontes acadêmicas, gerar bibliografias e analisar artigos torna-se um processo rápido e simples.",
        researchers: "Reduza o tempo de busca bibliográfica e gere revisões de literatura estruturadas com a ajuda do GPT-4o.",
      },
      whatP3: "O Academik gera automaticamente suas referências no formato correto, integrando as últimas normas para fontes digitais, DOI e URLs.",
      exampleLabel1: { apa: "Exemplo APA 7 — Artigo de periódico", vancouver: "Exemplo Vancouver — Artigo", mla: "Exemplo MLA 9 — Artigo", chicago: "Exemplo Chicago — Nota de rodapé", "literature-review": "Exemplo — Síntese temática", dissertation: "Exemplo — Referência tese", students: "Exemplo — Referência APA", researchers: "Exemplo — Referência artigo" },
      exampleLabel2: { apa: "Exemplo APA 7 — Livro", vancouver: "Exemplo Vancouver — Livro", mla: "Exemplo MLA 9 — Livro", chicago: "Exemplo Chicago — Bibliografia", "literature-review": "Exemplo — Confrontação", dissertation: "Exemplo — Referência livro", students: "Exemplo — Vancouver", researchers: "Exemplo — Vancouver" },
      exampleLabel3: { apa: "Exemplo APA 7 — Site", vancouver: "Exemplo Vancouver — Web", mla: "Exemplo MLA 9 — Web", chicago: "Exemplo Chicago — Web", "literature-review": "Exemplo — Mapeamento", dissertation: "Exemplo — Referência web", students: "Exemplo — MLA", researchers: "Exemplo — Chicago" },
      example1: {
        apa: "Silva, J., &amp; Costa, M. (2023). O impacto da IA na pesquisa acadêmica. <em>Revista Brasileira de Ciências Sociais, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx",
        vancouver: "Silva J, Costa M. O impacto da IA na pesquisa acadêmica. Rev Bras Cienc Soc. 2023;45(2):112-34.",
        mla: 'Silva, João, e Maria Costa. "O impacto da IA na pesquisa acadêmica." <em>Revista Brasileira de Ciências Sociais</em>, vol. 45, n.º 2, 2023, pp. 112-134.',
        chicago: "1. João Silva e Maria Costa, \"O impacto da IA,\" <em>Revista Brasileira</em> 45, n.º 2 (2023): 112–134.",
        "literature-review": "Síntese: Os estudos analisados concordam que a inteligência artificial melhora significativamente a eficiência da pesquisa acadêmica (Silva, 2023; Costa, 2022).",
        dissertation: "Silva, J., &amp; Costa, M. (2023). <em>Metodologia de pesquisa acadêmica</em>. Editora Universitária.",
        students: "Silva, J., &amp; Costa, M. (2023). Pesquisa acadêmica com IA. <em>Revista Universitária, 45</em>(2), 112–134.",
        researchers: "Silva, J., et al. (2023). Revisão sistemática sobre IA em pesquisa. <em>Revista Acadêmica, 45</em>(2), 112–134.",
      },
      example2: {
        apa: "Santos, A. (2022). <em>Metodologia da pesquisa em ciências sociais</em> (3ª ed.). Editora Universitária.",
        vancouver: "Santos A. Metodologia da pesquisa. 3ª ed. São Paulo: Editora Universitária; 2022.",
        mla: "Santos, Ana. <em>Metodologia da pesquisa em ciências sociais</em>. 3ª ed., Editora Universitária, 2022.",
        chicago: "Santos, Ana. <em>Metodologia da pesquisa em ciências sociais</em>. 3ª ed. São Paulo: Editora Universitária, 2022.",
        "literature-review": "Confrontação: Silva (2023) afirma que a IA acelera a revisão de literatura, enquanto Costa (2022) aponta limitações em contextos humanísticos.",
        dissertation: "Santos, A. (2022). <em>Metodologia da pesquisa</em>. Editora Universitária.",
        students: "Santos, A. (2022). Pesquisa social. 3ª ed. Editora Universitária.",
        researchers: "Santos, A. (2022). <em>Metodologia avançada</em>. 3ª ed. Editora Acadêmica.",
      },
      example3: {
        apa: "Organização Mundial da Saúde. (2023, 15 março). <em>Guia de saúde mental</em>. https://www.who.int/pt/mental-health",
        vancouver: "OMS. Guia de saúde mental [Internet]. 2023 [citado 2024]. Disponível em: https://www.who.int",
        mla: "Organização Mundial da Saúde. \"Guia de saúde mental.\" <em>OMS</em>, 15 mar. 2023, www.who.int/pt.",
        chicago: "Organização Mundial da Saúde. \"Guia de saúde mental.\" Consultado em 15 de março de 2023. https://www.who.int.",
        "literature-review": "Mapeamento temático: Tema 1 — IA e eficiência; Tema 2 — Limitações éticas; Tema 3 — Aplicações em saúde.",
        dissertation: "OMS. (2023). <em>Guia de prevenção</em>. https://www.who.int/pt",
        students: "OMS. (2023). Guia de saúde. https://www.who.int/pt",
        researchers: "OMS. (2023). <em>Guia metodológico</em>. https://www.who.int/pt",
      },
      howTitle: "Como funciona?", howSubtitle: { apa: "Em 3 etapas simples, obtenha uma bibliografia APA 7 completa pronta para colar no seu trabalho.", vancouver: "Em 3 etapas, obtenha referências Vancouver numeradas e formatadas corretamente.", mla: "Em 3 etapas, obtenha sua bibliografia MLA pronta para uso.", chicago: "Em 3 etapas, gere sua bibliografia Chicago completa.", "literature-review": "Em 3 etapas, gere uma revisão de literatura acadêmica completa.", dissertation: "Em 3 etapas, encontre fontes e gere sua bibliografia.", students: "Em 3 etapas, complete sua pesquisa bibliográfica.", researchers: "Em 3 etapas, acelere sua revisão de literatura." },
      step1Title: "Descreva seu tema", step1Desc: "Insira seu tema de pesquisa ou palavras-chave. O Academik busca no PubMed, Google Scholar, ScienceDirect e outras bases de dados para encontrar as fontes mais relevantes.",
      step2Title: "A IA seleciona e analisa", step2Desc: "Nossa IA potencializada pelo GPT-4o seleciona fontes acadêmicas de qualidade, extrai metadados (autores, ano, periódico, DOI) e verifica sua relevância para o tema.",
      step3Title: { apa: "Bibliografia APA gerada", vancouver: "Referências Vancouver prontas", mla: "Bibliografia MLA pronta", chicago: "Bibliografia Chicago pronta", "literature-review": "Revisão de literatura completa", dissertation: "Bibliografia e síntese prontas", students: "Referências prontas", researchers: "Revisão completa pronta" },
      step3Desc: { apa: "Em segundos, sua bibliografia APA 7 está formatada e pronta para uso. Copie diretamente no Word, Google Docs ou seu software de escrita.", vancouver: "Suas referências Vancouver estão numeradas e formatadas. Copie para seu artigo ou tese médica.", mla: "Sua bibliografia MLA está pronta. Copie para seu trabalho acadêmico de humanidades.", chicago: "Sua bibliografia Chicago está completa. Pronta para inserir no seu trabalho de história ou humanidades.", "literature-review": "Sua revisão de literatura está estruturada com resumos, confrontações e sínteses temáticas.", dissertation: "Sua bibliografia está formatada e sua síntese pronta para incorporar em sua tese ou dissertação.", students: "Suas referências estão prontas. Copie para sua monografia, TCC ou trabalho universitário.", researchers: "Sua revisão está completa com síntese, confrontação e bibliografia formatada." },
      featuresTitle: "Tudo o que você precisa", featuresSubtitle: "Além da bibliografia, o Academik cobre todas as suas necessidades de pesquisa.",
      features: [
        { title: "APA 7ª edição", desc: "Formato mais recente, compatível com todas as universidades brasileiras, portuguesas e internacionais." },
        { title: "Vancouver", desc: "Padrão em medicina, farmácia e ciências biomédicas. Numeração automática." },
        { title: "MLA 9", desc: "Usado em letras, idiomas e humanidades. Formato automático." },
        { title: "Chicago 17", desc: "Para história e ciências humanas. Notas de rodapé incluídas." },
        { title: "Bases de dados acadêmicas", desc: "PubMed, Google Scholar, ScienceDirect, Scielo — todas as grandes bases de dados." },
        { title: "Revisão de literatura", desc: "Compare e sintetize automaticamente suas fontes para sua revisão sistemática." },
        { title: "Fichas de leitura", desc: "Gere fichas de leitura estruturadas a partir dos seus PDFs e artigos." },
        { title: "Equações de busca", desc: "Crie equações booleanas para PubMed, Scopus e Web of Science." },
        { title: "Exportação imediata", desc: "Copie em um clique no Word, Google Docs, LaTeX ou seu software de escrita." },
      ],
      whoTitle: "Para quem é o Academik?",
      who: [
        { title: "Estudantes", desc: "Graduação, Mestrado e Doutorado. Ideal para TCC, dissertações, teses e trabalhos universitários no Brasil, Portugal e países lusófonos.", tags: ["TCC", "Dissertação", "Tese", "Artigos"] },
        { title: "Pesquisadores", desc: "Professores, pesquisadores e pós-doutorandos. Acelere suas revisões de literatura e garanta a conformidade bibliográfica de suas publicações.", tags: ["Artigos", "Periódicos", "Congressos", "Projetos"] },
        { title: "Profissionais", desc: "Médicos, enfermeiros, assistentes sociais, consultores. Produza bibliografias profissionais para relatórios, formações e publicações internas.", tags: ["Relatórios", "Formações", "Protocolos", "Auditorias"] },
      ],
      faqTitle: "Perguntas frequentes",
      faq: {
        apa: [
          { q: "O que é a norma APA 7?", a: "A norma APA 7ª edição é o padrão de citação mais utilizado em ciências sociais, psicologia, educação e saúde. Define o formato das referências bibliográficas e das citações no texto." },
          { q: "Como gerar uma bibliografia APA automaticamente?", a: "Com o Academik, descreva seu tema de pesquisa. Nossa IA gera automaticamente a bibliografia em formato APA 7 com autores, anos, títulos, periódicos e DOI corretamente formatados." },
          { q: "O Academik é gratuito?", a: "O Academik funciona com um sistema de créditos. Você pode começar com um pacote Starter a partir de 4,99 € por 10 créditos. Sem assinatura mensal." },
          { q: "Qual é a diferença entre APA, Vancouver e MLA?", a: "APA é usado em ciências sociais e da saúde. Vancouver é o padrão em ciências médicas (numeração). MLA é usado em literatura e humanidades. O Academik gera os quatro formatos." },
          { q: "Posso usar o Academik para minha dissertação ou tese?", a: "Absolutamente. O Academik é projetado para estudantes de mestrado, doutorado e profissionais. Gera bibliografias conformes aos requisitos universitários." },
        ],
        vancouver: [
          { q: "O que é a norma Vancouver?", a: "A norma Vancouver é o sistema de citação padrão em medicina e ciências da saúde. As referências são numeradas na ordem de aparecimento no texto." },
          { q: "Como gero uma bibliografia Vancouver?", a: "Com o Academik, insira seu tema ou suas fontes. Nossa IA gera automaticamente a lista de referências em formato Vancouver com numeração correta." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura mensal." },
          { q: "Vancouver é diferente de APA?", a: "Sim. Vancouver usa numeração sequencial (padrão médico) enquanto APA usa o sistema autor-data (ciências sociais). O Academik gera ambos os formatos." },
          { q: "Posso usar para minha tese médica?", a: "Sim. O Academik é projetado para estudantes de medicina, enfermagem e outras ciências da saúde que precisam de bibliografias Vancouver." },
        ],
        mla: [
          { q: "O que é a norma MLA 9?", a: "A norma MLA 9ª edição é o padrão de citação usado em humanidades, literatura, linguística e artes em muitas universidades." },
          { q: "Como gero uma bibliografia MLA?", a: "Com o Academik, descreva seu tema. A IA gera automaticamente sua lista de obras citadas em formato MLA 9." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura." },
          { q: "MLA é diferente de APA?", a: "Sim. MLA usa o sistema autor-página enquanto APA usa autor-ano. MLA é padrão em humanidades, APA em ciências sociais." },
          { q: "Posso exportar minha bibliografia MLA?", a: "Sim. O Academik permite copiar sua bibliografia diretamente no Word, Google Docs ou qualquer processador de texto." },
        ],
        chicago: [
          { q: "O que é a norma Chicago 17?", a: "A norma Chicago 17ª edição oferece dois sistemas: notas e bibliografia (história e humanidades) e autor-data (ciências sociais)." },
          { q: "Como gero uma bibliografia Chicago?", a: "Com o Academik, descreva seu tema. A IA gera automaticamente sua bibliografia em formato Chicago 17." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura mensal." },
          { q: "Chicago é diferente de APA?", a: "Sim. Chicago usa notas de rodapé e bibliografia completa, enquanto APA usa citações no texto (autor, ano)." },
          { q: "Posso usar Chicago para minha tese de história?", a: "Absolutamente. O Academik gera bibliografias Chicago 17 conformes aos requisitos universitários para trabalhos de história e humanidades." },
        ],
        "literature-review": [
          { q: "O que é uma revisão de literatura?", a: "Uma revisão de literatura é uma análise crítica e sistemática das publicações científicas sobre um tema. É fundamental para qualquer trabalho acadêmico." },
          { q: "Como o Academik gera uma revisão de literatura?", a: "O Academik busca artigos em múltiplas bases de dados, analisa com IA e gera resumos, confrontações e sínteses temáticas estruturadas." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura." },
          { q: "Quais bases de dados o Academik usa?", a: "O Academik busca no PubMed, Google Scholar, ScienceDirect, Scopus, Scielo e outras bases de dados acadêmicas." },
          { q: "Posso usar para minha tese?", a: "Sim. O Academik é projetado especificamente para ajudar estudantes e pesquisadores na elaboração de seus trabalhos acadêmicos." },
        ],
        dissertation: [
          { q: "Como o Academik ajuda com minha tese ou dissertação?", a: "O Academik busca fontes acadêmicas relevantes, gera bibliografias no formato exigido (APA, Vancouver, MLA, Chicago) e cria sínteses literárias para seu referencial teórico." },
          { q: "Quais formatos de bibliografia suporta?", a: "APA 7, Vancouver, MLA 9 e Chicago 17 — os quatro formatos mais utilizados em universidades brasileiras, portuguesas e internacionais." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura mensal." },
          { q: "Quanto tempo o Academik economiza?", a: "Os usuários relatam economizar entre 5 e 15 horas na busca bibliográfica e formatação de referências para suas teses e dissertações." },
          { q: "Funciona para universidades brasileiras?", a: "Sim. O Academik gera bibliografias conformes às normas ABNT, APA, Vancouver e outras exigidas por universidades brasileiras e portuguesas." },
        ],
        students: [
          { q: "Para quais tipos de trabalhos serve o Academik?", a: "TCC (Trabalho de Conclusão de Curso), dissertações de mestrado, teses de doutorado, artigos, trabalhos de disciplinas. Qualquer trabalho acadêmico que exija bibliografia." },
          { q: "Quais formatos o Academik gera?", a: "APA 7, Vancouver, MLA 9 e Chicago 17 — todos os formatos principais exigidos por universidades brasileiras e portuguesas." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura." },
          { q: "Posso buscar fontes em português?", a: "Sim. O Academik busca em bases de dados brasileiras e internacionais: Scielo, Capes, PubMed, Google Scholar." },
          { q: "O Academik é difícil de usar?", a: "Não. O Academik é projetado para ser intuitivo. Insira seu tema, selecione o formato e obtenha sua bibliografia em segundos." },
        ],
        researchers: [
          { q: "O que o Academik oferece aos pesquisadores?", a: "Busca em múltiplas bases de dados, síntese de literatura, geração de bibliografias em todos os formatos padrão e equações de busca booleanas." },
          { q: "Quais bases de dados incluí?", a: "PubMed, Google Scholar, ScienceDirect, Scopus, Web of Science, Scielo e outras bases de dados acadêmicas internacionais." },
          { q: "O Academik é gratuito?", a: "O Academik usa créditos a partir de 4,99 €. Sem assinatura mensal." },
          { q: "Pode gerar equações de busca booleanas?", a: "Sim. O Academik gera equações de busca otimizadas para PubMed, Scopus e Web of Science." },
          { q: "É seguro para publicações acadêmicas?", a: "Sim. O Academik gera referências conformes aos padrões internacionais de publicação acadêmica." },
        ],
      },
      ctaTitle: { apa: "Pronto para gerar sua bibliografia APA?", vancouver: "Pronto para sua bibliografia Vancouver?", mla: "Pronto para sua bibliografia MLA?", chicago: "Pronto para sua bibliografia Chicago?", "literature-review": "Pronto para sua revisão de literatura?", dissertation: "Pronto para sua tese ou dissertação?", students: "Pronto para seu trabalho universitário?", researchers: "Pronto para sua revisão de literatura?" },
      ctaDesc: "Junte-se a mais de 12.000 estudantes e pesquisadores que usam o Academik para seus trabalhos acadêmicos.",
      ctaMainBtn: { apa: "Gerar minha bibliografia APA", vancouver: "Gerar minha bibliografia Vancouver", mla: "Gerar minha bibliografia MLA", chicago: "Gerar minha bibliografia Chicago", "literature-review": "Iniciar minha revisão de literatura", dissertation: "Começar minha tese", students: "Começar minha pesquisa", researchers: "Iniciar minha revisão" },
      ctaSub: "Sem assinatura · Pagamento seguro · Resultados imediatos",
      partnerText1: "Precisa de ajuda para", partnerBold: { apa: "redigir sua tese ou dissertação?", vancouver: "redigir seu trabalho médico?", mla: "redigir seu trabalho de humanidades?", chicago: "redigir seu trabalho de história?", "literature-review": "redigir sua revisão de literatura?", dissertation: "redigir sua tese ou dissertação?", students: "redigir seu TCC ou dissertação?", researchers: "redigir seu artigo?" }, partnerText2: " —",
      footerTagline: "Ferramenta de pesquisa bibliográfica IA", footerHome: "Início", footerLogin: "Entrar",
      metaTitle: {
        apa: "Gerador de Bibliografia APA 7 Online — Grátis | Academik",
        vancouver: "Gerador de Bibliografia Vancouver Online — Grátis | Academik",
        mla: "Gerador de Bibliografia MLA 9 Online — Grátis | Academik",
        chicago: "Gerador de Bibliografia Chicago 17 Online — Grátis | Academik",
        "literature-review": "Revisão de Literatura Acadêmica Online — IA | Academik",
        dissertation: "Ajuda para Tese e Dissertação Online — IA | Academik",
        students: "Academik para Estudantes — Pesquisa Bibliográfica IA",
        researchers: "Academik para Pesquisadores — Revisão de Literatura IA",
      },
      metaDesc: {
        apa: "Gere bibliografias APA 7 perfeitas em segundos. Ferramenta para estudantes e pesquisadores. Compatible com PubMed, Google Scholar, Scielo.",
        vancouver: "Gere bibliografias Vancouver automaticamente. Ideal para medicina e ciências da saúde. Compatible com PubMed e ScienceDirect.",
        mla: "Gere bibliografias MLA 9 automaticamente. Perfeito para humanidades e literatura. Ferramenta para universitários.",
        chicago: "Gere bibliografias Chicago 17 com notas de rodapé. Ideal para história e humanidades em universidades brasileiras.",
        "literature-review": "Gere revisões de literatura acadêmicas completas com IA. Busca no PubMed, Google Scholar, Scopus, Scielo.",
        dissertation: "Ajuda inteligente para sua tese ou dissertação. Bibliografia APA automática e síntese de literatura.",
        students: "A ferramenta de pesquisa bibliográfica para estudantes universitários. TCC, dissertação, tese. Bibliografias APA, Vancouver em segundos.",
        researchers: "Ferramenta de revisão de literatura para pesquisadores. Busca em bases de dados, síntese e bibliografias automáticas.",
      },
    },
  },
  {
    code: "de", htmlLang: "de", accentColor: "blue",
    slugs: { apa: "de/literaturverzeichnis-apa", vancouver: "de/literaturverzeichnis-vancouver", mla: "de/literaturverzeichnis-mla", chicago: "de/literaturverzeichnis-chicago", "literature-review": "de/literaturrecherche", dissertation: "de/dissertation-hilfe", students: "de/studenten", researchers: "de/wissenschaftler" },
    t: {
      badge: { apa: "APA 7. Auflage", vancouver: "Vancouver-Norm", mla: "MLA 9. Auflage", chicago: "Chicago 17. Auflage", "literature-review": "Literaturrecherche", dissertation: "Dissertation & Abschlussarbeit", students: "Für Studierende", researchers: "Für Wissenschaftler" },
      h1a: { apa: "Automatischer", vancouver: "Literaturverzeichnis", mla: "Literaturverzeichnis", chicago: "Literaturverzeichnis", "literature-review": "Automatische", dissertation: "Hilfe für Ihre", students: "Academik für", researchers: "Academik für" },
      h1b: { apa: "APA-Generator", vancouver: "Vancouver-Format", mla: "MLA-Format", chicago: "Chicago-Format", "literature-review": "Literaturrecherche", dissertation: "Dissertation & Abschlussarbeit", students: "Studierende", researchers: "Wissenschaftler" },
      heroDesc: {
        apa: "Erstellen Sie perfekt formatierte APA-7-Literaturverzeichnisse in Sekunden. Unsere KI durchsucht PubMed, Google Scholar und ScienceDirect und formatiert Ihre Referenzliste automatisch.",
        vancouver: "Erstellen Sie automatisch nummerierte Vancouver-Literaturverzeichnisse. Ideal für Medizin, Pharmazie und Biowissenschaften.",
        mla: "Erstellen Sie MLA-9-Literaturverzeichnisse automatisch. Perfekt für Geisteswissenschaften, Literatur und Linguistik.",
        chicago: "Erstellen Sie Chicago-17-Literaturverzeichnisse mit Fußnoten. Ideal für Geschichte und Geisteswissenschaften.",
        "literature-review": "Suchen Sie wissenschaftliche Artikel, analysieren und synthetisieren Sie Ihre Quellen. Unsere KI erstellt vollständige Literaturreviews in Minuten.",
        dissertation: "Intelligente Hilfe für Ihre Dissertation oder Abschlussarbeit. Quellensuche, automatisches APA-Literaturverzeichnis und Literatursynthese.",
        students: "Das bibliografische Recherchewerkzeug für Studierende. Quellen finden, Literaturverzeichnisse erstellen und Referenzen analysieren.",
        researchers: "Beschleunigen Sie Ihre Literaturrecherchen. Leistungsstarke KI für Artikelsuche, Synthese und Literaturverzeichniserstellung.",
      },
      heroCountries: "Genutzt von Studierenden und Wissenschaftlern in Deutschland, Österreich, der Schweiz und weltweit.",
      ctaBtn: "Kostenlos starten", ctaSecondary: "Alle Funktionen ansehen",
      checkFrom: "Ab 4,99 €", checkNoSub: "Kein Abonnement", checkSpeed: "Ergebnisse in Sekunden",
      statStudents: "12.000+", statBibs: "85.000+", statRating: "4,8/5", statTime: "< 10 Sek.",
      statStudentsLabel: "Studierende & Wissenschaftler", statBibsLabel: "Literaturverzeichnisse erstellt", statRatingLabel: "Durchschnittliche Bewertung", statTimeLabel: "Erstellungszeit",
      whatTitle: { apa: "Was ist die APA-7-Norm?", vancouver: "Was ist die Vancouver-Norm?", mla: "Was ist die MLA-9-Norm?", chicago: "Was ist die Chicago-17-Norm?", "literature-review": "Was ist eine Literaturrecherche?", dissertation: "Wie erstelle ich eine Dissertation?", students: "Bibliografische Recherche für Studierende", researchers: "Recherchewerkzeug für Wissenschaftler" },
      whatP1: {
        apa: "Die APA-Norm (American Psychological Association) 7. Auflage ist der am häufigsten verwendete Zitierstil in Sozialwissenschaften, Psychologie, Bildung und Gesundheitswissenschaften.",
        vancouver: "Die Vancouver-Norm ist der Zitierstil in der Medizin, Pharmazie und den Biowissenschaften. Sie zeichnet sich durch die sequenzielle Nummerierung der Referenzen aus.",
        mla: "Die MLA-Norm (Modern Language Association) 9. Auflage ist der Zitierstil in Geisteswissenschaften, Literatur, Linguistik und Kunst.",
        chicago: "Die Chicago-Norm 17. Auflage bietet zwei Systeme: Anmerkungen und Bibliografie (Geschichte und Geisteswissenschaften) und Autor-Jahr (Sozialwissenschaften).",
        "literature-review": "Eine systematische Literaturrecherche ist eine erschöpfende und kritische Analyse der wissenschaftlichen Publikationen zu einem bestimmten Thema.",
        dissertation: "Eine Dissertation oder Abschlussarbeit ist die wissenschaftliche Abschlussarbeit, die ein Studium auf Bachelor-, Master- oder Doktorebene abschließt.",
        students: "Academik wurde speziell für Studierende entwickelt, die wissenschaftliche Arbeiten mit korrekten Literaturangaben erstellen müssen.",
        researchers: "Academik bietet Wissenschaftlern und Akademikern die notwendigen Werkzeuge für umfassende Literaturrecherchen.",
      },
      whatP2: {
        apa: "Es definiert genau, wie wissenschaftliche Artikel, Bücher, Websites, Dissertationen und andere Quellen zitiert werden. Ein korrektes APA-Literaturverzeichnis ist für Bachelor-, Master- und Doktorarbeiten unerlässlich.",
        vancouver: "Jede Referenz erhält eine Nummer in der Reihenfolge, in der sie im Text erscheint. Dieses System ist in medizinischen Fachzeitschriften obligatorisch.",
        mla: "Es definiert das Format der Einträge im Literaturverzeichnis und der Zitate im Text. Es ist der Standard an den meisten Universitäten in den Geisteswissenschaften.",
        chicago: "Es ist das bevorzugte System in akademischen Publikationen der Geschichte, Philosophie und Geisteswissenschaften an deutschen, österreichischen und schweizerischen Universitäten.",
        "literature-review": "Sie ist grundlegend, um den Stand der Forschung zu identifizieren, Wissenslücken zu erkennen und eine originelle Forschung zu kontextualisieren.",
        dissertation: "Sie erfordert eine rigorose Literaturrecherche, eine klare Methodik und ein perfekt formatiertes Literaturverzeichnis im von Ihrer Einrichtung geforderten Stil.",
        students: "Mit Academik wird die Suche nach akademischen Quellen, die Erstellung von Literaturverzeichnissen und die Analyse von Artikeln zu einem schnellen und einfachen Prozess.",
        researchers: "Reduzieren Sie den Zeitaufwand für die Literaturrecherche und erstellen Sie strukturierte Literaturreviews mit Hilfe von GPT-4o.",
      },
      whatP3: "Academik erstellt Ihre Referenzen automatisch im richtigen Format und integriert die neuesten Normen für digitale Quellen, DOIs und URLs.",
      exampleLabel1: { apa: "APA-7-Beispiel — Zeitschriftenartikel", vancouver: "Vancouver-Beispiel — Artikel", mla: "MLA-9-Beispiel — Artikel", chicago: "Chicago-Beispiel — Fußnote", "literature-review": "Beispiel — Thematische Synthese", dissertation: "Beispiel — Dissertationsreferenz", students: "Beispiel — APA-Referenz", researchers: "Beispiel — Artikelreferenz" },
      exampleLabel2: { apa: "APA-7-Beispiel — Buch", vancouver: "Vancouver-Beispiel — Buch", mla: "MLA-9-Beispiel — Buch", chicago: "Chicago-Beispiel — Bibliografie", "literature-review": "Beispiel — Konfrontation", dissertation: "Beispiel — Buchreferenz", students: "Beispiel — Vancouver", researchers: "Beispiel — Vancouver" },
      exampleLabel3: { apa: "APA-7-Beispiel — Website", vancouver: "Vancouver-Beispiel — Web", mla: "MLA-9-Beispiel — Web", chicago: "Chicago-Beispiel — Web", "literature-review": "Beispiel — Mapping", dissertation: "Beispiel — Webreferenz", students: "Beispiel — MLA", researchers: "Beispiel — Chicago" },
      example1: {
        apa: "Müller, J., &amp; Schmidt, M. (2023). Der Einfluss der KI auf die akademische Forschung. <em>Zeitschrift für Sozialwissenschaften, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx",
        vancouver: "Müller J, Schmidt M. Der Einfluss der KI auf die akademische Forschung. Z Sozialwiss. 2023;45(2):112-34.",
        mla: 'Müller, Johann, und Maria Schmidt. "Der Einfluss der KI auf die akademische Forschung." <em>Zeitschrift für Sozialwissenschaften</em>, Jg. 45, Nr. 2, 2023, S. 112-134.',
        chicago: "1. Johann Müller und Maria Schmidt, \"Der Einfluss der KI,\" <em>Zeitschrift für Sozialwissenschaften</em> 45, Nr. 2 (2023): 112–134.",
        "literature-review": "Synthese: Die analysierten Studien stimmen überein, dass KI die Effizienz der akademischen Forschung deutlich verbessert (Müller, 2023; Schmidt, 2022).",
        dissertation: "Müller, J., &amp; Schmidt, M. (2023). <em>Methodik der akademischen Forschung</em>. Universitätsverlag.",
        students: "Müller, J., &amp; Schmidt, M. (2023). Akademische Forschung mit KI. <em>Zeitschrift, 45</em>(2), 112–134.",
        researchers: "Müller, J., et al. (2023). Systematischer Review über KI in der Forschung. <em>Fachzeitschrift, 45</em>(2), 112–134.",
      },
      example2: {
        apa: "Weber, A. (2022). <em>Forschungsmethodik in den Sozialwissenschaften</em> (3. Aufl.). Universitätsverlag.",
        vancouver: "Weber A. Forschungsmethodik. 3. Aufl. Berlin: Universitätsverlag; 2022.",
        mla: "Weber, Anna. <em>Forschungsmethodik in den Sozialwissenschaften</em>. 3. Aufl., Universitätsverlag, 2022.",
        chicago: "Weber, Anna. <em>Forschungsmethodik in den Sozialwissenschaften</em>. 3. Aufl. Berlin: Universitätsverlag, 2022.",
        "literature-review": "Konfrontation: Müller (2023) behauptet, KI beschleunige die Literaturrecherche, während Schmidt (2022) Grenzen in geisteswissenschaftlichen Kontexten aufzeigt.",
        dissertation: "Weber, A. (2022). <em>Forschungsmethodik</em>. Universitätsverlag.",
        students: "Weber, A. (2022). Sozialforschung. 3. Aufl. Universitätsverlag.",
        researchers: "Weber, A. (2022). <em>Fortgeschrittene Methodik</em>. 3. Aufl. Akademischer Verlag.",
      },
      example3: {
        apa: "Weltgesundheitsorganisation. (2023, 15. März). <em>Leitfaden für psychische Gesundheit</em>. https://www.who.int/de/mental-health",
        vancouver: "WHO. Leitfaden für psychische Gesundheit [Internet]. 2023 [zitiert 2024]. Verfügbar unter: https://www.who.int",
        mla: "Weltgesundheitsorganisation. \"Leitfaden für psychische Gesundheit.\" <em>WHO</em>, 15. März 2023, www.who.int/de.",
        chicago: "Weltgesundheitsorganisation. \"Leitfaden für psychische Gesundheit.\" Abgerufen am 15. März 2023. https://www.who.int.",
        "literature-review": "Thematisches Mapping: Thema 1 — KI und Effizienz; Thema 2 — Ethische Grenzen; Thema 3 — Anwendungen im Gesundheitswesen.",
        dissertation: "WHO. (2023). <em>Präventionsleitfaden</em>. https://www.who.int/de",
        students: "WHO. (2023). Gesundheitsleitfaden. https://www.who.int/de",
        researchers: "WHO. (2023). <em>Methodischer Leitfaden</em>. https://www.who.int/de",
      },
      howTitle: "Wie funktioniert es?", howSubtitle: { apa: "In 3 einfachen Schritten erhalten Sie ein vollständiges APA-7-Literaturverzeichnis, das Sie in Ihre Arbeit einfügen können.", vancouver: "In 3 Schritten erhalten Sie nummerierte und korrekt formatierte Vancouver-Referenzen.", mla: "In 3 Schritten erhalten Sie Ihr fertig formatiertes MLA-Literaturverzeichnis.", chicago: "In 3 Schritten erstellen Sie Ihr vollständiges Chicago-Literaturverzeichnis.", "literature-review": "In 3 Schritten erstellen Sie einen vollständigen akademischen Literaturreview.", dissertation: "In 3 Schritten finden Sie Quellen und erstellen Ihr Literaturverzeichnis.", students: "In 3 Schritten schließen Sie Ihre bibliografische Recherche ab.", researchers: "In 3 Schritten beschleunigen Sie Ihre Literaturrecherche." },
      step1Title: "Beschreiben Sie Ihr Thema", step1Desc: "Geben Sie Ihr Forschungsthema oder Schlüsselwörter ein. Academik sucht in PubMed, Google Scholar, ScienceDirect und anderen Datenbanken.",
      step2Title: "KI wählt aus und analysiert", step2Desc: "Unsere von GPT-4o angetriebene KI wählt qualitativ hochwertige akademische Quellen aus, extrahiert Metadaten und überprüft ihre Relevanz.",
      step3Title: { apa: "APA-Literaturverzeichnis erstellt", vancouver: "Vancouver-Referenzen bereit", mla: "MLA-Literaturverzeichnis bereit", chicago: "Chicago-Literaturverzeichnis bereit", "literature-review": "Literaturreview vollständig", dissertation: "Literaturverzeichnis und Synthese bereit", students: "Referenzen bereit", researchers: "Review vollständig" },
      step3Desc: { apa: "In Sekunden ist Ihr APA-7-Literaturverzeichnis formatiert und einsatzbereit. Kopieren Sie es direkt in Word, Google Docs oder Ihre Schreibsoftware.", vancouver: "Ihre Vancouver-Referenzen sind nummeriert und formatiert. Kopieren Sie sie in Ihren Artikel oder Ihre medizinische Dissertation.", mla: "Ihr MLA-Literaturverzeichnis ist fertig. Kopieren Sie es in Ihre geisteswissenschaftliche Arbeit.", chicago: "Ihr Chicago-Literaturverzeichnis ist vollständig. Bereit zum Einfügen in Ihre Geschichts- oder Geisteswissenschaftsarbeit.", "literature-review": "Ihr Literaturreview ist mit Zusammenfassungen, Konfrontationen und thematischen Synthesen strukturiert.", dissertation: "Ihr Literaturverzeichnis ist formatiert und Ihre Synthese bereit für Ihre Dissertation.", students: "Ihre Referenzen sind bereit. Kopieren Sie sie in Ihre Bachelor- oder Masterarbeit.", researchers: "Ihr Review ist vollständig mit Synthese, Konfrontation und formatiertem Literaturverzeichnis." },
      featuresTitle: "Alles, was Sie brauchen", featuresSubtitle: "Über das Literaturverzeichnis hinaus deckt Academik alle Ihre Recherchebedarfe ab.",
      features: [
        { title: "APA 7. Auflage", desc: "Neuestes Format, kompatibel mit allen deutschen, österreichischen, schweizerischen und internationalen Universitäten." },
        { title: "Vancouver", desc: "Standard in Medizin, Pharmazie und Biowissenschaften. Automatische Nummerierung." },
        { title: "MLA 9", desc: "Verwendet in Literatur, Sprachen und Geisteswissenschaften. Automatische Formatierung." },
        { title: "Chicago 17", desc: "Für Geschichte und Geisteswissenschaften. Fußnoten inklusive." },
        { title: "Akademische Datenbanken", desc: "PubMed, Google Scholar, ScienceDirect, Web of Science — alle großen Datenbanken." },
        { title: "Literaturrecherche", desc: "Vergleichen und synthetisieren Sie Ihre Quellen automatisch für Ihren systematischen Review." },
        { title: "Lesenotizen", desc: "Erstellen Sie strukturierte Lesenotizen aus Ihren PDFs und Artikeln." },
        { title: "Suchgleichungen", desc: "Erstellen Sie Boolesche Suchgleichungen für PubMed, Scopus und Web of Science." },
        { title: "Sofortexport", desc: "Ein-Klick-Kopie in Word, Google Docs, LaTeX oder Ihre Schreibsoftware." },
      ],
      whoTitle: "Für wen ist Academik?",
      who: [
        { title: "Studierende", desc: "Bachelor, Master und Doktorat. Ideal für Abschlussarbeiten, Dissertationen und Seminararbeiten in Deutschland, Österreich und der Schweiz.", tags: ["Bachelorarbeit", "Masterarbeit", "Dissertation", "Seminararbeit"] },
        { title: "Wissenschaftler", desc: "Professoren, Forscher und Postdoktoranden. Beschleunigen Sie Ihre Literaturrecherchen und stellen Sie die bibliografische Konformität Ihrer Publikationen sicher.", tags: ["Artikel", "Zeitschriften", "Konferenzen", "Projekte"] },
        { title: "Fachleute", desc: "Ärzte, Pflegefachkräfte, Sozialarbeiter, Berater. Erstellen Sie professionelle Literaturverzeichnisse für Berichte, Schulungen und interne Publikationen.", tags: ["Berichte", "Schulungen", "Protokolle", "Audits"] },
      ],
      faqTitle: "Häufig gestellte Fragen",
      faq: {
        apa: [
          { q: "Was ist die APA-7-Norm?", a: "Die APA 7. Auflage ist der am häufigsten verwendete Zitierstil in Sozialwissenschaften, Psychologie, Bildung und Gesundheitswissenschaften. Sie definiert das Format der Literaturangaben und der Zitate im Text." },
          { q: "Wie erstelle ich automatisch ein APA-Literaturverzeichnis?", a: "Mit Academik beschreiben Sie Ihr Forschungsthema. Unsere KI erstellt automatisch das Literaturverzeichnis im APA-7-Format mit Autoren, Jahren, Titeln, Zeitschriften und DOIs korrekt formatiert." },
          { q: "Ist Academik kostenlos?", a: "Academik funktioniert mit einem Kreditsystem. Sie können mit einem Starter-Paket ab 4,99 € für 10 Kredits beginnen. Kein monatliches Abonnement." },
          { q: "Was ist der Unterschied zwischen APA, Vancouver und MLA?", a: "APA wird in Sozial- und Gesundheitswissenschaften verwendet. Vancouver ist der Standard in der Medizin (Nummerierung). MLA wird in Literatur und Geisteswissenschaften verwendet. Academik erstellt alle vier Formate." },
          { q: "Kann ich Academik für meine Abschlussarbeit oder Dissertation verwenden?", a: "Absolut. Academik ist für Master- und Doktorandenstudierende sowie professionelle Forscher konzipiert. Es erstellt universitätskonforme Literaturverzeichnisse in APA 7, Vancouver, MLA und Chicago." },
        ],
        vancouver: [
          { q: "Was ist die Vancouver-Norm?", a: "Die Vancouver-Norm ist das Standard-Zitiersystem in der Medizin und den Gesundheitswissenschaften. Referenzen werden in der Reihenfolge ihres Erscheinens im Text nummeriert." },
          { q: "Wie erstelle ich ein Vancouver-Literaturverzeichnis?", a: "Mit Academik geben Sie Ihr Thema oder Ihre Quellen ein. Unsere KI erstellt automatisch die Referenzliste im Vancouver-Format mit korrekter Nummerierung." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein monatliches Abonnement." },
          { q: "Unterscheidet sich Vancouver von APA?", a: "Ja. Vancouver verwendet sequentielle Nummerierung (medizinischer Standard), während APA das Autor-Jahr-System verwendet (Sozialwissenschaften). Academik erstellt beide Formate." },
          { q: "Kann ich es für meine medizinische Dissertation verwenden?", a: "Ja. Academik ist für Studierende der Medizin, Pflege und anderen Gesundheitswissenschaften konzipiert, die Vancouver-Literaturverzeichnisse benötigen." },
        ],
        mla: [
          { q: "Was ist die MLA-9-Norm?", a: "Die MLA-Norm 9. Auflage ist der Zitierstil in Geisteswissenschaften, Literatur, Linguistik und Kunst." },
          { q: "Wie erstelle ich ein MLA-Literaturverzeichnis?", a: "Mit Academik beschreiben Sie Ihr Thema. Die KI erstellt automatisch Ihre Werkliste im MLA-9-Format." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein Abonnement." },
          { q: "Unterscheidet sich MLA von APA?", a: "Ja. MLA verwendet das Autor-Seiten-System, während APA Autor-Jahr verwendet. MLA ist Standard in den Geisteswissenschaften, APA in den Sozialwissenschaften." },
          { q: "Kann ich mein MLA-Literaturverzeichnis exportieren?", a: "Ja. Academik ermöglicht es, Ihr Literaturverzeichnis direkt in Word, Google Docs oder jede Textverarbeitungssoftware zu kopieren." },
        ],
        chicago: [
          { q: "Was ist die Chicago-17-Norm?", a: "Die Chicago-Norm 17. Auflage bietet zwei Systeme: Anmerkungen und Bibliografie (Geschichte und Geisteswissenschaften) und Autor-Jahr (Sozialwissenschaften)." },
          { q: "Wie erstelle ich ein Chicago-Literaturverzeichnis?", a: "Mit Academik beschreiben Sie Ihr Thema. Die KI erstellt automatisch Ihr Literaturverzeichnis im Chicago-17-Format." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein monatliches Abonnement." },
          { q: "Unterscheidet sich Chicago von APA?", a: "Ja. Chicago verwendet Fußnoten und vollständige Bibliografie, während APA Zitate im Text verwendet (Autor, Jahr)." },
          { q: "Kann ich Chicago für meine Geschichtsdissertation verwenden?", a: "Absolut. Academik erstellt Chicago-17-Literaturverzeichnisse, die den Universitätsanforderungen für Geschichts- und Geisteswissenschaftsarbeiten entsprechen." },
        ],
        "literature-review": [
          { q: "Was ist eine Literaturrecherche?", a: "Eine Literaturrecherche ist eine kritische und systematische Analyse der wissenschaftlichen Publikationen zu einem Thema. Sie ist für jede akademische Arbeit unerlässlich." },
          { q: "Wie erstellt Academik eine Literaturrecherche?", a: "Academik sucht Artikel in mehreren Datenbanken, analysiert sie mit KI und erstellt strukturierte Zusammenfassungen, Konfrontationen und thematische Synthesen." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein Abonnement." },
          { q: "Welche Datenbanken verwendet Academik?", a: "Academik sucht in PubMed, Google Scholar, ScienceDirect, Scopus und anderen internationalen akademischen Datenbanken." },
          { q: "Kann ich es für meine Dissertation verwenden?", a: "Ja. Academik ist speziell dafür konzipiert, Studierenden und Wissenschaftlern bei der Erstellung ihrer akademischen Arbeiten zu helfen." },
        ],
        dissertation: [
          { q: "Wie hilft Academik bei meiner Dissertation oder Abschlussarbeit?", a: "Academik sucht relevante akademische Quellen, erstellt Literaturverzeichnisse im geforderten Format (APA, Vancouver, MLA, Chicago) und erstellt Literatursynthesen für Ihren theoretischen Rahmen." },
          { q: "Welche Literaturverzeichnisformate werden unterstützt?", a: "APA 7, Vancouver, MLA 9 und Chicago 17 — die vier am häufigsten verwendeten Formate an deutschen, österreichischen und schweizerischen Universitäten." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein monatliches Abonnement." },
          { q: "Wie viel Zeit spart Academik?", a: "Nutzer berichten von 5 bis 15 Stunden Ersparnis bei der Literaturrecherche und Formatierung für ihre Dissertationen und Abschlussarbeiten." },
          { q: "Funktioniert es für deutsche, österreichische und schweizerische Universitäten?", a: "Ja. Academik erstellt Literaturverzeichnisse, die den Anforderungen aller deutschen, österreichischen und schweizerischen Universitäten entsprechen." },
        ],
        students: [
          { q: "Für welche Arbeitstypen ist Academik geeignet?", a: "Bachelor- und Masterarbeiten, Dissertationen, Seminararbeiten, Referate. Jede akademische Arbeit, die ein Literaturverzeichnis erfordert." },
          { q: "Welche Formate erstellt Academik?", a: "APA 7, Vancouver, MLA 9 und Chicago 17 — alle wichtigen Formate, die von deutschen, österreichischen und schweizerischen Universitäten verlangt werden." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein Abonnement." },
          { q: "Kann ich deutschsprachige Quellen suchen?", a: "Ja. Academik sucht in deutschen und internationalen Datenbanken: PubMed, Google Scholar, ScienceDirect." },
          { q: "Ist Academik schwer zu benutzen?", a: "Nein. Academik ist für Benutzerfreundlichkeit konzipiert. Geben Sie Ihr Thema ein, wählen Sie das Format und erhalten Sie Ihr Literaturverzeichnis in Sekunden." },
        ],
        researchers: [
          { q: "Was bietet Academik Wissenschaftlern?", a: "Suche in mehreren Datenbanken, Literatursynthese, Erstellung von Literaturverzeichnissen in allen Standardformaten und Boolesche Suchgleichungen." },
          { q: "Welche Datenbanken sind enthalten?", a: "PubMed, Google Scholar, ScienceDirect, Scopus, Web of Science und andere internationale akademische Datenbanken." },
          { q: "Ist Academik kostenlos?", a: "Academik verwendet Kredits ab 4,99 €. Kein monatliches Abonnement." },
          { q: "Kann es Boolesche Suchgleichungen erstellen?", a: "Ja. Academik erstellt optimierte Suchgleichungen für PubMed, Scopus und Web of Science." },
          { q: "Ist es sicher für akademische Publikationen?", a: "Ja. Academik erstellt Referenzen, die den internationalen Standards akademischer Publikationen entsprechen." },
        ],
      },
      ctaTitle: { apa: "Bereit, Ihr APA-Literaturverzeichnis zu erstellen?", vancouver: "Bereit für Ihr Vancouver-Literaturverzeichnis?", mla: "Bereit für Ihr MLA-Literaturverzeichnis?", chicago: "Bereit für Ihr Chicago-Literaturverzeichnis?", "literature-review": "Bereit für Ihre Literaturrecherche?", dissertation: "Bereit für Ihre Dissertation?", students: "Bereit für Ihre Abschlussarbeit?", researchers: "Bereit für Ihre Literaturrecherche?" },
      ctaDesc: "Schließen Sie sich mehr als 12.000 Studierenden und Wissenschaftlern an, die Academik für ihre akademischen Arbeiten nutzen.",
      ctaMainBtn: { apa: "Mein APA-Literaturverzeichnis erstellen", vancouver: "Mein Vancouver-Literaturverzeichnis erstellen", mla: "Mein MLA-Literaturverzeichnis erstellen", chicago: "Mein Chicago-Literaturverzeichnis erstellen", "literature-review": "Meine Literaturrecherche starten", dissertation: "Meine Dissertation beginnen", students: "Meine Recherche beginnen", researchers: "Meinen Review starten" },
      ctaSub: "Kein Abonnement · Sichere Zahlung · Sofortige Ergebnisse",
      partnerText1: "Benötigen Sie Hilfe beim", partnerBold: { apa: "Schreiben Ihrer Dissertation?", vancouver: "Schreiben Ihrer medizinischen Arbeit?", mla: "Schreiben Ihrer geisteswissenschaftlichen Arbeit?", chicago: "Schreiben Ihrer Geschichtsarbeit?", "literature-review": "Schreiben Ihres Literaturreviews?", dissertation: "Schreiben Ihrer Dissertation?", students: "Schreiben Ihrer Abschlussarbeit?", researchers: "Schreiben Ihres Artikels?" }, partnerText2: " —",
      footerTagline: "KI-gestütztes bibliografisches Recherchewerkzeug", footerHome: "Startseite", footerLogin: "Anmelden",
      metaTitle: {
        apa: "APA-7-Literaturverzeichnis-Generator Online — Kostenlos | Academik",
        vancouver: "Vancouver-Literaturverzeichnis-Generator Online — Kostenlos | Academik",
        mla: "MLA-9-Literaturverzeichnis-Generator Online — Kostenlos | Academik",
        chicago: "Chicago-17-Literaturverzeichnis-Generator Online — Kostenlos | Academik",
        "literature-review": "Akademische Literaturrecherche Online — KI | Academik",
        dissertation: "Hilfe für Dissertation & Abschlussarbeit Online — KI | Academik",
        students: "Academik für Studierende — Bibliografische Recherche KI",
        researchers: "Academik für Wissenschaftler — Literaturrecherche KI",
      },
      metaDesc: {
        apa: "Erstellen Sie perfekte APA-7-Literaturverzeichnisse in Sekunden. Kostenlos für Studierende und Wissenschaftler. Kompatibel mit PubMed, Google Scholar, ScienceDirect.",
        vancouver: "Erstellen Sie Vancouver-Literaturverzeichnisse automatisch. Ideal für Medizin und Gesundheitswissenschaften.",
        mla: "Erstellen Sie MLA-9-Literaturverzeichnisse automatisch. Perfekt für Geisteswissenschaften und Literatur.",
        chicago: "Erstellen Sie Chicago-17-Literaturverzeichnisse mit Fußnoten. Ideal für Geschichte und Geisteswissenschaften.",
        "literature-review": "Erstellen Sie vollständige akademische Literaturreviews mit KI. Suche in PubMed, Google Scholar, Scopus.",
        dissertation: "Intelligente Hilfe für Ihre Dissertation oder Abschlussarbeit. Automatisches APA-Literaturverzeichnis.",
        students: "Das bibliografische Recherchewerkzeug für Studierende. Bachelor-, Masterarbeiten, Dissertationen. APA, Vancouver in Sekunden.",
        researchers: "Literaturrecherchewerkzeug für Wissenschaftler. Datenbanksuche, Synthese und automatische Literaturverzeichnisse.",
      },
    },
  },
  {
    code: "it", htmlLang: "it", accentColor: "teal",
    slugs: { apa: "it/generatore-bibliografia-apa", vancouver: "it/bibliografia-vancouver", mla: "it/bibliografia-mla", chicago: "it/bibliografia-chicago", "literature-review": "it/revisione-letteratura", dissertation: "it/tesi-dissertazione", students: "it/studenti", researchers: "it/ricercatori" },
    t: {
      badge: { apa: "Norma APA 7a edizione", vancouver: "Norma Vancouver", mla: "Norma MLA 9", chicago: "Norma Chicago 17", "literature-review": "Revisione della letteratura", dissertation: "Tesi e dissertazione", students: "Per studenti", researchers: "Per ricercatori" },
      h1a: { apa: "Generatore di", vancouver: "Bibliografia", mla: "Bibliografia", chicago: "Bibliografia", "literature-review": "Revisione della", dissertation: "Aiuto per la", students: "Academik per", researchers: "Academik per" },
      h1b: { apa: "Bibliografia APA", vancouver: "Vancouver online", mla: "MLA automatica", chicago: "Chicago online", "literature-review": "Letteratura online", dissertation: "Tesi e Dissertazione", students: "Studenti", researchers: "Ricercatori" },
      heroDesc: {
        apa: "Genera bibliografie in formato APA 7 perfettamente formattate in pochi secondi. La nostra IA cerca su PubMed, Google Scholar e ScienceDirect e formatta automaticamente la tua lista di riferimenti.",
        vancouver: "Crea bibliografie Vancouver numerate automaticamente. Ideale per medicina, farmacia e scienze biomediche.",
        mla: "Genera bibliografie MLA 9 automaticamente. Perfetto per scienze umane, letteratura e linguistica.",
        chicago: "Genera bibliografie Chicago 17 con note a piè di pagina. Ideale per storia e scienze umane.",
        "literature-review": "Cerca articoli accademici, analizza e sintetizza le tue fonti. La nostra IA genera revisioni della letteratura complete in pochi minuti.",
        dissertation: "Aiuto intelligente per la tua tesi o dissertazione. Ricerca di fonti, bibliografia APA automatica e sintesi letteraria.",
        students: "Lo strumento di ricerca bibliografica per universitari. Trova fonti, genera bibliografie e analizza i riferimenti in un clic.",
        researchers: "Accelera le tue revisioni della letteratura. IA potente per la ricerca di articoli, sintesi e generazione di bibliografie.",
      },
      heroCountries: "Utilizzato da studenti e ricercatori in Italia, Svizzera, Belgio e paesi italofoni.",
      ctaBtn: "Inizia gratis", ctaSecondary: "Vedere tutte le funzionalità",
      checkFrom: "Da 4,99 €", checkNoSub: "Senza abbonamento", checkSpeed: "Risultati in secondi",
      statStudents: "12.000+", statBibs: "85.000+", statRating: "4,8/5", statTime: "< 10 sec",
      statStudentsLabel: "Studenti e ricercatori", statBibsLabel: "Bibliografie generate", statRatingLabel: "Valutazione media", statTimeLabel: "Tempo di generazione",
      whatTitle: { apa: "Cos'è la norma APA 7?", vancouver: "Cos'è la norma Vancouver?", mla: "Cos'è la norma MLA 9?", chicago: "Cos'è la norma Chicago 17?", "literature-review": "Cos'è una revisione della letteratura?", dissertation: "Come fare una tesi o dissertazione?", students: "Ricerca bibliografica per universitari", researchers: "Strumento di ricerca per accademici" },
      whatP1: {
        apa: "La norma APA (American Psychological Association) 7a edizione è lo standard di citazione più utilizzato in scienze sociali, psicologia, educazione e scienze della salute.",
        vancouver: "La norma Vancouver è lo standard di citazione utilizzato in medicina, farmacia e scienze biomediche. Si caratterizza per la numerazione sequenziale dei riferimenti.",
        mla: "La norma MLA (Modern Language Association) 9a edizione è lo standard di citazione usato in scienze umane, letteratura, linguistica e arti.",
        chicago: "La norma Chicago 17a edizione offre due sistemi: note e bibliografia (storia e scienze umane) e autore-data (scienze sociali).",
        "literature-review": "Una revisione della letteratura sistematica è un'analisi esaustiva e critica delle pubblicazioni scientifiche su un determinato argomento.",
        dissertation: "La tesi o dissertazione è il lavoro di ricerca accademica che conclude gli studi universitari di laurea, magistrale o dottorato.",
        students: "Academik è progettato specificamente per gli studenti universitari che devono realizzare lavori accademici con riferimenti bibliografici corretti.",
        researchers: "Academik fornisce a ricercatori e accademici gli strumenti necessari per condurre revisioni della letteratura esaustive.",
      },
      whatP2: {
        apa: "Definisce con precisione come citare articoli scientifici, libri, siti web, tesi e altre fonti. Una bibliografia APA corretta è essenziale per validare una tesi triennale, magistrale o di dottorato.",
        vancouver: "Ogni riferimento riceve un numero nell'ordine in cui appare nel testo. Questo sistema è obbligatorio nelle riviste mediche di primo livello.",
        mla: "Definisce il formato delle voci nell'elenco delle opere citate e delle citazioni nel testo. È lo standard richiesto dalla maggior parte delle università in lettere e scienze umane.",
        chicago: "È il sistema preferito nelle pubblicazioni accademiche di storia, filosofia e scienze umane in molte università italiane e svizzere.",
        "literature-review": "È fondamentale per identificare lo stato dell'arte, rilevare lacune di conoscenza e contestualizzare una ricerca originale.",
        dissertation: "Richiede una revisione della letteratura rigorosa, una metodologia chiara e una bibliografia perfettamente formattata nello stile richiesto dalla tua istituzione.",
        students: "Con Academik, cercare fonti accademiche, generare bibliografie e analizzare articoli diventa un processo rapido e semplice.",
        researchers: "Riduci il tempo di ricerca bibliografica e genera revisioni della letteratura strutturate con l'aiuto di GPT-4o.",
      },
      whatP3: "Academik genera automaticamente i tuoi riferimenti nel formato corretto, integrando le ultime norme per le fonti digitali, DOI e URL.",
      exampleLabel1: { apa: "Esempio APA 7 — Articolo di rivista", vancouver: "Esempio Vancouver — Articolo", mla: "Esempio MLA 9 — Articolo", chicago: "Esempio Chicago — Nota a piè di pagina", "literature-review": "Esempio — Sintesi tematica", dissertation: "Esempio — Riferimento tesi", students: "Esempio — Riferimento APA", researchers: "Esempio — Riferimento articolo" },
      exampleLabel2: { apa: "Esempio APA 7 — Libro", vancouver: "Esempio Vancouver — Libro", mla: "Esempio MLA 9 — Libro", chicago: "Esempio Chicago — Bibliografia", "literature-review": "Esempio — Confronto", dissertation: "Esempio — Riferimento libro", students: "Esempio — Vancouver", researchers: "Esempio — Vancouver" },
      exampleLabel3: { apa: "Esempio APA 7 — Sito web", vancouver: "Esempio Vancouver — Web", mla: "Esempio MLA 9 — Web", chicago: "Esempio Chicago — Web", "literature-review": "Esempio — Mappatura", dissertation: "Esempio — Riferimento web", students: "Esempio — MLA", researchers: "Esempio — Chicago" },
      example1: {
        apa: "Rossi, M., &amp; Bianchi, L. (2023). L'impatto dell'IA sulla ricerca accademica. <em>Rivista di Scienze Sociali, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx",
        vancouver: "Rossi M, Bianchi L. L'impatto dell'IA sulla ricerca accademica. Riv Sci Soc. 2023;45(2):112-34.",
        mla: 'Rossi, Mario, e Laura Bianchi. "L\'impatto dell\'IA sulla ricerca accademica." <em>Rivista di Scienze Sociali</em>, vol. 45, n. 2, 2023, pp. 112-134.',
        chicago: "1. Mario Rossi e Laura Bianchi, \"L'impatto dell'IA,\" <em>Rivista di Scienze Sociali</em> 45, n. 2 (2023): 112–134.",
        "literature-review": "Sintesi: Gli studi analizzati concordano che l'intelligenza artificiale migliora significativamente l'efficienza della ricerca accademica (Rossi, 2023; Bianchi, 2022).",
        dissertation: "Rossi, M., &amp; Bianchi, L. (2023). <em>Metodologia della ricerca accademica</em>. Editore Universitario.",
        students: "Rossi, M., &amp; Bianchi, L. (2023). Ricerca accademica con IA. <em>Rivista Universitaria, 45</em>(2), 112–134.",
        researchers: "Rossi, M., et al. (2023). Revisione sistematica sull'IA nella ricerca. <em>Rivista Accademica, 45</em>(2), 112–134.",
      },
      example2: {
        apa: "Ferrari, A. (2022). <em>Metodologia della ricerca in scienze sociali</em> (3a ed.). Editore Universitario.",
        vancouver: "Ferrari A. Metodologia della ricerca. 3a ed. Milano: Editore Universitario; 2022.",
        mla: "Ferrari, Anna. <em>Metodologia della ricerca in scienze sociali</em>. 3a ed., Editore Universitario, 2022.",
        chicago: "Ferrari, Anna. <em>Metodologia della ricerca in scienze sociali</em>. 3a ed. Milano: Editore Universitario, 2022.",
        "literature-review": "Confronto: Rossi (2023) afferma che l'IA accelera la revisione della letteratura, mentre Bianchi (2022) segnala limitazioni in contesti umanistici.",
        dissertation: "Ferrari, A. (2022). <em>Metodologia della ricerca</em>. Editore Universitario.",
        students: "Ferrari, A. (2022). Ricerca sociale. 3a ed. Editore Universitario.",
        researchers: "Ferrari, A. (2022). <em>Metodologia avanzata</em>. 3a ed. Editore Accademico.",
      },
      example3: {
        apa: "Organizzazione Mondiale della Sanità. (2023, 15 marzo). <em>Guida alla salute mentale</em>. https://www.who.int/it/mental-health",
        vancouver: "OMS. Guida alla salute mentale [Internet]. 2023 [citato 2024]. Disponibile da: https://www.who.int",
        mla: "Organizzazione Mondiale della Sanità. \"Guida alla salute mentale.\" <em>OMS</em>, 15 mar. 2023, www.who.int/it.",
        chicago: "Organizzazione Mondiale della Sanità. \"Guida alla salute mentale.\" Consultato il 15 marzo 2023. https://www.who.int.",
        "literature-review": "Mappatura tematica: Tema 1 — IA ed efficienza; Tema 2 — Limiti etici; Tema 3 — Applicazioni in ambito sanitario.",
        dissertation: "OMS. (2023). <em>Guida alla prevenzione</em>. https://www.who.int/it",
        students: "OMS. (2023). Guida alla salute. https://www.who.int/it",
        researchers: "OMS. (2023). <em>Guida metodologica</em>. https://www.who.int/it",
      },
      howTitle: "Come funziona?", howSubtitle: { apa: "In 3 semplici passaggi, ottieni una bibliografia APA 7 completa pronta da incollare nel tuo lavoro.", vancouver: "In 3 passaggi, ottieni riferimenti Vancouver numerati e correttamente formattati.", mla: "In 3 passaggi, ottieni la tua bibliografia MLA pronta per l'uso.", chicago: "In 3 passaggi, genera la tua bibliografia Chicago completa.", "literature-review": "In 3 passaggi, genera una revisione della letteratura accademica completa.", dissertation: "In 3 passaggi, trova fonti e genera la tua bibliografia.", students: "In 3 passaggi, completa la tua ricerca bibliografica.", researchers: "In 3 passaggi, accelera la tua revisione della letteratura." },
      step1Title: "Descrivi il tuo argomento", step1Desc: "Inserisci il tuo tema di ricerca o parole chiave. Academik cerca su PubMed, Google Scholar, ScienceDirect e altri database per trovare le fonti più rilevanti.",
      step2Title: "L'IA seleziona e analizza", step2Desc: "La nostra IA alimentata da GPT-4o seleziona fonti accademiche di qualità, estrae metadati (autori, anno, rivista, DOI) e verifica la loro rilevanza.",
      step3Title: { apa: "Bibliografia APA generata", vancouver: "Riferimenti Vancouver pronti", mla: "Bibliografia MLA pronta", chicago: "Bibliografia Chicago pronta", "literature-review": "Revisione della letteratura completa", dissertation: "Bibliografia e sintesi pronte", students: "Riferimenti pronti", researchers: "Revisione completa" },
      step3Desc: { apa: "In pochi secondi, la tua bibliografia APA 7 è formattata e pronta per l'uso. Copiala direttamente in Word, Google Docs o il tuo software di scrittura.", vancouver: "I tuoi riferimenti Vancouver sono numerati e formattati. Copiali nel tuo articolo o tesi medica.", mla: "La tua bibliografia MLA è pronta. Copiala nel tuo lavoro accademico di scienze umane.", chicago: "La tua bibliografia Chicago è completa. Pronta per essere inserita nel tuo lavoro di storia o scienze umane.", "literature-review": "La tua revisione della letteratura è strutturata con riassunti, confronti e sintesi tematiche.", dissertation: "La tua bibliografia è formattata e la tua sintesi è pronta per essere incorporata nella tua tesi.", students: "I tuoi riferimenti sono pronti. Copiali nella tua tesi triennale, magistrale o lavoro universitario.", researchers: "La tua revisione è completa con sintesi, confronto e bibliografia formattata." },
      featuresTitle: "Tutto ciò di cui hai bisogno", featuresSubtitle: "Oltre alla bibliografia, Academik copre tutte le tue esigenze di ricerca.",
      features: [
        { title: "APA 7a edizione", desc: "Formato più recente, compatibile con tutte le università italiane, svizzere e internazionali." },
        { title: "Vancouver", desc: "Standard in medicina, farmacia e scienze biomediche. Numerazione automatica." },
        { title: "MLA 9", desc: "Utilizzato in lettere, lingue e scienze umane. Formato automatico." },
        { title: "Chicago 17", desc: "Per storia e scienze umane. Note a piè di pagina incluse." },
        { title: "Database accademici", desc: "PubMed, Google Scholar, ScienceDirect, Scopus — tutti i principali database." },
        { title: "Revisione della letteratura", desc: "Confronta e sintetizza automaticamente le tue fonti per la tua revisione sistematica." },
        { title: "Schede di lettura", desc: "Genera schede di lettura strutturate dai tuoi PDF e articoli." },
        { title: "Equazioni di ricerca", desc: "Crea equazioni booleane per PubMed, Scopus e Web of Science." },
        { title: "Esportazione immediata", desc: "Copia in un clic in Word, Google Docs, LaTeX o il tuo software di scrittura." },
      ],
      whoTitle: "Per chi è Academik?",
      who: [
        { title: "Studenti", desc: "Laurea triennale, magistrale e dottorato. Ideale per tesi, dissertazioni e lavori universitari in Italia, Svizzera e paesi italofoni.", tags: ["Tesi triennale", "Tesi magistrale", "Dottorato", "Elaborati"] },
        { title: "Ricercatori", desc: "Professori, ricercatori e postdottorandi. Accelera le tue revisioni della letteratura e garantisci la conformità bibliografica delle tue pubblicazioni.", tags: ["Articoli", "Riviste", "Conferenze", "Progetti"] },
        { title: "Professionisti", desc: "Medici, infermieri, assistenti sociali, consulenti. Produce bibliografie professionali per rapporti, formazioni e pubblicazioni interne.", tags: ["Rapporti", "Formazioni", "Protocolli", "Audit"] },
      ],
      faqTitle: "Domande frequenti",
      faq: {
        apa: [
          { q: "Cos'è la norma APA 7?", a: "La norma APA 7a edizione è lo standard di citazione più utilizzato in scienze sociali, psicologia, educazione e salute. Definisce il formato dei riferimenti bibliografici e delle citazioni nel testo." },
          { q: "Come generare automaticamente una bibliografia APA?", a: "Con Academik, descrivi il tuo tema di ricerca. La nostra IA genera automaticamente la bibliografia in formato APA 7 con autori, anni, titoli, riviste e DOI correttamente formattati." },
          { q: "Academik è gratuito?", a: "Academik funziona con un sistema di crediti. Puoi iniziare con un pacchetto Starter da 4,99 € per 10 crediti. Senza abbonamento mensile." },
          { q: "Qual è la differenza tra APA, Vancouver e MLA?", a: "APA è usato in scienze sociali e della salute. Vancouver è lo standard in scienze mediche (numerazione). MLA è usato in letteratura e scienze umane. Academik genera tutti e quattro i formati." },
          { q: "Posso usare Academik per la mia tesi?", a: "Assolutamente. Academik è progettato per studenti magistrali, dottorandi e professionisti. Genera bibliografie conformi ai requisiti universitari in APA 7, Vancouver, MLA e Chicago." },
        ],
        vancouver: [
          { q: "Cos'è la norma Vancouver?", a: "La norma Vancouver è il sistema di citazione standard in medicina e scienze della salute. I riferimenti sono numerati nell'ordine in cui appaiono nel testo." },
          { q: "Come genero una bibliografia Vancouver?", a: "Con Academik, inserisci il tuo tema o le tue fonti. La nostra IA genera automaticamente la lista di riferimenti in formato Vancouver con la numerazione corretta." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento mensile." },
          { q: "Vancouver è diverso da APA?", a: "Sì. Vancouver usa la numerazione sequenziale (standard medico) mentre APA usa il sistema autore-anno (scienze sociali). Academik genera entrambi i formati." },
          { q: "Posso usarlo per la mia tesi di medicina?", a: "Sì. Academik è progettato per studenti di medicina, infermieristica e altre scienze della salute che necessitano di bibliografie Vancouver." },
        ],
        mla: [
          { q: "Cos'è la norma MLA 9?", a: "La norma MLA 9a edizione è lo standard di citazione usato in scienze umane, letteratura, linguistica e arti." },
          { q: "Come genero una bibliografia MLA?", a: "Con Academik, descrivi il tuo argomento. L'IA genera automaticamente la tua lista di opere citate in formato MLA 9." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento." },
          { q: "MLA è diverso da APA?", a: "Sì. MLA usa il sistema autore-pagina mentre APA usa autore-anno. MLA è standard nelle scienze umane, APA nelle scienze sociali." },
          { q: "Posso esportare la mia bibliografia MLA?", a: "Sì. Academik ti permette di copiare la tua bibliografia direttamente in Word, Google Docs o qualsiasi elaboratore di testi." },
        ],
        chicago: [
          { q: "Cos'è la norma Chicago 17?", a: "La norma Chicago 17a edizione offre due sistemi: note e bibliografia (storia e scienze umane) e autore-data (scienze sociali)." },
          { q: "Come genero una bibliografia Chicago?", a: "Con Academik, descrivi il tuo argomento. L'IA genera automaticamente la tua bibliografia in formato Chicago 17." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento mensile." },
          { q: "Chicago è diverso da APA?", a: "Sì. Chicago usa note a piè di pagina e bibliografia completa, mentre APA usa citazioni nel testo (autore, anno)." },
          { q: "Posso usare Chicago per la mia tesi di storia?", a: "Assolutamente. Academik genera bibliografie Chicago 17 conformi ai requisiti universitari per lavori di storia e scienze umane." },
        ],
        "literature-review": [
          { q: "Cos'è una revisione della letteratura?", a: "Una revisione della letteratura è un'analisi critica e sistematica delle pubblicazioni scientifiche su un argomento. È fondamentale per qualsiasi lavoro accademico." },
          { q: "Come genera Academik una revisione della letteratura?", a: "Academik cerca articoli in più database, li analizza con IA e genera riassunti strutturati, confronti e sintesi tematiche." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento." },
          { q: "Quali database usa Academik?", a: "Academik cerca su PubMed, Google Scholar, ScienceDirect, Scopus e altri database accademici internazionali." },
          { q: "Posso usarlo per la mia tesi?", a: "Sì. Academik è progettato specificamente per aiutare studenti e ricercatori nella realizzazione dei loro lavori accademici." },
        ],
        dissertation: [
          { q: "Come aiuta Academik con la mia tesi?", a: "Academik cerca fonti accademiche rilevanti, genera bibliografie nel formato richiesto (APA, Vancouver, MLA, Chicago) e crea sintesi letterarie per il tuo quadro teorico." },
          { q: "Quali formati di bibliografia supporta?", a: "APA 7, Vancouver, MLA 9 e Chicago 17 — i quattro formati più utilizzati nelle università italiane, svizzere e internazionali." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento mensile." },
          { q: "Quanto tempo risparmia Academik?", a: "Gli utenti riferiscono di risparmiare tra 5 e 15 ore nella ricerca bibliografica e nella formattazione dei riferimenti per le loro tesi." },
          { q: "Funziona per le università italiane?", a: "Sì. Academik genera bibliografie conformi ai requisiti delle università italiane, svizzere e internazionali." },
        ],
        students: [
          { q: "Per quali tipi di lavori è utile Academik?", a: "Tesi triennale, magistrale, dottorato, elaborati, relazioni. Qualsiasi lavoro accademico che richieda una bibliografia." },
          { q: "Quali formati genera Academik?", a: "APA 7, Vancouver, MLA 9 e Chicago 17 — tutti i formati principali richiesti dalle università italiane e internazionali." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento." },
          { q: "Posso cercare fonti in italiano?", a: "Sì. Academik cerca in database italiani e internazionali: PubMed, Google Scholar, ScienceDirect." },
          { q: "Academik è difficile da usare?", a: "No. Academik è progettato per essere intuitivo. Inserisci il tuo argomento, seleziona il formato e ottieni la tua bibliografia in pochi secondi." },
        ],
        researchers: [
          { q: "Cosa offre Academik ai ricercatori?", a: "Ricerca in più database, sintesi della letteratura, generazione di bibliografie in tutti i formati standard ed equazioni di ricerca booleane." },
          { q: "Quali database include?", a: "PubMed, Google Scholar, ScienceDirect, Scopus, Web of Science e altri database accademici internazionali." },
          { q: "Academik è gratuito?", a: "Academik usa crediti da 4,99 €. Senza abbonamento mensile." },
          { q: "Può generare equazioni di ricerca booleane?", a: "Sì. Academik genera equazioni di ricerca ottimizzate per PubMed, Scopus e Web of Science." },
          { q: "È affidabile per le pubblicazioni accademiche?", a: "Sì. Academik genera riferimenti conformi agli standard internazionali di pubblicazione accademica." },
        ],
      },
      ctaTitle: { apa: "Pronto a generare la tua bibliografia APA?", vancouver: "Pronto per la tua bibliografia Vancouver?", mla: "Pronto per la tua bibliografia MLA?", chicago: "Pronto per la tua bibliografia Chicago?", "literature-review": "Pronto per la tua revisione della letteratura?", dissertation: "Pronto per la tua tesi?", students: "Pronto per il tuo lavoro universitario?", researchers: "Pronto per la tua revisione della letteratura?" },
      ctaDesc: "Unisciti a più di 12.000 studenti e ricercatori che usano Academik per i loro lavori accademici.",
      ctaMainBtn: { apa: "Generare la mia bibliografia APA", vancouver: "Generare la mia bibliografia Vancouver", mla: "Generare la mia bibliografia MLA", chicago: "Generare la mia bibliografia Chicago", "literature-review": "Iniziare la mia revisione della letteratura", dissertation: "Iniziare la mia tesi", students: "Iniziare la mia ricerca", researchers: "Iniziare la mia revisione" },
      ctaSub: "Senza abbonamento · Pagamento sicuro · Risultati immediati",
      partnerText1: "Hai bisogno di aiuto per", partnerBold: { apa: "scrivere la tua tesi?", vancouver: "scrivere il tuo lavoro medico?", mla: "scrivere il tuo lavoro di scienze umane?", chicago: "scrivere il tuo lavoro di storia?", "literature-review": "scrivere la tua revisione della letteratura?", dissertation: "scrivere la tua tesi?", students: "scrivere la tua tesi triennale o magistrale?", researchers: "scrivere il tuo articolo?" }, partnerText2: " —",
      footerTagline: "Strumento di ricerca bibliografica IA", footerHome: "Home", footerLogin: "Accedi",
      metaTitle: {
        apa: "Generatore di Bibliografia APA 7 Online — Gratuito | Academik",
        vancouver: "Generatore di Bibliografia Vancouver Online — Gratuito | Academik",
        mla: "Generatore di Bibliografia MLA 9 Online — Gratuito | Academik",
        chicago: "Generatore di Bibliografia Chicago 17 Online — Gratuito | Academik",
        "literature-review": "Revisione della Letteratura Accademica Online — IA | Academik",
        dissertation: "Aiuto per Tesi e Dissertazione Online — IA | Academik",
        students: "Academik per Studenti — Ricerca Bibliografica IA",
        researchers: "Academik per Ricercatori — Revisione della Letteratura IA",
      },
      metaDesc: {
        apa: "Genera bibliografie APA 7 perfette in pochi secondi. Strumento per studenti e ricercatori. Compatibile con PubMed, Google Scholar, ScienceDirect.",
        vancouver: "Genera bibliografie Vancouver automaticamente. Ideale per medicina e scienze della salute.",
        mla: "Genera bibliografie MLA 9 automaticamente. Perfetto per scienze umane e letteratura.",
        chicago: "Genera bibliografie Chicago 17 con note a piè di pagina. Ideale per storia e scienze umane.",
        "literature-review": "Genera revisioni della letteratura accademiche complete con IA. Ricerca su PubMed, Google Scholar, Scopus.",
        dissertation: "Aiuto intelligente per la tua tesi o dissertazione. Bibliografia APA automatica e sintesi della letteratura.",
        students: "Lo strumento di ricerca bibliografica per studenti universitari. Tesi, dissertazioni. Bibliografie APA, Vancouver in pochi secondi.",
        researchers: "Strumento di revisione della letteratura per ricercatori. Ricerca in database, sintesi e bibliografie automatiche.",
      },
    },
  },
];

// Remaining 19 languages use a simplified template derived from English
const SIMPLE_LANGS: { code: string; htmlLang: string; accentColor: string; slugs: Record<PageType, string>; name: string; countries: string; }[] = [
  { code: "nl", htmlLang: "nl", accentColor: "blue", name: "Nederlands", countries: "Nederland, België en Luxemburg", slugs: { apa: "nl/bibliografie-apa", vancouver: "nl/bibliografie-vancouver", mla: "nl/bibliografie-mla", chicago: "nl/bibliografie-chicago", "literature-review": "nl/literatuuronderzoek", dissertation: "nl/scriptie-hulp", students: "nl/studenten", researchers: "nl/onderzoekers" } },
  { code: "pl", htmlLang: "pl", accentColor: "red", name: "Polski", countries: "Polska i kraje polskojęzyczne", slugs: { apa: "pl/bibliografia-apa", vancouver: "pl/bibliografia-vancouver", mla: "pl/bibliografia-mla", chicago: "pl/bibliografia-chicago", "literature-review": "pl/przeglad-literatury", dissertation: "pl/praca-dyplomowa", students: "pl/studenci", researchers: "pl/naukowcy" } },
  { code: "ro", htmlLang: "ro", accentColor: "blue", name: "Română", countries: "România și țările vorbitoare de română", slugs: { apa: "ro/bibliografie-apa", vancouver: "ro/bibliografie-vancouver", mla: "ro/bibliografie-mla", chicago: "ro/bibliografie-chicago", "literature-review": "ro/recenzie-literatura", dissertation: "ro/teza-disertatie", students: "ro/studenti", researchers: "ro/cercetatori" } },
  { code: "sv", htmlLang: "sv", accentColor: "blue", name: "Svenska", countries: "Sverige, Norge och Norden", slugs: { apa: "sv/bibliografi-apa", vancouver: "sv/bibliografi-vancouver", mla: "sv/bibliografi-mla", chicago: "sv/bibliografi-chicago", "literature-review": "sv/litteraturgranskning", dissertation: "sv/uppsats-hjalp", students: "sv/studenter", researchers: "sv/forskare" } },
  { code: "no", htmlLang: "no", accentColor: "red", name: "Norsk", countries: "Norge, Sverige og Norden", slugs: { apa: "no/bibliografi-apa", vancouver: "no/bibliografi-vancouver", mla: "no/bibliografi-mla", chicago: "no/bibliografi-chicago", "literature-review": "no/litteraturgjennomgang", dissertation: "no/oppgave-hjelp", students: "no/studenter", researchers: "no/forskere" } },
  { code: "da", htmlLang: "da", accentColor: "red", name: "Dansk", countries: "Danmark og Norden", slugs: { apa: "da/bibliografi-apa", vancouver: "da/bibliografi-vancouver", mla: "da/bibliografi-mla", chicago: "da/bibliografi-chicago", "literature-review": "da/litteraturgennemgang", dissertation: "da/opgave-hjaelp", students: "da/studerende", researchers: "da/forskere" } },
  { code: "fi", htmlLang: "fi", accentColor: "blue", name: "Suomi", countries: "Suomi ja pohjoismaat", slugs: { apa: "fi/bibliografia-apa", vancouver: "fi/bibliografia-vancouver", mla: "fi/bibliografia-mla", chicago: "fi/bibliografia-chicago", "literature-review": "fi/kirjallisuuskatsaus", dissertation: "fi/opinnaytetyo-apu", students: "fi/opiskelijat", researchers: "fi/tutkijat" } },
  { code: "cs", htmlLang: "cs", accentColor: "blue", name: "Čeština", countries: "Česká republika a Slovensko", slugs: { apa: "cs/bibliografie-apa", vancouver: "cs/bibliografie-vancouver", mla: "cs/bibliografie-mla", chicago: "cs/bibliografie-chicago", "literature-review": "cs/prehled-literatury", dissertation: "cs/diplomova-prace", students: "cs/studenti", researchers: "cs/vedci" } },
  { code: "hu", htmlLang: "hu", accentColor: "teal", name: "Magyar", countries: "Magyarország és a magyar nyelvű országok", slugs: { apa: "hu/bibliografia-apa", vancouver: "hu/bibliografia-vancouver", mla: "hu/bibliografia-mla", chicago: "hu/bibliografia-chicago", "literature-review": "hu/irodalomattekintes", dissertation: "hu/szakdolgozat-segitseg", students: "hu/hallgatok", researchers: "hu/kutatók" } },
  { code: "el", htmlLang: "el", accentColor: "blue", name: "Ελληνικά", countries: "Ελλάδα και Κύπρος", slugs: { apa: "el/vivliografia-apa", vancouver: "el/vivliografia-vancouver", mla: "el/vivliografia-mla", chicago: "el/vivliografia-chicago", "literature-review": "el/anaskopisi-vivliografias", dissertation: "el/ptychiak-ergasia", students: "el/foitites", researchers: "el/erevnites" } },
  { code: "ru", htmlLang: "ru", accentColor: "blue", name: "Русский", countries: "Россия, Беларусь и русскоязычные страны", slugs: { apa: "ru/bibliografiya-apa", vancouver: "ru/bibliografiya-vancouver", mla: "ru/bibliografiya-mla", chicago: "ru/bibliografiya-chicago", "literature-review": "ru/obzor-literatury", dissertation: "ru/dissertaciya-pomoshch", students: "ru/studenty", researchers: "ru/issledovateli" } },
  { code: "uk", htmlLang: "uk", accentColor: "blue", name: "Українська", countries: "Україна та україномовні країни", slugs: { apa: "uk/bibliohrafiia-apa", vancouver: "uk/bibliohrafiia-vancouver", mla: "uk/bibliohrafiia-mla", chicago: "uk/bibliohrafiia-chicago", "literature-review": "uk/ohliad-literatury", dissertation: "uk/dysertaciia-dopomoha", students: "uk/studenty", researchers: "uk/doslidnyky" } },
  { code: "tr", htmlLang: "tr", accentColor: "red", name: "Türkçe", countries: "Türkiye ve Türkçe konuşulan ülkeler", slugs: { apa: "tr/kaynakca-apa", vancouver: "tr/kaynakca-vancouver", mla: "tr/kaynakca-mla", chicago: "tr/kaynakca-chicago", "literature-review": "tr/literatur-taramasi", dissertation: "tr/tez-yardim", students: "tr/ogrenciler", researchers: "tr/arastirmacılar" } },
  { code: "ar", htmlLang: "ar", accentColor: "teal", name: "العربية", countries: "الدول العربية والناطقة بالعربية", slugs: { apa: "ar/bibliughrafia-apa", vancouver: "ar/bibliughrafia-vancouver", mla: "ar/bibliughrafia-mla", chicago: "ar/bibliughrafia-chicago", "literature-review": "ar/murajaat-adabiyya", dissertation: "ar/risala-musaeada", students: "ar/tullab", researchers: "ar/bahithun" } },
  { code: "he", htmlLang: "he", accentColor: "blue", name: "עברית", countries: "ישראל ומדינות דוברות עברית", slugs: { apa: "he/bibliographia-apa", vancouver: "he/bibliographia-vancouver", mla: "he/bibliographia-mla", chicago: "he/bibliographia-chicago", "literature-review": "he/skirut-sifrut", dissertation: "he/avaoda-akademit", students: "he/studentim", researchers: "he/hukrim" } },
  { code: "hi", htmlLang: "hi", accentColor: "orange", name: "हिन्दी", countries: "भारत और हिंदी भाषी देश", slugs: { apa: "hi/sandarbh-suchi-apa", vancouver: "hi/sandarbh-suchi-vancouver", mla: "hi/sandarbh-suchi-mla", chicago: "hi/sandarbh-suchi-chicago", "literature-review": "hi/sahitya-samiksha", dissertation: "hi/shodh-prabandh-sahayata", students: "hi/chhatr", researchers: "hi/shodharth" } },
  { code: "zh", htmlLang: "zh", accentColor: "red", name: "中文", countries: "中国、台湾、香港及华语国家", slugs: { apa: "zh/cankaowenxian-apa", vancouver: "zh/cankaowenxian-vancouver", mla: "zh/cankaowenxian-mla", chicago: "zh/cankaowenxian-chicago", "literature-review": "zh/wenxian-zongshu", dissertation: "zh/lunwen-bangzhu", students: "zh/xuesheng", researchers: "zh/yanjiu-ren-yuan" } },
  { code: "ja", htmlLang: "ja", accentColor: "red", name: "日本語", countries: "日本および日本語話者の国々", slugs: { apa: "ja/sankoubunken-apa", vancouver: "ja/sankoubunken-vancouver", mla: "ja/sankoubunken-mla", chicago: "ja/sankoubunken-chicago", "literature-review": "ja/bunken-chosa", dissertation: "ja/ronbun-support", students: "ja/gakusei", researchers: "ja/kenkyusha" } },
  { code: "ko", htmlLang: "ko", accentColor: "blue", name: "한국어", countries: "대한민국 및 한국어권 국가", slugs: { apa: "ko/chamgomunheon-apa", vancouver: "ko/chamgomunheon-vancouver", mla: "ko/chamgomunheon-mla", chicago: "ko/chamgomunheon-chicago", "literature-review": "ko/munheon-gochal", dissertation: "ko/nonmun-jiwon", students: "ko/haksaeng", researchers: "ko/yeongu-ja" } },
  { code: "vi", htmlLang: "vi", accentColor: "red", name: "Tiếng Việt", countries: "Việt Nam và các quốc gia nói tiếng Việt", slugs: { apa: "vi/tai-lieu-tham-khao-apa", vancouver: "vi/tai-lieu-tham-khao-vancouver", mla: "vi/tai-lieu-tham-khao-mla", chicago: "vi/tai-lieu-tham-khao-chicago", "literature-review": "vi/tong-quan-tai-lieu", dissertation: "vi/luan-van-ho-tro", students: "vi/sinh-vien", researchers: "vi/nha-nghien-cuu" } },
  { code: "id", htmlLang: "id", accentColor: "red", name: "Bahasa Indonesia", countries: "Indonesia dan negara-negara berbahasa Indonesia", slugs: { apa: "id/daftar-pustaka-apa", vancouver: "id/daftar-pustaka-vancouver", mla: "id/daftar-pustaka-mla", chicago: "id/daftar-pustaka-chicago", "literature-review": "id/tinjauan-pustaka", dissertation: "id/skripsi-bantuan", students: "id/mahasiswa", researchers: "id/peneliti" } },
];

// PAGE TYPES
const PAGE_TYPES: PageType[] = ["apa", "vancouver", "mla", "chicago", "literature-review", "dissertation", "students", "researchers"];

// All slugs for sitemap generation
export const ALL_LANG_SLUGS: { slug: string; lang: string; type: PageType }[] = [];

// Build full SeoPageData for detailed langs (ES, PT, DE, IT)
function buildDetailedPage(lc: LangConfig, type: PageType): SeoPageData {
  const slug = lc.slugs[type];
  ALL_LANG_SLUGS.push({ slug, lang: lc.code, type });
  return {
    lang: lc.code,
    htmlLang: lc.htmlLang,
    canonical: `${BASE}/${slug}`,
    hreflangs: [
      { lang: lc.htmlLang, href: `${BASE}/${slug}` },
      { lang: "x-default", href: `${BASE}/bibliographie-apa` },
    ],
    title: lc.t.metaTitle[type],
    metaDesc: lc.t.metaDesc[type],
    ogTitle: lc.t.metaTitle[type].split("|")[0].trim(),
    ogDesc: lc.t.metaDesc[type],
    badge: lc.t.badge[type],
    h1a: lc.t.h1a[type],
    h1b: lc.t.h1b[type],
    heroDesc: lc.t.heroDesc[type],
    heroCountries: lc.t.heroCountries,
    ctaBtn: lc.t.ctaBtn,
    ctaSecondary: lc.t.ctaSecondary,
    checkFrom: lc.t.checkFrom,
    checkNoSub: lc.t.checkNoSub,
    checkSpeed: lc.t.checkSpeed,
    statStudents: lc.t.statStudents,
    statBibs: lc.t.statBibs,
    statRating: lc.t.statRating,
    statTime: lc.t.statTime,
    statStudentsLabel: lc.t.statStudentsLabel,
    statBibsLabel: lc.t.statBibsLabel,
    statRatingLabel: lc.t.statRatingLabel,
    statTimeLabel: lc.t.statTimeLabel,
    whatTitle: lc.t.whatTitle[type],
    whatP1: lc.t.whatP1[type],
    whatP2: lc.t.whatP2[type],
    whatP3: lc.t.whatP3,
    exampleLabel1: lc.t.exampleLabel1[type],
    exampleLabel2: lc.t.exampleLabel2[type],
    exampleLabel3: lc.t.exampleLabel3[type],
    example1: lc.t.example1[type],
    example2: lc.t.example2[type],
    example3: lc.t.example3[type],
    howTitle: lc.t.howTitle,
    howSubtitle: lc.t.howSubtitle[type],
    step1Title: lc.t.step1Title,
    step1Desc: lc.t.step1Desc,
    step2Title: lc.t.step2Title,
    step2Desc: lc.t.step2Desc,
    step3Title: lc.t.step3Title[type],
    step3Desc: lc.t.step3Desc[type],
    featuresTitle: lc.t.featuresTitle,
    featuresSubtitle: lc.t.featuresSubtitle,
    features: lc.t.features,
    whoTitle: lc.t.whoTitle,
    who: lc.t.who,
    faqTitle: lc.t.faqTitle,
    faq: lc.t.faq[type],
    ctaTitle: lc.t.ctaTitle[type],
    ctaDesc: lc.t.ctaDesc,
    ctaMainBtn: lc.t.ctaMainBtn[type],
    ctaSub: lc.t.ctaSub,
    partnerText1: lc.t.partnerText1,
    partnerBold: lc.t.partnerBold[type],
    partnerText2: lc.t.partnerText2,
    footerTagline: lc.t.footerTagline,
    footerHome: lc.t.footerHome,
    footerLogin: lc.t.footerLogin,
    schemaName: `Academik — ${lc.t.h1b[type]}`,
    schemaDesc: lc.t.metaDesc[type],
    accentColor: lc.accentColor,
  };
}

// Page type labels for simple langs (English fallback labels for schema)
const PAGE_TYPE_LABELS_EN: Record<PageType, { badge: string; h1a: string; h1b: string; heroDesc: string; metaTitle: string; metaDesc: string; ctaTitle: string; ctaMainBtn: string; whatTitle: string; howSubtitle: string; step3Title: string; step3Desc: string; ctaSub: string }> = {
  apa: { badge: "APA 7th Edition", h1a: "APA Bibliography", h1b: "Generator", heroDesc: "Generate perfectly formatted APA 7 bibliographies in seconds. AI searches PubMed, Google Scholar, ScienceDirect.", metaTitle: "APA Bibliography Generator — Academik", metaDesc: "Generate APA 7 bibliographies automatically. Free tool for students and researchers.", ctaTitle: "Ready to generate your APA bibliography?", ctaMainBtn: "Generate my APA bibliography", whatTitle: "What is APA 7?", howSubtitle: "3 simple steps to get a complete APA bibliography.", step3Title: "APA bibliography ready", step3Desc: "Your APA 7 bibliography is formatted and ready to paste into your work.", ctaSub: "No subscription · Secure payment · Instant results" },
  vancouver: { badge: "Vancouver Standard", h1a: "Vancouver Bibliography", h1b: "Generator", heroDesc: "Create automatically numbered Vancouver bibliographies. Ideal for medicine and biomedical sciences.", metaTitle: "Vancouver Bibliography Generator — Academik", metaDesc: "Generate Vancouver bibliographies automatically. Ideal for medicine and health sciences.", ctaTitle: "Ready for your Vancouver bibliography?", ctaMainBtn: "Generate my Vancouver bibliography", whatTitle: "What is Vancouver style?", howSubtitle: "3 steps to get numbered Vancouver references.", step3Title: "Vancouver references ready", step3Desc: "Your Vancouver references are numbered and formatted for your medical article or thesis.", ctaSub: "No subscription · Secure payment · Instant results" },
  mla: { badge: "MLA 9th Edition", h1a: "MLA Bibliography", h1b: "Generator", heroDesc: "Generate MLA 9 bibliographies automatically. Perfect for humanities, literature and linguistics.", metaTitle: "MLA Bibliography Generator — Academik", metaDesc: "Generate MLA 9 bibliographies automatically. Perfect for humanities and literature.", ctaTitle: "Ready for your MLA bibliography?", ctaMainBtn: "Generate my MLA bibliography", whatTitle: "What is MLA 9?", howSubtitle: "3 steps to get your formatted MLA bibliography.", step3Title: "MLA bibliography ready", step3Desc: "Your MLA bibliography is ready to paste into your humanities work.", ctaSub: "No subscription · Secure payment · Instant results" },
  chicago: { badge: "Chicago 17th Edition", h1a: "Chicago Bibliography", h1b: "Generator", heroDesc: "Generate Chicago 17 bibliographies with footnotes. Ideal for history and humanities.", metaTitle: "Chicago Bibliography Generator — Academik", metaDesc: "Generate Chicago 17 bibliographies with footnotes. Ideal for history and humanities.", ctaTitle: "Ready for your Chicago bibliography?", ctaMainBtn: "Generate my Chicago bibliography", whatTitle: "What is Chicago 17?", howSubtitle: "3 steps to generate your complete Chicago bibliography.", step3Title: "Chicago bibliography ready", step3Desc: "Your Chicago bibliography is complete and ready to insert into your history or humanities work.", ctaSub: "No subscription · Secure payment · Instant results" },
  "literature-review": { badge: "Literature Review", h1a: "Academic Literature", h1b: "Review Tool", heroDesc: "Search academic articles, analyze and synthesize your sources. AI generates complete literature reviews in minutes.", metaTitle: "Academic Literature Review Tool — Academik", metaDesc: "Generate complete academic literature reviews with AI. Search PubMed, Google Scholar, Scopus.", ctaTitle: "Ready for your literature review?", ctaMainBtn: "Start my literature review", whatTitle: "What is a literature review?", howSubtitle: "3 steps to generate a complete academic literature review.", step3Title: "Literature review complete", step3Desc: "Your literature review is structured with summaries, confrontations and thematic syntheses.", ctaSub: "No subscription · Secure payment · Instant results" },
  dissertation: { badge: "Dissertation & Thesis", h1a: "Dissertation", h1b: "Help Tool", heroDesc: "Intelligent help for your dissertation or thesis. Source search, automatic APA bibliography and literature synthesis.", metaTitle: "Dissertation & Thesis Help Online — Academik", metaDesc: "Intelligent help for your dissertation or thesis. Automatic APA bibliography and literature synthesis.", ctaTitle: "Ready for your dissertation?", ctaMainBtn: "Start my dissertation", whatTitle: "How to write a dissertation?", howSubtitle: "3 steps to find sources and generate your bibliography.", step3Title: "Bibliography and synthesis ready", step3Desc: "Your bibliography is formatted and your synthesis ready to incorporate into your dissertation.", ctaSub: "No subscription · Secure payment · Instant results" },
  students: { badge: "For Students", h1a: "Academik for", h1b: "Students", heroDesc: "The bibliographic research tool for university students. Find sources, generate bibliographies and analyze references in one click.", metaTitle: "Academik for Students — AI Bibliographic Research", metaDesc: "The bibliographic research tool for university students. APA, Vancouver, MLA, Chicago bibliographies in seconds.", ctaTitle: "Ready to start your research?", ctaMainBtn: "Start my research", whatTitle: "Bibliographic research for students", howSubtitle: "3 steps to complete your bibliographic research.", step3Title: "References ready", step3Desc: "Your references are ready. Copy them into your thesis, dissertation or university work.", ctaSub: "No subscription · Secure payment · Instant results" },
  researchers: { badge: "For Researchers", h1a: "Academik for", h1b: "Researchers", heroDesc: "Accelerate your literature reviews. Powerful AI for article search, synthesis and bibliography generation.", metaTitle: "Academik for Researchers — AI Literature Review", metaDesc: "AI literature review tool for researchers. Database search, synthesis and automatic bibliographies.", ctaTitle: "Ready for your literature review?", ctaMainBtn: "Start my review", whatTitle: "Research tool for academics", howSubtitle: "3 steps to accelerate your literature review.", step3Title: "Review complete", step3Desc: "Your review is complete with synthesis, confrontation and formatted bibliography.", ctaSub: "No subscription · Secure payment · Instant results" },
};

function buildSimplePage(sl: typeof SIMPLE_LANGS[0], type: PageType): SeoPageData {
  const slug = sl.slugs[type];
  ALL_LANG_SLUGS.push({ slug, lang: sl.code, type });
  const lbl = PAGE_TYPE_LABELS_EN[type];
  return {
    lang: sl.code,
    htmlLang: sl.htmlLang,
    canonical: `${BASE}/${slug}`,
    hreflangs: [
      { lang: sl.htmlLang, href: `${BASE}/${slug}` },
      { lang: "x-default", href: `${BASE}/bibliographie-apa` },
    ],
    title: `${lbl.metaTitle} | ${sl.name}`,
    metaDesc: lbl.metaDesc,
    ogTitle: lbl.metaTitle,
    ogDesc: lbl.metaDesc,
    badge: lbl.badge,
    h1a: lbl.h1a,
    h1b: lbl.h1b,
    heroDesc: lbl.heroDesc,
    heroCountries: sl.countries,
    ctaBtn: "Get started free",
    ctaSecondary: "See all features",
    checkFrom: "From €4.99",
    checkNoSub: "No subscription",
    checkSpeed: "Results in seconds",
    statStudents: "12,000+", statBibs: "85,000+", statRating: "4.8/5", statTime: "< 10 sec",
    statStudentsLabel: "Students & researchers", statBibsLabel: "Bibliographies generated", statRatingLabel: "Average rating", statTimeLabel: "Generation time",
    whatTitle: lbl.whatTitle,
    whatP1: "Academik is an AI-powered academic bibliographic research tool. It helps students and researchers find academic sources, generate perfectly formatted bibliographies and synthesize literature.",
    whatP2: "Whether you need APA 7, Vancouver, MLA or Chicago format, Academik searches major academic databases — PubMed, Google Scholar, ScienceDirect, Scopus — and automatically formats your reference list.",
    whatP3: "Academik automatically generates your references in the correct format, integrating the latest standards for digital sources, DOIs and URLs.",
    exampleLabel1: `${lbl.badge} example — Journal article`,
    exampleLabel2: `${lbl.badge} example — Book`,
    exampleLabel3: `${lbl.badge} example — Website`,
    example1: 'Smith, J., &amp; Johnson, A. (2023). The impact of AI on academic research. <em>Journal of Educational Technology, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx',
    example2: 'Brown, M. (2022). <em>Research methods in social sciences</em> (3rd ed.). Oxford University Press.',
    example3: 'World Health Organization. (2023, March 15). <em>Mental health guidelines</em>. https://www.who.int/mental-health',
    howTitle: "How does it work?",
    howSubtitle: lbl.howSubtitle,
    step1Title: "Describe your topic",
    step1Desc: "Enter your research theme or keywords. Academik searches PubMed, Google Scholar, ScienceDirect and other databases.",
    step2Title: "AI selects and analyses",
    step2Desc: "Our GPT-4o powered AI selects quality academic sources, extracts metadata and verifies relevance.",
    step3Title: lbl.step3Title,
    step3Desc: lbl.step3Desc,
    featuresTitle: "Everything you need",
    featuresSubtitle: "Beyond bibliography, Academik covers all your research needs.",
    features: [
      { title: "APA 7th Edition", desc: "Most recent format, accepted by all universities worldwide." },
      { title: "Vancouver", desc: "Standard in medicine, pharmacy and biomedical sciences. Automatic numbering." },
      { title: "MLA 9", desc: "Used in literature, languages and humanities. Automatic formatting." },
      { title: "Chicago 17", desc: "For history and humanities. Footnotes and bibliography formats included." },
      { title: "Major databases", desc: "PubMed, Google Scholar, ScienceDirect, Scopus — all major academic databases." },
      { title: "Literature review", desc: "Automatically compare and synthesise your sources for your systematic review." },
      { title: "Reading notes", desc: "Generate structured reading notes from your PDFs and journal articles." },
      { title: "Search equations", desc: "Create Boolean search equations for PubMed, Scopus and Web of Science." },
      { title: "Instant export", desc: "One-click copy into Word, Google Docs, LaTeX or your writing software." },
    ],
    whoTitle: "Who is Academik for?",
    who: [
      { title: "Students", desc: `Undergraduate, Masters and PhD students in ${sl.countries}. Perfect for dissertations, theses and research papers.`, tags: ["Dissertation", "Thesis", "Research paper", "Essays"] },
      { title: "Researchers", desc: "Lecturers, professors, postdoctoral researchers. Speed up your literature reviews and ensure bibliographic compliance.", tags: ["Journal articles", "Reviews", "Conferences", "Reports"] },
      { title: "Professionals", desc: "Healthcare professionals, consultants, social workers. Produce professional bibliographies for reports and publications.", tags: ["Reports", "Training", "Protocols", "Audits"] },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      { q: `What is the ${lbl.badge} format?`, a: `The ${lbl.badge} is an academic citation standard used by universities worldwide. Academik automatically generates correctly formatted references in this style.` },
      { q: "How do I generate a bibliography automatically?", a: "With Academik, simply describe your research topic or paste your sources. Our AI searches academic databases and automatically formats your bibliography." },
      { q: "Is Academik free to use?", a: "Academik uses a pay-as-you-go credit system. You can start with a Starter pack from €4.99 for 10 credits. No monthly subscription." },
      { q: "What databases does Academik search?", a: "Academik searches PubMed, Google Scholar, ScienceDirect, Scopus and other major academic databases." },
      { q: "Can I use Academik for my dissertation or thesis?", a: "Absolutely. Academik is designed for university students and professional researchers. It generates bibliographies compliant with university requirements in APA 7, Vancouver, MLA and Chicago." },
    ],
    ctaTitle: lbl.ctaTitle,
    ctaDesc: "Join over 12,000 students and researchers who use Academik for their academic work.",
    ctaMainBtn: lbl.ctaMainBtn,
    ctaSub: lbl.ctaSub,
    partnerText1: "Need expert help",
    partnerBold: "writing your dissertation or thesis?",
    partnerText2: " —",
    footerTagline: "AI Academic Research Tool",
    footerHome: "Home",
    footerLogin: "Sign in",
    schemaName: `Academik — ${lbl.h1b}`,
    schemaDesc: lbl.metaDesc,
    accentColor: sl.accentColor,
  };
}

// Build all pages
export const SEO_PAGES: Record<string, SeoPageData> = {};

// Detailed langs
for (const lc of LANGS) {
  for (const type of PAGE_TYPES) {
    const slug = lc.slugs[type];
    SEO_PAGES[slug] = buildDetailedPage(lc, type);
  }
}

// Simple langs
for (const sl of SIMPLE_LANGS) {
  for (const type of PAGE_TYPES) {
    const slug = sl.slugs[type];
    SEO_PAGES[slug] = buildSimplePage(sl, type);
  }
}
