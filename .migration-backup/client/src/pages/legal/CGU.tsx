import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";

export default function CGU() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Conditions Générales d'Utilisation — Academik";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", "Conditions générales d'utilisation de l'application Academik, outil de recherche bibliographique par IA.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    (canonical as HTMLLinkElement).href = "https://academik.fr/cgu";
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

      <main className="max-w-3xl mx-auto px-4 py-16 prose prose-sm max-w-none">
        <h1 className="text-4xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : juin 2025</p>

        <div className="space-y-10 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. Présentation du service</h2>
            <p>Academik (ci-après « le Service ») est une application web et mobile de recherche bibliographique académique assistée par intelligence artificielle, éditée par <strong>Performance Consulting Groupe SAS</strong> (ci-après « l'Éditeur »), accessible à l'adresse <a href="https://academik.fr" className="text-primary">https://academik.fr</a>.</p>
            <p className="mt-2">Le Service permet à ses utilisateurs de :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Rechercher des articles académiques sur des bases de données scientifiques</li>
              <li>Générer des bibliographies aux normes APA 7, Vancouver, MLA et Chicago</li>
              <li>Analyser et synthétiser des sources bibliographiques</li>
              <li>Générer des revues de littérature structurées</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Acceptation des conditions</h2>
            <p>L'utilisation du Service implique l'acceptation pleine et entière des présentes Conditions Générales d'Utilisation (CGU). Tout utilisateur qui ne souhaite pas accepter ces conditions doit s'abstenir d'utiliser le Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Accès au service</h2>
            <p>L'accès au Service nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. L'utilisateur est responsable de la confidentialité de ses identifiants de connexion.</p>
            <p className="mt-2">L'Éditeur se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU, sans préavis.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Système de crédits</h2>
            <p>Le Service fonctionne sur un système de crédits prépayés. Chaque action IA (recherche, analyse, synthèse, bibliographie) consomme 1 crédit. Les crédits sont achetés en packs via la page Facturation et ne sont pas remboursables, sauf cas de dysfonctionnement technique avéré imputable à l'Éditeur.</p>
            <p className="mt-2">Les crédits n'ont pas de date d'expiration tant que le compte utilisateur est actif.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Utilisation acceptable</h2>
            <p>L'utilisateur s'engage à utiliser le Service de manière licite et éthique. Sont notamment interdits :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Toute tentative de contournement du système de crédits</li>
              <li>L'utilisation du Service à des fins de plagiat académique</li>
              <li>Toute utilisation automatisée ou par script non autorisée</li>
              <li>La revente ou la mise à disposition du Service à des tiers</li>
              <li>Toute tentative d'accès non autorisé aux systèmes de l'Éditeur</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Propriété intellectuelle</h2>
            <p>L'ensemble des éléments constituant le Service (code source, interface, marques, logos, contenus) est la propriété exclusive de l'Éditeur ou de ses partenaires. Toute reproduction, représentation ou diffusion sans autorisation préalable est interdite.</p>
            <p className="mt-2">Les contenus générés par l'IA sont mis à disposition de l'utilisateur pour un usage personnel et académique non commercial. L'utilisateur reste responsable de l'usage qu'il fait des contenus générés.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Limitation de responsabilité</h2>
            <p>Le Service est fourni « tel quel ». L'Éditeur ne garantit pas l'exhaustivité, la précision ou l'actualité des résultats générés par l'IA. Les contenus produits par le Service ne sauraient se substituer à l'avis d'un professionnel ou remplacer une vérification académique rigoureuse.</p>
            <p className="mt-2">L'Éditeur ne pourra être tenu responsable des dommages indirects résultant de l'utilisation du Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Disponibilité du service</h2>
            <p>L'Éditeur s'efforce d'assurer la disponibilité du Service 24h/24 et 7j/7, mais ne peut garantir une disponibilité ininterrompue. Des interruptions pour maintenance peuvent survenir.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Suppression du compte</h2>
            <p>L'utilisateur peut supprimer son compte à tout moment depuis son tableau de bord (section Compte → Supprimer mon compte). La suppression entraîne la suppression définitive de toutes les données associées au compte, y compris les crédits non utilisés, sans remboursement possible.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Modification des CGU</h2>
            <p>L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles par email ou notification dans l'application. La poursuite de l'utilisation du Service après modification vaut acceptation des nouvelles conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Droit applicable et juridiction</h2>
            <p>Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents du ressort du siège social de l'Éditeur seront seuls compétents.</p>
          </section>

          <section className="border-t pt-6">
            <p className="text-muted-foreground">
              <strong>Éditeur :</strong> Performance Consulting Groupe SAS<br />
              <strong>Contact :</strong> <a href="mailto:contact@bpc-ai.com" className="text-primary">contact@bpc-ai.com</a>
            </p>
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
