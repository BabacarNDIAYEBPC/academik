export type SEOPage = "home" | "dashboard" | "billing" | "auth" | "revue";

export interface SEOData {
  title: string;
  description: string;
}

const RTL_LANGUAGES = ["ar", "he"];

export function isRTL(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

export const seoTranslations: Record<string, Record<SEOPage, SEOData>> = {
  fr: {
    home: {
      title: "Academik — Revue de littérature et bibliographie académique",
      description: "Recherchez des articles scientifiques, générez des bibliographies APA/Vancouver/MLA/Chicago, analysez et synthétisez vos sources académiques.",
    },
    dashboard: {
      title: "Tableau de bord | Academik",
      description: "Gérez vos recherches bibliographiques sauvegardées et accédez à votre espace de travail académique.",
    },
    billing: {
      title: "Crédits & Facturation | Academik",
      description: "Achetez des crédits pour utiliser les fonctionnalités IA d'Academik : recherche d'articles, analyse et génération de bibliographies.",
    },
    auth: {
      title: "Connexion | Academik",
      description: "Connectez-vous à votre espace Academik pour accéder aux outils de revue de littérature et de bibliographie.",
    },
    revue: {
      title: "Revue de littérature | Academik",
      description: "Lancez une recherche bibliographique, analysez vos articles et générez une synthèse de littérature complète.",
    },
  },
  en: {
    home: {
      title: "Academik — Academic Literature Review & Bibliography Tool",
      description: "Search scientific articles, generate APA/Vancouver/MLA/Chicago bibliographies, analyze and synthesize your academic sources.",
    },
    dashboard: {
      title: "Dashboard | Academik",
      description: "Manage your saved bibliographic searches and access your academic workspace.",
    },
    billing: {
      title: "Credits & Billing | Academik",
      description: "Buy credits to use Academik's AI features: article search, analysis and bibliography generation.",
    },
    auth: {
      title: "Sign In | Academik",
      description: "Sign in to your Academik workspace to access literature review and bibliography tools.",
    },
    revue: {
      title: "Literature Review | Academik",
      description: "Run a bibliographic search, analyze your articles and generate a complete literature synthesis.",
    },
  },
  es: {
    home: {
      title: "Academik — Revisión de Literatura y Bibliografía Académica",
      description: "Busca artículos científicos, genera bibliografías APA/Vancouver/MLA/Chicago, analiza y sintetiza tus fuentes académicas.",
    },
    dashboard: {
      title: "Panel de control | Academik",
      description: "Gestiona tus búsquedas bibliográficas guardadas y accede a tu espacio de trabajo académico.",
    },
    billing: {
      title: "Créditos y Facturación | Academik",
      description: "Compra créditos para usar las funciones de IA de Academik: búsqueda, análisis y generación de bibliografías.",
    },
    auth: {
      title: "Iniciar sesión | Academik",
      description: "Inicia sesión en tu espacio Academik para acceder a las herramientas de revisión de literatura y bibliografía.",
    },
    revue: {
      title: "Revisión de Literatura | Academik",
      description: "Realiza una búsqueda bibliográfica, analiza tus artículos y genera una síntesis literaria completa.",
    },
  },
  pt: {
    home: {
      title: "Academik — Revisão de Literatura e Bibliografia Académica",
      description: "Pesquise artigos científicos, gere bibliografias APA/Vancouver/MLA/Chicago, analise e sintetize as suas fontes académicas.",
    },
    dashboard: {
      title: "Painel | Academik",
      description: "Gerencie suas pesquisas bibliográficas salvas e acesse seu espaço de trabalho acadêmico.",
    },
    billing: {
      title: "Créditos e Faturamento | Academik",
      description: "Compre créditos para usar as funcionalidades de IA da Academik: pesquisa, análise e geração de bibliografias.",
    },
    auth: {
      title: "Entrar | Academik",
      description: "Entre no seu espaço Academik para acessar as ferramentas de revisão de literatura e bibliografias.",
    },
    revue: {
      title: "Revisão de Literatura | Academik",
      description: "Realize uma pesquisa bibliográfica, analise seus artigos e gere uma síntese literária completa.",
    },
  },
  de: {
    home: {
      title: "Academik — Literaturrecherche & Akademische Bibliografie",
      description: "Suchen Sie wissenschaftliche Artikel, erstellen Sie APA/Vancouver/MLA/Chicago-Bibliografien, analysieren und synthetisieren Sie Ihre akademischen Quellen.",
    },
    dashboard: {
      title: "Dashboard | Academik",
      description: "Verwalten Sie Ihre gespeicherten bibliografischen Suchen und greifen Sie auf Ihren akademischen Arbeitsbereich zu.",
    },
    billing: {
      title: "Guthaben & Abrechnung | Academik",
      description: "Kaufen Sie Guthaben, um die KI-Funktionen von Academik zu nutzen: Suche, Analyse und Bibliografieerstellung.",
    },
    auth: {
      title: "Anmelden | Academik",
      description: "Melden Sie sich in Ihrem Academik-Bereich an, um auf Literaturrecherche- und Bibliografie-Tools zuzugreifen.",
    },
    revue: {
      title: "Literaturrecherche | Academik",
      description: "Starten Sie eine bibliografische Suche, analysieren Sie Ihre Artikel und erstellen Sie eine vollständige Literatursynthese.",
    },
  },
  it: {
    home: {
      title: "Academik — Revisione della Letteratura e Bibliografia Accademica",
      description: "Cerca articoli scientifici, genera bibliografie APA/Vancouver/MLA/Chicago, analizza e sintetizza le tue fonti accademiche.",
    },
    dashboard: {
      title: "Dashboard | Academik",
      description: "Gestisci le tue ricerche bibliografiche salvate e accedi al tuo spazio di lavoro accademico.",
    },
    billing: {
      title: "Crediti e Fatturazione | Academik",
      description: "Acquista crediti per utilizzare le funzionalità AI di Academik: ricerca, analisi e generazione di bibliografie.",
    },
    auth: {
      title: "Accedi | Academik",
      description: "Accedi al tuo spazio Academik per utilizzare gli strumenti di revisione della letteratura e bibliografia.",
    },
    revue: {
      title: "Revisione della Letteratura | Academik",
      description: "Avvia una ricerca bibliografica, analizza i tuoi articoli e genera una sintesi letteraria completa.",
    },
  },
  nl: {
    home: {
      title: "Academik — Literatuuronderzoek & Academische Bibliografie",
      description: "Zoek wetenschappelijke artikelen, genereer APA/Vancouver/MLA/Chicago-bibliografieën, analyseer en synthetiseer uw academische bronnen.",
    },
    dashboard: {
      title: "Dashboard | Academik",
      description: "Beheer uw opgeslagen bibliografische zoekopdrachten en toegang tot uw academische werkruimte.",
    },
    billing: {
      title: "Credits & Facturering | Academik",
      description: "Koop credits om de AI-functies van Academik te gebruiken: zoeken, analyseren en bibliografieën genereren.",
    },
    auth: {
      title: "Inloggen | Academik",
      description: "Log in op uw Academik-ruimte om toegang te krijgen tot literatuuronderzoek- en bibliografietools.",
    },
    revue: {
      title: "Literatuuronderzoek | Academik",
      description: "Start een bibliografisch onderzoek, analyseer uw artikelen en genereer een complete literatuursynthese.",
    },
  },
  ar: {
    home: {
      title: "Academik — مراجعة الأدبيات والببليوغرافيا الأكاديمية",
      description: "ابحث عن المقالات العلمية، أنشئ قوائم مراجع APA/Vancouver/MLA/Chicago، وحلل ولخّص مصادرك الأكاديمية.",
    },
    dashboard: {
      title: "لوحة التحكم | Academik",
      description: "أدر بحوثك الببليوغرافية المحفوظة وادخل إلى مساحة عملك الأكاديمية.",
    },
    billing: {
      title: "الرصيد والفواتير | Academik",
      description: "اشترِ رصيداً لاستخدام ميزات الذكاء الاصطناعي في Academik: البحث والتحليل وإنشاء قوائم المراجع.",
    },
    auth: {
      title: "تسجيل الدخول | Academik",
      description: "سجّل دخولك إلى Academik للوصول إلى أدوات مراجعة الأدبيات والببليوغرافيا.",
    },
    revue: {
      title: "مراجعة الأدبيات | Academik",
      description: "أجرِ بحثاً ببليوغرافياً، وحلل مقالاتك، وأنشئ مراجعة أدبيات شاملة.",
    },
  },
  zh: {
    home: {
      title: "Academik — 学术文献综述与参考文献工具",
      description: "搜索学术文章，生成APA/Vancouver/MLA/Chicago参考文献，分析和综合您的学术来源。",
    },
    dashboard: {
      title: "控制台 | Academik",
      description: "管理您保存的文献检索，访问您的学术工作空间。",
    },
    billing: {
      title: "积分与账单 | Academik",
      description: "购买积分以使用Academik的AI功能：文章检索、分析和参考文献生成。",
    },
    auth: {
      title: "登录 | Academik",
      description: "登录您的Academik工作空间，访问文献综述和参考文献工具。",
    },
    revue: {
      title: "文献综述 | Academik",
      description: "进行文献检索，分析您的文章，生成完整的文献综述。",
    },
  },
  ja: {
    home: {
      title: "Academik — 学術文献レビューと参考文献ツール",
      description: "学術論文を検索し、APA/Vancouver/MLA/Chicago形式の参考文献リストを生成、学術ソースを分析・統合します。",
    },
    dashboard: {
      title: "ダッシュボード | Academik",
      description: "保存した文献検索を管理し、学術ワークスペースにアクセスします。",
    },
    billing: {
      title: "クレジットと請求 | Academik",
      description: "AcademikのAI機能（論文検索、分析、参考文献生成）を利用するためのクレジットを購入します。",
    },
    auth: {
      title: "ログイン | Academik",
      description: "Academikにログインして、文献レビューと参考文献ツールにアクセスします。",
    },
    revue: {
      title: "文献レビュー | Academik",
      description: "文献検索を実行し、論文を分析し、完全な文献レビューを生成します。",
    },
  },
  ru: {
    home: {
      title: "Academik — Обзор Литературы и Академическая Библиография",
      description: "Ищите научные статьи, создавайте библиографии APA/Vancouver/MLA/Chicago, анализируйте и синтезируйте академические источники.",
    },
    dashboard: {
      title: "Панель управления | Academik",
      description: "Управляйте сохранёнными библиографическими поисками и работайте в академическом пространстве.",
    },
    billing: {
      title: "Кредиты и Оплата | Academik",
      description: "Купите кредиты для использования ИИ-функций Academik: поиск, анализ и создание библиографий.",
    },
    auth: {
      title: "Войти | Academik",
      description: "Войдите в свой Academik для доступа к инструментам обзора литературы и библиографии.",
    },
    revue: {
      title: "Обзор Литературы | Academik",
      description: "Запустите библиографический поиск, анализируйте статьи и создавайте полный обзор литературы.",
    },
  },
  tr: {
    home: {
      title: "Academik — Literatür Taraması ve Akademik Kaynakça",
      description: "Akademik makaleler arayın, APA/Vancouver/MLA/Chicago kaynakçaları oluşturun, kaynaklarınızı analiz edin ve sentezleyin.",
    },
    dashboard: {
      title: "Gösterge Paneli | Academik",
      description: "Kaydedilmiş bibliyografik aramalarınızı yönetin ve akademik çalışma alanınıza erişin.",
    },
    billing: {
      title: "Krediler ve Faturalama | Academik",
      description: "Academik'in AI özelliklerini kullanmak için kredi satın alın: arama, analiz ve kaynakça oluşturma.",
    },
    auth: {
      title: "Giriş Yap | Academik",
      description: "Literatür taraması ve kaynakça araçlarına erişmek için Academik hesabınıza giriş yapın.",
    },
    revue: {
      title: "Literatür Taraması | Academik",
      description: "Bibliyografik arama yapın, makalelerinizi analiz edin ve tam bir literatür sentezi oluşturun.",
    },
  },
  ko: {
    home: {
      title: "Academik — 학술 문헌 검토 및 참고문헌 도구",
      description: "학술 논문을 검색하고 APA/Vancouver/MLA/Chicago 참고문헌을 생성하며 학술 출처를 분석하고 종합합니다.",
    },
    dashboard: {
      title: "대시보드 | Academik",
      description: "저장된 문헌 검색을 관리하고 학술 작업공간에 접근합니다.",
    },
    billing: {
      title: "크레딧 및 결제 | Academik",
      description: "Academik의 AI 기능(논문 검색, 분석, 참고문헌 생성)을 사용하기 위한 크레딧을 구매합니다.",
    },
    auth: {
      title: "로그인 | Academik",
      description: "Academik에 로그인하여 문헌 검토 및 참고문헌 도구에 접근합니다.",
    },
    revue: {
      title: "문헌 검토 | Academik",
      description: "문헌 검색을 실행하고 논문을 분석하여 완전한 문헌 검토를 생성합니다.",
    },
  },
  pl: {
    home: {
      title: "Academik — Przegląd Literatury i Akademicka Bibliografia",
      description: "Wyszukuj artykuły naukowe, generuj bibliografie APA/Vancouver/MLA/Chicago, analizuj i syntetyzuj swoje źródła akademickie.",
    },
    dashboard: {
      title: "Panel | Academik",
      description: "Zarządzaj zapisanymi wyszukiwaniami bibliograficznymi i uzyskuj dostęp do akademicznego środowiska pracy.",
    },
    billing: {
      title: "Kredyty i Rozliczenia | Academik",
      description: "Kup kredyty, aby korzystać z funkcji AI Academik: wyszukiwanie, analiza i generowanie bibliografii.",
    },
    auth: {
      title: "Zaloguj się | Academik",
      description: "Zaloguj się do Academik, aby uzyskać dostęp do narzędzi przeglądu literatury i bibliografii.",
    },
    revue: {
      title: "Przegląd Literatury | Academik",
      description: "Przeprowadź wyszukiwanie bibliograficzne, analizuj artykuły i generuj pełną syntezę literatury.",
    },
  },
  ro: {
    home: {
      title: "Academik — Revizuire Literară și Bibliografie Academică",
      description: "Caută articole științifice, generează bibliografii APA/Vancouver/MLA/Chicago, analizează și sintetizează sursele tale academice.",
    },
    dashboard: {
      title: "Panou de control | Academik",
      description: "Gestionează căutările bibliografice salvate și accesează spațiul tău de lucru academic.",
    },
    billing: {
      title: "Credite și Facturare | Academik",
      description: "Cumpără credite pentru a folosi funcțiile AI ale Academik: căutare, analiză și generare de bibliografii.",
    },
    auth: {
      title: "Conectare | Academik",
      description: "Conectează-te la contul tău Academik pentru a accesa instrumentele de revizuire a literaturii și bibliografie.",
    },
    revue: {
      title: "Revizuire Literară | Academik",
      description: "Realizează o căutare bibliografică, analizează articolele tale și generează o sinteză literară completă.",
    },
  },
  sv: {
    home: {
      title: "Academik — Litteraturöversikt och Akademisk Bibliografi",
      description: "Sök akademiska artiklar, generera APA/Vancouver/MLA/Chicago-bibliografier, analysera och syntetisera dina akademiska källor.",
    },
    dashboard: {
      title: "Instrumentpanel | Academik",
      description: "Hantera dina sparade bibliografiska sökningar och få tillgång till din akademiska arbetsyta.",
    },
    billing: {
      title: "Krediter och Fakturering | Academik",
      description: "Köp krediter för att använda Academiks AI-funktioner: sökning, analys och bibliografigenerering.",
    },
    auth: {
      title: "Logga in | Academik",
      description: "Logga in på ditt Academik-konto för att komma åt verktyg för litteraturöversikt och bibliografi.",
    },
    revue: {
      title: "Litteraturöversikt | Academik",
      description: "Utför en bibliografisk sökning, analysera dina artiklar och generera en fullständig litteratursynthes.",
    },
  },
  hi: {
    home: {
      title: "Academik — साहित्य समीक्षा और शैक्षणिक ग्रंथसूची",
      description: "शैक्षणिक लेख खोजें, APA/Vancouver/MLA/Chicago ग्रंथसूचियाँ बनाएं, अपने स्रोतों का विश्लेषण और संश्लेषण करें।",
    },
    dashboard: {
      title: "डैशबोर्ड | Academik",
      description: "अपनी सहेजी गई ग्रंथसूची खोजों को प्रबंधित करें और शैक्षणिक कार्यक्षेत्र तक पहुंचें।",
    },
    billing: {
      title: "क्रेडिट और बिलिंग | Academik",
      description: "Academik की AI सुविधाओं का उपयोग करने के लिए क्रेडिट खरीदें: खोज, विश्लेषण और ग्रंथसूची निर्माण।",
    },
    auth: {
      title: "लॉग इन करें | Academik",
      description: "साहित्य समीक्षा और ग्रंथसूची टूल्स तक पहुंचने के लिए Academik में लॉग इन करें।",
    },
    revue: {
      title: "साहित्य समीक्षा | Academik",
      description: "ग्रंथसूची खोज करें, लेखों का विश्लेषण करें और एक संपूर्ण साहित्य समीक्षा तैयार करें।",
    },
  },
  id: {
    home: {
      title: "Academik — Tinjauan Literatur dan Bibliografi Akademik",
      description: "Cari artikel ilmiah, buat bibliografi APA/Vancouver/MLA/Chicago, analisis dan sintesis sumber akademik Anda.",
    },
    dashboard: {
      title: "Dasbor | Academik",
      description: "Kelola pencarian bibliografi tersimpan Anda dan akses ruang kerja akademik.",
    },
    billing: {
      title: "Kredit dan Penagihan | Academik",
      description: "Beli kredit untuk menggunakan fitur AI Academik: pencarian, analisis, dan pembuatan bibliografi.",
    },
    auth: {
      title: "Masuk | Academik",
      description: "Masuk ke akun Academik Anda untuk mengakses alat tinjauan literatur dan bibliografi.",
    },
    revue: {
      title: "Tinjauan Literatur | Academik",
      description: "Lakukan pencarian bibliografi, analisis artikel, dan buat sintesis literatur lengkap.",
    },
  },
  uk: {
    home: {
      title: "Academik — Огляд Літератури та Академічна Бібліографія",
      description: "Шукайте наукові статті, створюйте бібліографії APA/Vancouver/MLA/Chicago, аналізуйте та синтезуйте академічні джерела.",
    },
    dashboard: {
      title: "Панель керування | Academik",
      description: "Керуйте збереженими бібліографічними пошуками та отримуйте доступ до академічного робочого простору.",
    },
    billing: {
      title: "Кредити та Оплата | Academik",
      description: "Купуйте кредити для використання ШІ-функцій Academik: пошук, аналіз та створення бібліографій.",
    },
    auth: {
      title: "Увійти | Academik",
      description: "Увійдіть до свого Academik для доступу до інструментів огляду літератури та бібліографії.",
    },
    revue: {
      title: "Огляд Літератури | Academik",
      description: "Виконайте бібліографічний пошук, аналізуйте статті та створюйте повний огляд літератури.",
    },
  },
  vi: {
    home: {
      title: "Academik — Xem xét Tài liệu và Thư mục Học thuật",
      description: "Tìm kiếm bài báo khoa học, tạo thư mục APA/Vancouver/MLA/Chicago, phân tích và tổng hợp nguồn học thuật.",
    },
    dashboard: {
      title: "Bảng điều khiển | Academik",
      description: "Quản lý các tìm kiếm thư mục đã lưu và truy cập không gian làm việc học thuật.",
    },
    billing: {
      title: "Tín dụng và Thanh toán | Academik",
      description: "Mua tín dụng để sử dụng các tính năng AI của Academik: tìm kiếm, phân tích và tạo thư mục.",
    },
    auth: {
      title: "Đăng nhập | Academik",
      description: "Đăng nhập vào Academik để truy cập công cụ xem xét tài liệu và thư mục.",
    },
    revue: {
      title: "Xem xét Tài liệu | Academik",
      description: "Thực hiện tìm kiếm thư mục, phân tích bài báo và tạo bản tổng hợp tài liệu hoàn chỉnh.",
    },
  },
  cs: {
    home: {
      title: "Academik — Přehled Literatury a Akademická Bibliografie",
      description: "Vyhledávejte vědecké články, generujte bibliografie APA/Vancouver/MLA/Chicago, analyzujte a syntetizujte akademické zdroje.",
    },
    dashboard: {
      title: "Přehled | Academik",
      description: "Spravujte uložená bibliografická vyhledávání a přistupujte ke svému akademickému pracovnímu prostoru.",
    },
    billing: {
      title: "Kredity a Fakturace | Academik",
      description: "Kupujte kredity pro používání AI funkcí Academiku: vyhledávání, analýza a generování bibliografií.",
    },
    auth: {
      title: "Přihlásit se | Academik",
      description: "Přihlaste se do Academiku pro přístup k nástrojům přehledu literatury a bibliografie.",
    },
    revue: {
      title: "Přehled Literatury | Academik",
      description: "Proveďte bibliografické vyhledávání, analyzujte články a generujte úplnou syntézu literatury.",
    },
  },
  el: {
    home: {
      title: "Academik — Βιβλιογραφική Ανασκόπηση και Ακαδημαϊκή Βιβλιογραφία",
      description: "Αναζητήστε επιστημονικά άρθρα, δημιουργήστε βιβλιογραφίες APA/Vancouver/MLA/Chicago, αναλύστε και συνθέστε τις ακαδημαϊκές σας πηγές.",
    },
    dashboard: {
      title: "Πίνακας ελέγχου | Academik",
      description: "Διαχειριστείτε τις αποθηκευμένες βιβλιογραφικές αναζητήσεις σας και αποκτήστε πρόσβαση στον ακαδημαϊκό χώρο εργασίας.",
    },
    billing: {
      title: "Πίστωση και Χρέωση | Academik",
      description: "Αγοράστε πίστωση για να χρησιμοποιήσετε τις λειτουργίες AI του Academik: αναζήτηση, ανάλυση και δημιουργία βιβλιογραφιών.",
    },
    auth: {
      title: "Σύνδεση | Academik",
      description: "Συνδεθείτε στο Academik για πρόσβαση στα εργαλεία βιβλιογραφικής ανασκόπησης.",
    },
    revue: {
      title: "Βιβλιογραφική Ανασκόπηση | Academik",
      description: "Πραγματοποιήστε βιβλιογραφική αναζήτηση, αναλύστε τα άρθρα σας και δημιουργήστε μια πλήρη σύνθεση λογοτεχνίας.",
    },
  },
  fi: {
    home: {
      title: "Academik — Kirjallisuuskatsaus ja Akateeminen Lähdeluettelo",
      description: "Etsi tieteellisiä artikkeleita, luo APA/Vancouver/MLA/Chicago-lähdeluetteloita, analysoi ja syntetisoi akateemiset lähteesi.",
    },
    dashboard: {
      title: "Kojelauta | Academik",
      description: "Hallitse tallennettuja bibliografisia hakujasi ja pääse käsiksi akateemiseen työtilaan.",
    },
    billing: {
      title: "Krediitit ja Laskutus | Academik",
      description: "Osta krediittejä käyttääksesi Academikin AI-ominaisuuksia: haku, analyysi ja lähdeluettelot.",
    },
    auth: {
      title: "Kirjaudu sisään | Academik",
      description: "Kirjaudu Academikiin päästäksesi kirjallisuuskatsaus- ja lähdeluettelotyökaluihin.",
    },
    revue: {
      title: "Kirjallisuuskatsaus | Academik",
      description: "Suorita bibliografinen haku, analysoi artikkelisi ja luo täydellinen kirjallisuuskatsaus.",
    },
  },
  he: {
    home: {
      title: "Academik — סקירת ספרות וביבליוגרפיה אקדמית",
      description: "חפש מאמרים מדעיים, צור ביבליוגרפיות APA/Vancouver/MLA/Chicago, נתח ותסכם את מקורותיך האקדמיים.",
    },
    dashboard: {
      title: "לוח בקרה | Academik",
      description: "נהל את חיפושי הביבליוגרפיה השמורים שלך וגש למרחב העבודה האקדמי שלך.",
    },
    billing: {
      title: "קרדיטים וחיוב | Academik",
      description: "רכוש קרדיטים לשימוש בתכונות הבינה המלאכותית של Academik: חיפוש, ניתוח ויצירת ביבליוגרפיות.",
    },
    auth: {
      title: "התחברות | Academik",
      description: "התחבר ל-Academik כדי לגשת לכלים לסקירת ספרות וביבליוגרפיה.",
    },
    revue: {
      title: "סקירת ספרות | Academik",
      description: "בצע חיפוש ביבליוגרפי, נתח את המאמרים שלך וצור סקירת ספרות מקיפה.",
    },
  },
  hu: {
    home: {
      title: "Academik — Irodalmi Áttekintés és Akadémiai Bibliográfia",
      description: "Keressen tudományos cikkeket, generáljon APA/Vancouver/MLA/Chicago bibliográfiákat, elemezze és szintetizálja akadémiai forrásait.",
    },
    dashboard: {
      title: "Irányítópult | Academik",
      description: "Kezelje elmentett bibliográfiai kereséseit és hozzáférjen az akadémiai munkaterületéhez.",
    },
    billing: {
      title: "Kreditek és Számlázás | Academik",
      description: "Vásároljon krediteket az Academik AI funkcióinak használatához: keresés, elemzés és bibliográfia generálás.",
    },
    auth: {
      title: "Bejelentkezés | Academik",
      description: "Jelentkezzen be az Academikba az irodalmi áttekintési és bibliográfiai eszközök eléréséhez.",
    },
    revue: {
      title: "Irodalmi Áttekintés | Academik",
      description: "Végezzen bibliográfiai keresést, elemezze cikkeit és generáljon teljes irodalmi szintézist.",
    },
  },
  da: {
    home: {
      title: "Academik — Litteraturgennemgang og Akademisk Bibliografi",
      description: "Søg videnskabelige artikler, generer APA/Vancouver/MLA/Chicago-bibliografier, analyser og syntetiser dine akademiske kilder.",
    },
    dashboard: {
      title: "Instrumentbræt | Academik",
      description: "Administrer dine gemte bibliografiske søgninger og få adgang til dit akademiske arbejdsområde.",
    },
    billing: {
      title: "Kreditter og Fakturering | Academik",
      description: "Køb kreditter for at bruge Academiks AI-funktioner: søgning, analyse og bibliografigenerering.",
    },
    auth: {
      title: "Log ind | Academik",
      description: "Log ind på Academik for at få adgang til litteraturgennemgangs- og bibliografiværktøjer.",
    },
    revue: {
      title: "Litteraturgennemgang | Academik",
      description: "Udfør en bibliografisk søgning, analyser dine artikler og generer en komplet litteratursyntese.",
    },
  },
  no: {
    home: {
      title: "Academik — Litteraturgjennomgang og Akademisk Bibliografi",
      description: "Søk vitenskapelige artikler, generer APA/Vancouver/MLA/Chicago-bibliografier, analyser og syntetiser dine akademiske kilder.",
    },
    dashboard: {
      title: "Instrumentpanel | Academik",
      description: "Administrer dine lagrede bibliografiske søk og få tilgang til ditt akademiske arbeidsområde.",
    },
    billing: {
      title: "Kreditter og Fakturering | Academik",
      description: "Kjøp kreditter for å bruke Academiks AI-funksjoner: søking, analyse og bibliografigenerering.",
    },
    auth: {
      title: "Logg inn | Academik",
      description: "Logg inn på Academik for å få tilgang til verktøy for litteraturgjennomgang og bibliografi.",
    },
    revue: {
      title: "Litteraturgjennomgang | Academik",
      description: "Utfør et bibliografisk søk, analyser artiklene dine og generer en fullstendig litteratursyntese.",
    },
  },
};

export function getSEO(lang: string, page: SEOPage): SEOData {
  const langData = seoTranslations[lang] ?? seoTranslations["en"];
  return langData[page] ?? seoTranslations["en"][page];
}
