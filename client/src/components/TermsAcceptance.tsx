import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { ShieldCheck, ExternalLink } from "lucide-react";

const TERMS_ACCEPTED_KEY = "academik_terms_accepted";

function getTermsAccepted(): boolean {
  try {
    return localStorage.getItem(TERMS_ACCEPTED_KEY) === "true";
  } catch {
    return false;
  }
}

export default function TermsAcceptance({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  const [accepted, setAccepted] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAccepted(getTermsAccepted());
  }, []);

  const handleAccept = () => {
    localStorage.setItem(TERMS_ACCEPTED_KEY, "true");
    setAccepted(true);
  };

  const handleDecline = () => {
    window.location.href = "https://academik.fr";
  };

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" data-testid="terms-acceptance-overlay">
        <Card className="max-w-lg w-full shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">
            {lang === "fr" ? "Acceptation des conditions" : "Terms Acceptance"}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {lang === "fr"
              ? "Pour utiliser Academik, vous devez accepter nos conditions d'utilisation et notre politique de confidentialité."
              : "To use Academik, you must accept our terms of use and privacy policy."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <Link href="/legal/cgu" className="flex items-center gap-2 text-sm text-primary hover:underline" data-testid="link-terms-cgu">
              <ExternalLink className="w-4 h-4 shrink-0" />
              {lang === "fr" ? "Conditions Générales d'Utilisation (CGU)" : "Terms of Use"}
            </Link>
            <Link href="/legal/cgv" className="flex items-center gap-2 text-sm text-primary hover:underline" data-testid="link-terms-cgv">
              <ExternalLink className="w-4 h-4 shrink-0" />
              {lang === "fr" ? "Conditions Générales de Vente (CGV)" : "Terms of Sale"}
            </Link>
            <Link href="/legal/politique-de-confidentialite" className="flex items-center gap-2 text-sm text-primary hover:underline" data-testid="link-terms-privacy">
              <ExternalLink className="w-4 h-4 shrink-0" />
              {lang === "fr" ? "Politique de Confidentialité (RGPD)" : "Privacy Policy (GDPR)"}
            </Link>
          </div>

          <label className="flex items-start gap-3 cursor-pointer" data-testid="label-terms-checkbox">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 rounded"
              data-testid="checkbox-accept-terms"
            />
            <span className="text-sm leading-relaxed">
              {lang === "fr"
                ? "J'ai lu et j'accepte les Conditions Générales d'Utilisation, les Conditions Générales de Vente et la Politique de Confidentialité d'Academik."
                : "I have read and accept the Terms of Use, Terms of Sale, and Privacy Policy of Academik."}
            </span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
              data-testid="button-decline-terms"
            >
              {lang === "fr" ? "Refuser" : "Decline"}
            </Button>
            <Button
              className="flex-1"
              disabled={!checked}
              onClick={handleAccept}
              data-testid="button-accept-terms"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {lang === "fr" ? "Accepter" : "Accept"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}