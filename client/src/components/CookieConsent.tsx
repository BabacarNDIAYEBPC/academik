import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Cookie, Settings2, Check } from "lucide-react";

const COOKIE_CONSENT_KEY = "academik_cookie_consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

function getStoredConsent(): CookiePreferences | null {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const thirteenMonths = 13 * 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp < thirteenMonths) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

function setStoredConsent(prefs: CookiePreferences) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
}

export function getCookieConsent(): CookiePreferences | null {
  return getStoredConsent();
}

export default function CookieConsent() {
  const { lang } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs: CookiePreferences = { essential: true, analytics: true, marketing: true, timestamp: Date.now() };
    setStoredConsent(prefs);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const prefs: CookiePreferences = { essential: true, analytics: false, marketing: false, timestamp: Date.now() };
    setStoredConsent(prefs);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    const prefs: CookiePreferences = { essential: true, analytics, marketing, timestamp: Date.now() };
    setStoredConsent(prefs);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4" data-testid="cookie-consent-banner">
      <Card className="max-w-2xl mx-auto shadow-lg border-2 border-border">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Cookie className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                {lang === "fr" ? "Gestion des cookies" : "Cookie Management"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lang === "fr"
                  ? "Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser les contenus. Vous pouvez accepter tous les cookies ou personnaliser vos préférences."
                  : "We use cookies to improve your experience, analyze traffic, and personalize content. You can accept all cookies or customize your preferences."}
                {" "}
                <Link href="/legal/politique-de-confidentialite" className="underline text-primary">
                  {lang === "fr" ? "Politique de confidentialité" : "Privacy Policy"}
                </Link>
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="space-y-3 border-t border-border pt-3">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked disabled className="rounded" />
                <div>
                  <span className="font-medium">{lang === "fr" ? "Essentiels" : "Essential"}</span>
                  <p className="text-xs text-muted-foreground">
                    {lang === "fr" ? "Nécessaires au fonctionnement du site (session, authentification)." : "Required for site functionality (session, authentication)."}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer" data-testid="cookie-analytics-toggle">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="rounded" />
                <div>
                  <span className="font-medium">{lang === "fr" ? "Analytiques" : "Analytics"}</span>
                  <p className="text-xs text-muted-foreground">
                    {lang === "fr" ? "Analyse du trafic et du comportement pour améliorer le service." : "Traffic and behavior analysis to improve the service."}
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer" data-testid="cookie-marketing-toggle">
                <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="rounded" />
                <div>
                  <span className="font-medium">{lang === "fr" ? "Marketing" : "Marketing"}</span>
                  <p className="text-xs text-muted-foreground">
                    {lang === "fr" ? "Suivi des campagnes publicitaires et personnalisation." : "Ad campaign tracking and personalization."}
                  </p>
                </div>
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {showDetails ? (
              <Button size="sm" onClick={handleSavePreferences} data-testid="button-save-cookies">
                <Check className="w-3.5 h-3.5 mr-1" />
                {lang === "fr" ? "Enregistrer" : "Save"}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowDetails(true)} data-testid="button-customize-cookies">
                <Settings2 className="w-3.5 h-3.5 mr-1" />
                {lang === "fr" ? "Personnaliser" : "Customize"}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleRejectAll} data-testid="button-reject-cookies">
              {lang === "fr" ? "Refuser" : "Reject"}
            </Button>
            <Button size="sm" onClick={handleAcceptAll} data-testid="button-accept-cookies">
              {lang === "fr" ? "Tout accepter" : "Accept All"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}