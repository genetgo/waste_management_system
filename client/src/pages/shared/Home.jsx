
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../constants/routes";
import About from "../shared/About";
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
    z-50
    inline-flex
    items-center
    gap-1
    bg-white
    rounded-xl
    p-1
    shadow-lg
    border
    border-gray-100
    whitespace-nowrap
  "
>
  {/* ENGLISH FIRST */}
  <button
    type="button"
    onClick={() => changeLanguage("EN")}
    className={`
      inline-flex
      items-center
      justify-center
      px-3
      py-2
      rounded-lg
      text-sm
      font-semibold
      whitespace-nowrap
      transition-all
      duration-200
      cursor-pointer
      ${
        i18n.language === "EN"
          ? "bg-emerald-600 text-white"
          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
      }
    `}
  >
    English
  </button>

  {/* AMHARIC SECOND */}
  <button
    type="button"
    onClick={() => changeLanguage("AM")}
    className={`
      inline-flex
      items-center
      justify-center
      px-3
      py-2
      rounded-lg
      text-sm
      font-semibold
      whitespace-nowrap
      transition-all
      duration-200
      cursor-pointer
      ${
        i18n.language === "AM"
          ? "bg-emerald-600 text-white"
          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
      }
    `}
  >
    አማርኛ
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
            BUTTONS - 2 x 2
        ========================================== */}
        <div
          className="
            grid
            grid-cols-2
            gap-3
            mt-8
            w-full
            max-w-2xl
            mx-auto
          "
        >
          {/* LOGIN */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="
              w-full
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
              w-full
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
            📝 {t("home.createAccount")}
          </button>

          {/* SCHEDULE VIEW */}
          <button
            type="button"
            onClick={() => navigate("/schedule")}
            className="
              w-full
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
              w-full
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
            💬 {t("home.feedback")}
          </button>
        </div>
{/* ABOUT */}
<div className="flex justify-center mt-3">
  <button
    type="button"
    onClick={() => navigate("/about")}
    className="
      px-5
      py-2.5
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
    ℹ️ {t("home.about")}
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
