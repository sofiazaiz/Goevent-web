import { createContext, useContext } from "react";
import { useRouter } from "next/router";

import fr from "../messages/fr.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import de from "../messages/de.json";
import pt from "../messages/pt.json";
import nl from "../messages/nl.json";
import ar from "../messages/ar.json";

const translations = {
  fr,
  en,
  es,
  de,
  pt,
  nl,
  ar
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const { locale } = useRouter();

  const t = (key) => {
    return translations[locale]?.[key] || translations.fr[key] || key;
  };

  return (
    <I18nContext.Provider value={{ t, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}