import { useRoute, Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";

const COMPANY = "Performance Consulting Groupe SAS";
const SIREN = "913 540 944";
const ADDRESS = "3 Avenue de Toulouse, 66140 Canet-en-Roussillon, France";
const CAPITAL = "14 000 €";
const EMAIL = "contact@academik.fr";
const SITE = "academik.fr";

function CGV() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Conditions Générales de Vente (CGV)</h1>
      <p><em>Dernière mise à jour : 8 février 2026</em></p>

      <h2>Article 1 – Objet</h2>
      <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent les relations contractuelles entre {COMPANY}, société par actions simplifiée au capital de {CAPITAL}, immatriculée sous le SIREN {SIREN}, dont le siège social est situé au {ADDRESS} (ci-après « le Prestataire »), et toute personne physique ou morale souhaitant utiliser les services proposés sur la plateforme {SITE} (ci-après « le Client »).</p>

      <h2>Article 2 – Services</h2>
      <p>La plateforme Academik propose un logiciel d'aide méthodologique à la rédaction académique. Les services incluent :</p>
      <ul>
        <li>Génération de contenu assistée par intelligence artificielle</li>
        <li>Structuration et planification de travaux académiques</li>
        <li>Modules optionnels achetables individuellement ou par packs</li>
        <li>Export de documents aux formats Word et PDF</li>
      </ul>

      <h2>Article 3 – Prix et paiement</h2>
      <p>Les prix sont indiqués en euros (€) TTC. Le paiement s'effectue par carte bancaire via la plateforme sécurisée Stripe. Le Client est débité au moment de la validation de sa commande. Les prix peuvent être modifiés à tout moment, les commandes en cours restant aux prix convenus.</p>

      <h2>Article 4 – Droit de rétractation</h2>
      <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis sur un support immatériel dont l'exécution a commencé avec l'accord du consommateur. En acceptant les présentes CGV et en utilisant les services, le Client renonce expressément à son droit de rétractation dès l'utilisation du service.</p>

      <h2>Article 5 – Accès au service</h2>
      <p>L'accès au service est conditionné à la création d'un compte et à l'acceptation des présentes CGV. Le Prestataire s'engage à fournir un accès au service 24h/24, 7j/7, sous réserve des opérations de maintenance et des cas de force majeure.</p>

      <h2>Article 6 – Propriété intellectuelle</h2>
      <p>Le contenu généré par la plateforme est la propriété du Client. Toutefois, la plateforme, ses algorithmes, son code source, son design et sa documentation restent la propriété exclusive du Prestataire.</p>

      <h2>Article 7 – Responsabilité</h2>
      <p>Le Prestataire ne saurait être tenu responsable de l'utilisation faite par le Client des contenus générés. Le Client reste seul responsable de la vérification, de la validation et de l'utilisation de ces contenus dans le cadre de ses travaux académiques.</p>

      <h2>Article 8 – Données personnelles</h2>
      <p>Le traitement des données personnelles est régi par notre Politique de Confidentialité, accessible sur la plateforme. Le Prestataire s'engage à respecter le Règlement Général sur la Protection des Données (RGPD).</p>

      <h2>Article 9 – Litiges</h2>
      <p>Les présentes CGV sont régies par le droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux compétents de Perpignan seront compétents.</p>

      <h2>Article 10 – Contact</h2>
      <p>Pour toute question relative aux présentes CGV, le Client peut contacter le Prestataire à l'adresse : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
    </div>
  );
}

function TermsOfUse() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Conditions Générales d'Utilisation (CGU)</h1>
      <p><em>Dernière mise à jour : 8 février 2026</em></p>

      <h2>Article 1 – Présentation du service</h2>
      <p>Academik est une plateforme d'aide méthodologique à la rédaction académique éditée par {COMPANY}, SIREN {SIREN}, siège social : {ADDRESS}. La plateforme propose des outils de structuration, d'analyse et de rédaction pour les travaux académiques (mémoires, TFE, VAE, rapports de stage, etc.).</p>

      <h2>Article 2 – Acceptation des CGU</h2>
      <p>L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. L'utilisateur doit accepter ces conditions avant toute utilisation du service. Le refus d'acceptation entraîne l'impossibilité d'accéder au service.</p>

      <h2>Article 3 – Inscription et compte utilisateur</h2>
      <p>L'accès aux services nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants. Toute utilisation du compte est réputée faite par le titulaire.</p>

      <h2>Article 4 – Utilisation du service</h2>
      <p>L'utilisateur s'engage à :</p>
      <ul>
        <li>Utiliser le service uniquement comme outil d'aide méthodologique</li>
        <li>Ne pas utiliser le service pour produire des contenus destinés à se substituer intégralement à un travail académique personnel</li>
        <li>Respecter les règles d'intégrité académique de son établissement</li>
        <li>Ne pas tenter de contourner les limitations techniques du service</li>
        <li>Ne pas diffuser de contenus illicites, diffamatoires ou contraires à l'ordre public</li>
      </ul>

      <h2>Article 5 – Quotas et limitations</h2>
      <p>L'utilisation du service est soumise à des quotas (mots, actions, projets) qui varient selon les modules acquis. Les quotas non utilisés ne sont pas reportables d'une période à l'autre, sauf disposition contraire.</p>

      <h2>Article 6 – Propriété intellectuelle</h2>
      <p>La plateforme Academik, y compris ses textes, graphiques, logos, icônes, images, clips audio et logiciels, est la propriété exclusive de {COMPANY}. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.</p>

      <h2>Article 7 – Suspension et résiliation</h2>
      <p>Le Prestataire se réserve le droit de suspendre ou résilier le compte d'un utilisateur en cas de non-respect des présentes CGU, sans préavis ni indemnité.</p>

      <h2>Article 8 – Limitation de responsabilité</h2>
      <p>La plateforme est fournie « en l'état ». Le Prestataire ne garantit pas l'absence d'erreurs ou d'interruptions. L'utilisateur est seul responsable de l'utilisation des contenus générés. Le Prestataire ne pourra être tenu responsable des conséquences académiques, professionnelles ou autres découlant de l'utilisation du service.</p>

      <h2>Article 9 – Modification des CGU</h2>
      <p>Le Prestataire se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle. La continuation de l'utilisation du service après modification vaut acceptation des nouvelles CGU.</p>

      <h2>Article 10 – Droit applicable</h2>
      <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de Perpignan.</p>

      <h2>Contact</h2>
      <p>Pour toute question : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>Politique de Confidentialité et Protection des Données (RGPD)</h1>
      <p><em>Dernière mise à jour : 8 février 2026</em></p>

      <h2>1. Responsable du traitement</h2>
      <p>{COMPANY}, SIREN {SIREN}<br/>Siège social : {ADDRESS}<br/>Contact : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>

      <h2>2. Données collectées</h2>
      <p>Nous collectons les données suivantes :</p>
      <ul>
        <li><strong>Données d'identification :</strong> nom, prénom, adresse email, photo de profil (via l'authentification)</li>
        <li><strong>Données d'utilisation :</strong> contenus des projets académiques, historique des versions, paramètres de configuration</li>
        <li><strong>Données de paiement :</strong> informations de transaction (traitées par Stripe, nous ne stockons pas les numéros de carte)</li>
        <li><strong>Données techniques :</strong> adresse IP, type de navigateur, pages visitées, durée de visite</li>
        <li><strong>Cookies :</strong> cookies techniques et analytiques (voir section Cookies)</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Les données sont traitées pour :</p>
      <ul>
        <li>La fourniture et l'amélioration du service</li>
        <li>La gestion des comptes utilisateurs</li>
        <li>Le traitement des paiements et la facturation</li>
        <li>L'envoi de communications transactionnelles (confirmations, factures)</li>
        <li>L'envoi de communications commerciales (avec consentement)</li>
        <li>L'analyse statistique et l'amélioration de la plateforme</li>
        <li>La détection et la prévention de la fraude</li>
      </ul>

      <h2>4. Base légale du traitement</h2>
      <ul>
        <li><strong>Exécution du contrat :</strong> gestion du compte, fourniture du service, paiement</li>
        <li><strong>Consentement :</strong> cookies analytiques et marketing, communications commerciales</li>
        <li><strong>Intérêt légitime :</strong> amélioration du service, sécurité, prévention de la fraude</li>
        <li><strong>Obligation légale :</strong> conservation des factures, lutte contre la fraude</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>Données de compte : durée de la relation contractuelle + 3 ans</li>
        <li>Données de facturation : 10 ans (obligation légale)</li>
        <li>Cookies : 13 mois maximum</li>
        <li>Données de navigation : 26 mois</li>
      </ul>

      <h2>6. Destinataires des données</h2>
      <p>Vos données peuvent être transmises à :</p>
      <ul>
        <li><strong>Stripe :</strong> traitement des paiements (certifié PCI-DSS)</li>
        <li><strong>OpenAI :</strong> traitement des requêtes de génération de contenu</li>
        <li><strong>Resend :</strong> envoi des emails transactionnels</li>
        <li><strong>Replit :</strong> hébergement de la plateforme</li>
      </ul>

      <h2>7. Transferts internationaux</h2>
      <p>Certains sous-traitants sont situés aux États-Unis. Les transferts sont encadrés par les clauses contractuelles types de la Commission européenne et/ou le cadre de protection des données UE-US.</p>

      <h2>8. Vos droits (RGPD)</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
        <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
        <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
        <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
        <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
        <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
        <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
      </ul>
      <p>Pour exercer ces droits, contactez-nous à : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>

      <h2>9. Cookies</h2>
      <p>Notre plateforme utilise des cookies :</p>
      <ul>
        <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (session, authentification, préférences). Ils ne nécessitent pas de consentement.</li>
        <li><strong>Cookies analytiques :</strong> analyse de la fréquentation et du comportement des utilisateurs pour améliorer le service. Soumis à consentement.</li>
        <li><strong>Cookies marketing :</strong> suivi des campagnes publicitaires et personnalisation. Soumis à consentement.</li>
      </ul>
      <p>Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de consentement.</p>

      <h2>10. Sécurité</h2>
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des données en transit (HTTPS/TLS), stockage sécurisé des mots de passe, accès restreint aux données, surveillance des accès.</p>

      <h2>11. Réclamation</h2>
      <p>Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>

      <h2>12. Contact</h2>
      <p>{COMPANY}<br/>{ADDRESS}<br/>Email : <a href={`mailto:${EMAIL}`}>{EMAIL}</a><br/>SIREN : {SIREN}</p>
    </div>
  );
}

const PAGES: Record<string, { component: () => JSX.Element; titleFr: string; titleEn: string }> = {
  cgv: { component: CGV, titleFr: "Conditions Générales de Vente", titleEn: "Terms of Sale" },
  cgu: { component: TermsOfUse, titleFr: "Conditions Générales d'Utilisation", titleEn: "Terms of Use" },
  "politique-de-confidentialite": { component: PrivacyPolicy, titleFr: "Politique de Confidentialité", titleEn: "Privacy Policy" },
};

export default function Legal() {
  const [, params] = useRoute("/legal/:page");
  const { lang } = useI18n();
  const page = params?.page || "";
  const pageConfig = PAGES[page];

  if (!pageConfig) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Page non trouvée</h1>
          <Link href="/">
            <Button variant="outline" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Retour à l'accueil" : "Back to home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const PageComponent = pageConfig.component;
  const title = lang === "fr" ? pageConfig.titleFr : pageConfig.titleEn;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        titleKey=""
        directTitle={`${title} | Academik`}
        directDescription={title}
      />
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-legal">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Retour" : "Back"}
            </Button>
          </Link>
        </div>
        <PageComponent />
      </div>
    </div>
  );
}