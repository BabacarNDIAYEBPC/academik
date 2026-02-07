import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface SEOProps {
  titleKey: string;
  descriptionKey?: string;
  keywordsKey?: string;
}

export function SEO({ titleKey, descriptionKey, keywordsKey }: SEOProps) {
  const { t, lang } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t(titleKey);

    if (descriptionKey) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", t(descriptionKey));
    }

    if (keywordsKey) {
      let meta = document.querySelector('meta[name="keywords"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "keywords");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", t(keywordsKey));
    }

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", t(titleKey));

    if (descriptionKey) {
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute("content", t(descriptionKey));
    }
  }, [t, lang, titleKey, descriptionKey, keywordsKey]);

  return null;
}
