import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getSEO, isRTL, type SEOPage } from "@/i18n/seo";

export function useSEO(page: SEOPage) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] ?? "fr";

  useEffect(() => {
    const seo = getSEO(lang, page);

    document.title = seo.title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", seo.description);
    setMeta('meta[property="og:title"]', "content", seo.title);
    setMeta('meta[property="og:description"]', "content", seo.description);
    setMeta('meta[name="twitter:title"]', "content", seo.title);
    setMeta('meta[name="twitter:description"]', "content", seo.description);

    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL(lang) ? "rtl" : "ltr";
  }, [lang, page]);
}
