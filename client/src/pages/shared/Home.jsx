
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../constants/routes";

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // ==========================================
  // LANGUAGE SWITCH
  // ==========================================
  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem("app_language", language);
  };

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-emerald-700
        via-emerald-600
        to-green-500
        flex
        items-center
        justify-center
        px-4
        sm:px-6
        py-8
        relative
      "
    >
      {/* ==========================================
          LANGUAGE BUTTONS
      ========================================== */}
      <div
        className="
          absolute
          top-5
          right-5
          flex
          items-center
          gap-1
          bg-white
          rounded-xl
          p-1
          shadow-lg
        "
      >
        <button
          type="button"
          onClick={() => changeLanguage("AM")}
          className={`
            px-3
            py-1.5
            rounded-lg
            text-sm
            font-semibold
            transition
            ${
              i18n.language === "AM"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-emerald-50"
            }
          `}
        >
          አማርኛ
        </button>

        <button
          type="button"
          onClick={() => changeLanguage("EN")}
          className={`
            px-3
            py-1.5
            rounded-lg
            text-sm
            font-semibold
            transition
            ${
              i18n.language === "EN"
                ? "bg-emerald-600 text-white"
                : "text-gray-600 hover:bg-emerald-50"
            }
          `}
        >
          English
        </button>
      </div>

      {/* ==========================================
          MAIN CARD
      ========================================== */}
      <div
        className="
          w-full
          max-w-5xl
          bg-white
          rounded-3xl
          shadow-2xl
          shadow-emerald-900/20
          border
          border-white/60
          p-6
          sm:p-8
          md:p-10
          text-center
        "
      >
        {/* ==========================================
            LOGO
        ========================================== */}
        <div className="flex justify-center mb-6">
          <div
            className="
              w-20
              h-20
              sm:w-24
              sm:h-24
              rounded-full
              bg-emerald-50
              border-8
              border-emerald-100
              flex
              items-center
              justify-center
              shadow-sm
            "
          >
            <span className="text-4xl sm:text-5xl">
              ♻️
            </span>
          </div>
        </div>

        {/* ==========================================
            BADGE
        ========================================== */}
        <div className="flex justify-center">
          <span
            className="
              inline-flex
              items-center
              px-4
              py-1.5
              bg-emerald-50
              text-emerald-700
              text-xs
              sm:text-sm
              font-semibold
              rounded-full
              border
              border-emerald-100
            "
          >
            🌱 {t("home.badge")}
          </span>
        </div>

        {/* ==========================================
            TITLE
        ========================================== */}
        <div className="mt-5 space-y-3">
          <h1
            className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              text-gray-900
              tracking-tight
            "
          >
            {t("home.title")}
          </h1>

          <p
            className="
              text-sm
              sm:text-base
              text-gray-500
              max-w-md
              mx-auto
              leading-7
            "
          >
            {t("home.description")}
          </p>
        </div>

        {/* ==========================================
            WASTE COLLECTION
        ========================================== */}
        <div className="flex justify-center mt-8">
          <div
            className="
              w-full
              max-w-xs
              bg-emerald-50
              rounded-2xl
              p-5
              border
              border-emerald-100
            "
          >
            <div className="text-3xl mb-2">
              🗑️
            </div>

            <p className="text-sm font-semibold text-emerald-700">
              {t("home.wasteCollection")}
            </p>
          </div>
        </div>

        {/* ==========================================
            BUTTONS - HORIZONTAL
        ========================================== */}
        <div
          className="
            flex
            flex-row
            flex-wrap
            gap-3
            justify-center
            items-center
            mt-8
          "
        >
          {/* LOGIN */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              bg-emerald-600
              hover:bg-emerald-700
              active:bg-emerald-800
              text-white
              font-semibold
              text-sm
              rounded-xl
              shadow-lg
              shadow-emerald-600/20
              transition
              duration-200
              whitespace-nowrap
            "
          >
            🔐 {t("home.login")}
          </button>

          {/* CREATE ACCOUNT */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.REGISTER)}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              bg-white
              border
              border-gray-200
              hover:border-emerald-300
              hover:bg-emerald-50
              text-gray-700
              hover:text-emerald-700
              font-semibold
              text-sm
              rounded-xl
              transition
              duration-200
              whitespace-nowrap
            "
          >
            📝 {t("home.createAccount")}
          </button>

          {/* SCHEDULE VIEW */}
          <button
            type="button"
            onClick={() => navigate("/schedule")}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              bg-blue-600
              hover:bg-blue-700
              active:bg-blue-800
              text-white
              font-semibold
              text-sm
              rounded-xl
              shadow-lg
              shadow-blue-600/20
              transition
              duration-200
              whitespace-nowrap
            "
          >
            📅 {t("home.scheduleView")}
          </button>

          {/* FEEDBACK */}
          <button
            type="button"
            onClick={() => navigate("/feedback")}
            className="
              flex-1
              min-w-[180px]
              px-5
              py-3
              bg-amber-500
              hover:bg-amber-600
              active:bg-amber-700
              text-white
              font-semibold
              text-sm
              rounded-xl
              shadow-lg
              shadow-amber-500/20
              transition
              duration-200
              whitespace-nowrap
            "
          >
            💬 {t("home.feedback")}
          </button>
        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}
        <div
          className="
            text-xs
            text-gray-400
            mt-8
            pt-5
            border-t
            border-gray-100
          "
        >
          {t("home.footer")}
        </div>
      </div>
    </div>
  );
}
