import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface SEOProps {
  titleKey: string;
  descriptionKey?: string;
  keywordsKey?: string;
  canonicalPath?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function setMeta(attr: string, attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string, attrs?: Record<string, string>) {
  const selector = attrs
    ? `link[rel="${rel}"]${Object.entries(attrs).map(([k, v]) => `[${k}="${v}"]`).join("")}`
    : `link[rel="${rel}"]`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const BASE_URL = "https://academik.fr";
const OG_IMAGE = `${BASE_URL}/images/og-image.png`;

export function SEO({ titleKey, descriptionKey, keywordsKey, canonicalPath, ogType = "website", jsonLd }: SEOProps) {
  const { t, lang } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
    const title = t(titleKey);
    document.title = title;

    const description = descriptionKey ? t(descriptionKey) : "";
    const keywords = keywordsKey ? t(keywordsKey) : "";
    const canonical = canonicalPath ? `${BASE_URL}${canonicalPath}` : BASE_URL;

    if (description) {
      setMeta("name", "description", description);
    }
    if (keywords) {
      setMeta("name", "keywords", keywords);
    }

    setLink("canonical", canonical);

    setLink("alternate", canonical, { hreflang: "fr" });
    setLink("alternate", canonical, { hreflang: "en" });
    setLink("alternate", canonical, { hreflang: "x-default" });

    setMeta("property", "og:title", title);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:site_name", "Academik");
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:locale", lang === "fr" ? "fr_FR" : "en_US");
    setMeta("property", "og:locale:alternate", lang === "fr" ? "en_US" : "fr_FR");
    if (description) {
      setMeta("property", "og:description", description);
    }

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:image", OG_IMAGE);
    if (description) {
      setMeta("name", "twitter:description", description);
    }

    let scriptEl = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.setAttribute("type", "application/ld+json");
        scriptEl.setAttribute("data-seo-jsonld", "true");
        document.head.appendChild(scriptEl);
      }
      const jsonLdData = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      scriptEl.textContent = JSON.stringify(jsonLdData.length === 1 ? jsonLdData[0] : jsonLdData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [t, lang, titleKey, descriptionKey, keywordsKey, canonicalPath, ogType, jsonLd]);

  return null;
}
