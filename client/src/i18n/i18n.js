import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import amTranslation from "./am.json";
import enTranslation from "./en.json";

const resources = {
  AM: {
    translation: amTranslation,
  },
  EN: {
    translation: enTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,

    lng: localStorage.getItem("app_language") || "AM",

    fallbackLng: "AM",

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;