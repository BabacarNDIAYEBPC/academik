import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";

export default function RGPD() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Politique de confidentialité (RGPD) — Academik";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", "Politique de confidentialité et protection des données personnelles de l'application Academik, conformément au RGPD.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    (canonical as HTMLLinkElement).href = "https://academik.fr/rgpd";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src={logoUrl} alt="Academik" className="h-7 w-7" />
            <span className="font-bold text-lg">Academik</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-2">Politique de confidentialité</h1>
        <p className="text-muted-foreground mb-2">Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679)</p>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : juin 2025</p>

        <div className="space-y-10 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. Responsable du traitement</h2>
            <div className="bg-muted/50 rounded-lg p-4">
              <p><strong>Performance Consulting Groupe SAS</strong><br />
              Éditeur de l'application Academik<br />
              Email DPO : <a href="mailto:contact@bpc-ai.com" className="text-primary">contact@bpc-ai.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Données collectées</h2>
            <p>Dans le cadre de l'utilisation du Service, nous collectons les données suivantes :</p>
            <div className="mt-4 space-y-3">
              <div className="border rounded-lg p-4">
                <p className="font-semibold">Données de compte</p>
                <p className="text-muted-foreground mt-1">Nom, prénom, adresse email — collectés lors de la création du compte via Replit Auth.</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold">Données d'utilisation</p>
                <p className="text-muted-foreground mt-1">Requêtes de recherche, bibliographies sauvegardées, historique des crédits consommés.</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold">Données de paiement</p>
                <p className="text-muted-foreground mt-1">Historique des transactions (montant, date, pack acheté). Les données de carte bancaire sont traitées exclusivement par Stripe et ne sont jamais stockées par Academik.</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="font-semibold">Données techniques</p>
                <p className="text-muted-foreground mt-1">Adresse IP, type de navigateur/appareil, langue du système — collectés automatiquement lors de la connexion.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Finalités du traitement</h2>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-primary">•</span> Fourniture du Service et gestion du compte utilisateur</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Traitement des paiements et gestion des crédits</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Envoi d'emails transactionnels (confirmation d'achat, bienvenue)</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Amélioration du Service et détection des abus</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Respect des obligations légales et fiscales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Base légale du traitement</h2>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Exécution du contrat</strong> : fourniture du Service</li>
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Intérêt légitime</strong> : amélioration et sécurité du Service</li>
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Obligation légale</strong> : conservation des données de facturation (10 ans)</li>
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Consentement</strong> : communications marketing (si applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Durée de conservation</h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left">Données</th>
                    <th className="border p-3 text-left">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-3">Données de compte</td><td className="border p-3">Durée du compte + 3 ans</td></tr>
                  <tr className="bg-muted/30"><td className="border p-3">Données d'utilisation</td><td className="border p-3">3 ans après dernière utilisation</td></tr>
                  <tr><td className="border p-3">Données de paiement</td><td className="border p-3">10 ans (obligation légale)</td></tr>
                  <tr className="bg-muted/30"><td className="border p-3">Logs techniques</td><td className="border p-3">12 mois</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec les sous-traitants suivants, dans la limite de leurs missions :</p>
            <ul className="space-y-2 mt-3">
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Stripe</strong> — traitement des paiements (USA, Privacy Shield)</li>
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>OpenAI</strong> — traitement IA des requêtes (USA, clauses contractuelles types)</li>
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Replit</strong> — hébergement de l'application (USA, clauses contractuelles types)</li>
              <li className="flex gap-2"><span className="text-primary">•</span> <strong>Google</strong> — analytiques (optionnel, avec consentement)</li>
            </ul>
            <p className="mt-3 text-muted-foreground">Vos données ne sont jamais vendues à des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Vos droits (RGPD)</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {[
                { right: "Droit d'accès", desc: "Obtenir une copie de vos données" },
                { right: "Droit de rectification", desc: "Corriger des données inexactes" },
                { right: "Droit à l'effacement", desc: "Supprimer vos données (droit à l'oubli)" },
                { right: "Droit à la portabilité", desc: "Recevoir vos données dans un format structuré" },
                { right: "Droit d'opposition", desc: "S'opposer au traitement de vos données" },
                { right: "Droit de limitation", desc: "Limiter le traitement de vos données" },
              ].map(({ right, desc }) => (
                <div key={right} className="border rounded-lg p-3">
                  <p className="font-semibold text-sm">{right}</p>
                  <p className="text-muted-foreground text-xs mt-1">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">Pour exercer vos droits, contactez-nous à : <a href="mailto:contact@bpc-ai.com" className="text-primary">contact@bpc-ai.com</a> (objet : [RGPD]). Nous répondons dans un délai maximum de 30 jours.</p>
            <p className="mt-2">Vous pouvez également supprimer votre compte directement depuis votre tableau de bord (Compte → Supprimer mon compte).</p>
            <p className="mt-2">En cas de réponse insatisfaisante, vous pouvez saisir la <strong>CNIL</strong> : <a href="https://www.cnil.fr" target="_blank" rel="noopener" className="text-primary">www.cnil.fr</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Cookies</h2>
            <p>Le Service utilise uniquement des cookies strictement nécessaires au fonctionnement (session d'authentification, préférence de langue). Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans votre consentement explicite.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Sécurité</h2>
            <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement HTTPS/TLS, hachage des mots de passe, accès restreint aux données, sauvegardes régulières.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Modifications</h2>
            <p>Cette politique peut être mise à jour. La date de dernière modification est indiquée en haut de cette page. Les modifications importantes vous seront notifiées par email.</p>
          </section>

        </div>
      </main>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6 mb-3 flex-wrap">
          <a href="/cgu" className="hover:text-foreground">CGU</a>
          <a href="/cgv" className="hover:text-foreground">CGV</a>
          <a href="/rgpd" className="hover:text-foreground">Politique de confidentialité</a>
          <a href="/contact" className="hover:text-foreground">Contact</a>
        </div>
        © {new Date().getFullYear()} Academik — Performance Consulting Groupe SAS
      </footer>
    </div>
  );
}
