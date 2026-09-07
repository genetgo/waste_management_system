import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("app_language", language);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => changeLanguage("AM")}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
          i18n.language === "AM"
            ? "bg-emerald-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50"
        }`}
      >
        አማርኛ
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("EN")}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
          i18n.language === "EN"
            ? "bg-emerald-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50"
        }`}
      >
        English
      </button>
    </div>
  );
}