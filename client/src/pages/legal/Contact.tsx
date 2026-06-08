import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Clock, ArrowLeft } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";

export default function Contact() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Contact — Academik";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", "Contactez l'équipe Academik pour toute question sur notre outil de recherche bibliographique par IA.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    (canonical as HTMLLinkElement).href = "https://academik.fr/contact";
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
        <h1 className="text-4xl font-bold mb-4">Nous contacter</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Une question, un problème technique, ou une demande commerciale ? Nous vous répondons sous 24h ouvrées.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Email</span>
            </div>
            <p className="text-muted-foreground text-sm">Pour toute demande générale, support ou partenariat :</p>
            <a href="mailto:contact@bpc-ai.com" className="font-medium text-primary hover:underline">
              contact@bpc-ai.com
            </a>
          </div>

          <div className="border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Délai de réponse</span>
            </div>
            <p className="text-muted-foreground text-sm">Nous traitons toutes les demandes sous :</p>
            <p className="font-medium">24 heures ouvrées</p>
          </div>

          <div className="border rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">Éditeur</span>
            </div>
            <p className="text-muted-foreground text-sm">Academik est édité par :</p>
            <p className="font-medium">Performance Consulting Groupe SAS</p>
          </div>
        </div>

        <div className="border rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-bold">Envoyer un message</h2>
          <p className="text-muted-foreground">
            Écrivez-nous directement à{" "}
            <a href="mailto:contact@bpc-ai.com" className="text-primary font-medium hover:underline">
              contact@bpc-ai.com
            </a>{" "}
            en précisant :
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Votre nom et prénom</li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> L'objet de votre demande</li>
            <li className="flex gap-2"><span className="text-primary font-bold">•</span> Votre identifiant de compte (si applicable)</li>
          </ul>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">Demandes spécifiques</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">Support technique</p>
                <p className="text-muted-foreground">contact@bpc-ai.com</p>
                <p className="text-xs text-muted-foreground mt-1">Objet : [SUPPORT]</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">Facturation & Crédits</p>
                <p className="text-muted-foreground">contact@bpc-ai.com</p>
                <p className="text-xs text-muted-foreground mt-1">Objet : [FACTURATION]</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">Droits RGPD</p>
                <p className="text-muted-foreground">contact@bpc-ai.com</p>
                <p className="text-xs text-muted-foreground mt-1">Objet : [RGPD]</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">Partenariats</p>
                <p className="text-muted-foreground">contact@bpc-ai.com</p>
                <p className="text-xs text-muted-foreground mt-1">Objet : [PARTENARIAT]</p>
              </div>
            </div>
          </div>
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
