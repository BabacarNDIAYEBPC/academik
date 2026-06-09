import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MapPin, Clock, ArrowLeft, CheckCircle, AlertCircle, Phone, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoUrl from "@assets/logo_academik_minimal.png";

const CATEGORIES = [
  { value: "Support technique", label: "🛠 Support technique" },
  { value: "Facturation & Crédits", label: "💳 Facturation & Crédits" },
  { value: "Droits RGPD", label: "🔒 Droits RGPD" },
  { value: "Partenariat", label: "🤝 Partenariat" },
  { value: "Autre", label: "💬 Autre" },
];

const HORAIRES = [
  { jour: "Lundi – Vendredi", heures: "9h00 – 18h00" },
  { jour: "Samedi", heures: "10h00 – 14h00" },
  { jour: "Dimanche", heures: "Fermé" },
];

export default function Contact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", category: "Support technique", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Contact — Academik";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    meta.setAttribute("content", "Contactez l'équipe Academik pour toute question sur notre outil de recherche bibliographique par IA.");
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    (canonical as HTMLLinkElement).href = "https://academik.fr/contact";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'envoi.");
      setSent(true);
      toast({ title: "Message envoyé !", description: "Nous vous répondrons sous 24 heures ouvrées." });
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src={logoUrl} alt="Academik" className="h-7 w-7" />
            <span className="font-bold text-lg">Academik</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Nous contacter</h1>
          <p className="text-muted-foreground text-lg">
            Une question, un problème technique, ou une demande commerciale ? Nous vous répondons sous 24h ouvrées.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Infos & Horaires — colonne gauche */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Mail className="w-4 h-4" />
                Email
              </div>
              <p className="text-sm text-muted-foreground">Pour toute demande :</p>
              <a href="mailto:contact@bpc-ai.com" className="font-medium text-primary hover:underline text-sm" data-testid="link-email">
                contact@bpc-ai.com
              </a>
            </div>

            <div className="border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Building className="w-4 h-4" />
                Éditeur
              </div>
              <p className="text-sm font-medium">Performance Consulting Groupe SAS</p>
              <p className="text-xs text-muted-foreground">SIRET : en cours d'enregistrement</p>
            </div>

            <div className="border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Clock className="w-4 h-4" />
                Horaires d'assistance
              </div>
              <div className="space-y-2">
                {HORAIRES.map((h) => (
                  <div key={h.jour} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{h.jour}</span>
                    <span className={`font-medium ${h.heures === "Fermé" ? "text-muted-foreground" : "text-foreground"}`}>
                      {h.heures}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  ⏱ Délai de réponse moyen : <strong className="text-foreground">24h ouvrées</strong>
                </p>
              </div>
            </div>

            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold mb-2">Demandes spécifiques</p>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Support technique", tag: "[SUPPORT]" },
                  { label: "Facturation", tag: "[FACTURATION]" },
                  { label: "Droits RGPD", tag: "[RGPD]" },
                  { label: "Partenariats", tag: "[PARTENARIAT]" },
                ].map((item) => (
                  <div key={item.tag} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-muted-foreground">{item.label}</span>
                    <code className="text-primary font-mono">{item.tag}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire — colonne droite */}
          <div className="lg:col-span-3">
            <div className="border rounded-xl p-6 md:p-8">
              {sent ? (
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold">Message envoyé !</h2>
                  <p className="text-muted-foreground">
                    Merci <strong>{form.name}</strong>, nous avons bien reçu votre message.<br />
                    Un email de confirmation a été envoyé à <strong>{form.email}</strong>.<br />
                    Nous vous répondrons sous <strong>24 heures ouvrées</strong>.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", category: "Support technique", subject: "", message: "" }); }}>
                      Envoyer un autre message
                    </Button>
                    <Button onClick={() => setLocation("/")}>Retour à l'accueil</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact">
                  <h2 className="text-xl font-bold mb-1">Envoyer un message</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Nom complet <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        data-testid="input-name"
                        placeholder="Jean Dupont"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="email"
                        type="email"
                        data-testid="input-email"
                        placeholder="jean@exemple.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger id="category" data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Sujet <span className="text-red-500">*</span></Label>
                    <Input
                      id="subject"
                      data-testid="input-subject"
                      placeholder="Ex : Problème de connexion, question sur les crédits..."
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="message"
                      data-testid="input-message"
                      placeholder="Décrivez votre demande en détail..."
                      className="min-h-[140px] resize-none"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground text-right">{form.message.length}/4000</p>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    data-testid="button-submit"
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    En soumettant ce formulaire, vous acceptez que vos données soient traitées conformément à notre{" "}
                    <a href="/rgpd" className="underline hover:text-primary">politique de confidentialité</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground mt-12">
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
