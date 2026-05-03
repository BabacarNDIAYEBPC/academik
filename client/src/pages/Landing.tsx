import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { BookOpen, Search, FileText, GitCompare, Zap, Shield, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CREDIT_PACKS } from "@shared/schema";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Landing() {
  const { t } = useTranslation();
  useSEO("home");
  const handleLogin = () => { window.location.href = "/connexion"; };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">{t("app_name")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button onClick={handleLogin} size="sm" data-testid="button-login">
              {t("start_free")}
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">{t("hero_badge")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t("hero_title_1")}{" "}
            <span className="gradient-text">{t("hero_title_2")}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {t("hero_desc")}
          </p>
          <Button size="lg" onClick={handleLogin} className="gap-2" data-testid="button-hero-cta">
            {t("hero_cta")} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">{t("features_title")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: t("feature1_title"), desc: t("feature1_desc") },
              { icon: FileText, title: t("feature2_title"), desc: t("feature2_desc") },
              { icon: GitCompare, title: t("feature3_title"), desc: t("feature3_desc") },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">{t("pricing_title")}</h2>
            <p className="text-muted-foreground">{t("pricing_desc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack, i) => (
              <Card key={pack.id} className={`card-hover relative ${i === 1 ? "border-primary shadow-md" : ""}`}>
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">{t("popular")}</Badge>
                  </div>
                )}
                <CardContent className="pt-6 text-center">
                  <h3 className="font-bold text-lg mb-1">{pack.label}</h3>
                  <div className="text-3xl font-bold my-3">{pack.price} €</div>
                  <p className="text-muted-foreground text-sm mb-4">{pack.credits} {t("credits")}</p>
                  <div className="space-y-2 text-sm text-left mb-6">
                    {[t("feature_articles"), t("feature_analyses"), t("feature_bib")].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant={i === 1 ? "default" : "outline"} onClick={handleLogin} data-testid={`button-pack-${pack.id}`}>
                    {t("choose_pack")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            {t("credits_note")}
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-muted/30 border-t">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          {[{ icon: Shield, key: "trust_secure" }, { icon: Zap, key: "trust_fast" }, { icon: BookOpen, key: "trust_academic" }].map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{t(key)}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} {t("app_name")} — Performance Consulting Groupe SAS
      </footer>
    </div>
  );
}
