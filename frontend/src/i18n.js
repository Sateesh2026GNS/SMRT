import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";

const LANGUAGE_MAP = {
  English: "en",
  Hindi: "hi",
  Tamil: "ta",
  Telugu: "te",
};

const REVERSE_MAP = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
};

export function getStoredLanguage() {
  try {
    const stored = localStorage.getItem("smrt-language");
    return stored && LANGUAGE_MAP[stored] ? LANGUAGE_MAP[stored] : "en";
  } catch {
    return "en";
  }
}

export function syncI18nFromStored() {
  const code = getStoredLanguage();
  if (i18n.language !== code) {
    i18n.changeLanguage(code);
  }
}

export function getDisplayLanguage(code) {
  return REVERSE_MAP[code] || "English";
}

export function getLanguageCode(displayName) {
  return LANGUAGE_MAP[displayName] || "en";
}

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, hi: { translation: hi }, ta: { translation: ta }, te: { translation: te } },
    lng: getStoredLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

i18n.on("languageChanged", (lng) => {
  try {
    const display = REVERSE_MAP[lng];
    if (display && localStorage.getItem("smrt-language") !== display) {
      localStorage.setItem("smrt-language", display);
    }
  } catch {}
});

export default i18n;
