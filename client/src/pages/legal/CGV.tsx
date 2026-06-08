import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";

export default function CGV() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Conditions Générales de Vente — Academik";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", "Conditions générales de vente des packs de crédits Academik — Starter, Essentiel et Pro.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    (canonical as HTMLLinkElement).href = "https://academik.fr/cgv";
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
        <h1 className="text-4xl font-bold mb-2">Conditions Générales de Vente</h1>
        <p className="text-muted-foreground mb-10">Dernière mise à jour : juin 2025</p>

        <div className="space-y-10 text-sm leading-relaxed text-foreground">

          <section>
            <h2 className="text-xl font-bold mb-3">1. Vendeur</h2>
            <p>Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les ventes de crédits conclues entre :</p>
            <div className="bg-muted/50 rounded-lg p-4 mt-3">
              <p><strong>Performance Consulting Groupe SAS</strong><br />
              Éditeur de l'application Academik<br />
              Email : <a href="mailto:contact@bpc-ai.com" className="text-primary">contact@bpc-ai.com</a></p>
            </div>
            <p className="mt-3">Et tout utilisateur (ci-après « le Client ») souhaitant acheter des crédits via la plateforme Academik.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Produits proposés à la vente</h2>
            <p>Academik propose des packs de crédits permettant d'utiliser les fonctionnalités IA du Service :</p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-3 text-left">Pack</th>
                    <th className="border p-3 text-left">Crédits</th>
                    <th className="border p-3 text-left">Prix TTC</th>
                    <th className="border p-3 text-left">Prix / crédit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Starter</td>
                    <td className="border p-3">10 crédits</td>
                    <td className="border p-3">4,99 €</td>
                    <td className="border p-3">0,50 € / crédit</td>
                  </tr>
                  <tr className="bg-muted/30">
                    <td className="border p-3">Essentiel</td>
                    <td className="border p-3">30 crédits</td>
                    <td className="border p-3">11,99 €</td>
                    <td className="border p-3">0,40 € / crédit</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Pro</td>
                    <td className="border p-3">100 crédits</td>
                    <td className="border p-3">29,99 €</td>
                    <td className="border p-3">0,30 € / crédit</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-muted-foreground">Prix indiqués TTC. TVA applicable selon la législation en vigueur.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Processus de commande</h2>
            <p>La commande s'effectue en ligne via la page Facturation de l'application Academik. Le Client choisit un pack, procède au paiement sécurisé via Stripe, et les crédits sont crédités immédiatement sur son compte après confirmation du paiement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Paiement</h2>
            <p>Le paiement est effectué en ligne par carte bancaire via la solution sécurisée <strong>Stripe</strong>. Les transactions sont chiffrées (SSL/TLS). L'Éditeur ne conserve aucune donnée de carte bancaire.</p>
            <p className="mt-2">Le paiement est exigible immédiatement à la commande. La commande n'est validée qu'après confirmation du paiement par Stripe.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Livraison</h2>
            <p>Les crédits achetés sont délivrés immédiatement sur le compte de l'utilisateur après confirmation du paiement. Il n'y a pas de délai de livraison pour les biens numériques.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Droit de rétractation</h2>
            <p>Conformément à l'article L221-28 du Code de la Consommation, le droit de rétractation ne s'applique pas aux contenus numériques dont l'exécution a commencé avec l'accord préalable du consommateur.</p>
            <p className="mt-2">En procédant au paiement, le Client reconnaît expressément renoncer à son droit de rétractation dès lors que les crédits sont crédités sur son compte et utilisables immédiatement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Non-remboursement</h2>
            <p>Les crédits achetés ne sont pas remboursables, sauf en cas de dysfonctionnement technique avéré imputable exclusivement à l'Éditeur, signalé dans les 30 jours suivant l'achat à l'adresse <a href="mailto:contact@bpc-ai.com" className="text-primary">contact@bpc-ai.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Durée de validité des crédits</h2>
            <p>Les crédits n'ont pas de date d'expiration tant que le compte utilisateur est actif. En cas de suppression du compte, les crédits non utilisés sont définitivement perdus sans remboursement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Facturation</h2>
            <p>Une facture électronique est disponible dans l'espace « Facturation » de l'application après chaque achat. Le Client peut la télécharger à tout moment.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Réclamations</h2>
            <p>Pour toute réclamation relative à un achat, le Client peut contacter l'Éditeur à l'adresse <a href="mailto:contact@bpc-ai.com" className="text-primary">contact@bpc-ai.com</a> en précisant son identifiant de commande.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Droit applicable</h2>
            <p>Les présentes CGV sont soumises au droit français. En cas de litige non résolu à l'amiable, les tribunaux compétents du ressort du siège social de l'Éditeur seront seuls compétents.</p>
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
