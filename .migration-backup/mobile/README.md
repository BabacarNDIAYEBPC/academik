# Academik — Application Mobile (iOS & Android)

Application mobile Capacitor basée sur l'application web **academik.fr**.  
Détecte automatiquement la langue du téléphone parmi **27 langues**.

---

## 🌍 Langues supportées (27)

Français · English · Español · Português · Deutsch · Italiano · العربية · 中文 · 日本語 · Русский · Türkçe · 한국어 · Nederlands · Polski · Română · Svenska · हिन्दी · Bahasa Indonesia · Українська · Tiếng Việt · Čeština · Ελληνικά · Suomi · עברית · Magyar · Dansk · Norsk

---

## 📋 Prérequis

### Communs
- Node.js 18+
- Git

### Pour Android
- [Android Studio](https://developer.android.com/studio) (Hedgehog ou supérieur)
- JDK 17+
- SDK Android API 34
- [Compte Google Play Console](https://play.google.com/console) (25 $ une fois)

### Pour iOS (Mac uniquement)
- macOS Ventura ou supérieur
- Xcode 15+
- [Compte Apple Developer](https://developer.apple.com/) (99 $/an)
- CocoaPods : `sudo gem install cocoapods`

---

## 🚀 Installation et premier build

```bash
# 1. Depuis la racine du projet Academik
cd mobile
npm install

# 2. Builder l'app web
npm run build:web

# 3. Initialiser les plateformes natives
npx cap add android
npx cap add ios     # Mac uniquement

# 4. Générer les icônes (nécessite sharp)
npm run icons
```

---

## 🤖 Build Android (Google Play)

```bash
# Synchroniser et ouvrir Android Studio
npm run build:android
npm run open:android
```

Dans Android Studio :
1. **Build → Generate Signed Bundle / APK**
2. Choisir **Android App Bundle (.aab)**
3. Créer ou sélectionner le keystore de signature
4. Choisir `release` comme build variant
5. Le fichier `.aab` est généré dans `android/app/release/`

**Soumettre sur Google Play Console :**
- Production → Créer une release → Importer le `.aab`
- Remplir les métadonnées (voir `android/app-config.json`)

---

## 🍎 Build iOS (App Store) — Mac requis

```bash
# Synchroniser et ouvrir Xcode
npm run build:ios
npm run open:ios
```

Dans Xcode :
1. Sélectionner la target `App`
2. **Signing & Capabilities** → sélectionner votre Team (compte Apple Developer)
3. Bundle Identifier : `fr.academik.app`
4. **Product → Archive**
5. Dans Organizer → **Distribute App → App Store Connect**

**Soumettre sur App Store Connect :**
- Créer une nouvelle version dans App Store Connect
- Remplir les métadonnées (description, captures d'écran)
- Copier les clés de `ios/Info.plist.additions` dans `ios/App/App/Info.plist`
- Soumettre pour revue Apple

---

## 🎨 Icônes et Splash Screen

Les icônes sont générées automatiquement à partir du logo officiel `attached_assets/logo_academik_minimal.png`.

```bash
npm run icons
```

Fichiers générés :
- `resources/ios/AppIcon.appiconset/` — Toutes les tailles iOS (20px → 1024px)
- `resources/android/mipmap-*/` — Densités Android (mdpi → xxxhdpi)
- `resources/android/drawable-*/` — Splash screen Android
- `resources/ios/splash/` — Splash screen iOS (2732x2732)

Copier ensuite les ressources dans les dossiers natifs :
```bash
npx cap copy
```

---

## 📱 Configuration de l'app

| Paramètre | Valeur |
|-----------|--------|
| App ID | `fr.academik.app` |
| App Name | `Academik` |
| Version | `1.0.0` |
| Min Android SDK | API 22 (Android 5.1) |
| Min iOS | iOS 13.0 |
| Web source | `../dist/public` (build Vite) |

---

## 🔄 Mettre à jour l'app

Après chaque modification du code web :

```bash
# Depuis mobile/
npm run build:android   # ou build:ios
npx cap sync
```

---

## 🏗️ Structure du projet

```
mobile/
├── capacitor.config.ts      # Config principale Capacitor
├── package.json             # Dépendances npm
├── android/                 # Config Android (après npx cap add android)
│   ├── app-config.json      # Métadonnées Play Store
│   ├── strings.xml          # Chaînes Android
│   └── network_security_config.xml
├── ios/                     # Config iOS
│   └── Info.plist.additions # Clés à ajouter à Info.plist
├── resources/               # Assets générés (icônes, splash)
│   ├── android/
│   └── ios/
└── scripts/
    └── generate-icons.js    # Script de génération d'icônes
```

---

## 🌐 Détection automatique de la langue

L'app utilise `i18next-browser-languagedetector` qui lit automatiquement :
1. La langue sauvegardée (localStorage)
2. La langue du navigateur / système (navigator.language)
3. La balise HTML lang

Si la langue du téléphone n'est pas dans les 27 langues supportées, l'app bascule sur le **français** (langue par défaut).

---

## 📞 Support

**Email :** contact@bpc-ai.com  
**Site :** https://academik.fr
