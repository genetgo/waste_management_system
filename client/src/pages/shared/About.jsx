import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-emerald-700
        via-emerald-600
        to-green-500
        px-4
        sm:px-6
        py-8
      "
    >
      {/* ==========================================
          MAIN CONTAINER
      ========================================== */}
      <div
        className="
          w-full
          max-w-5xl
          mx-auto
          bg-white
          rounded-3xl
          shadow-2xl
          shadow-emerald-900/20
          border
          border-white/60
          p-6
          sm:p-8
          md:p-10
        "
      >
        {/* ==========================================
            BACK BUTTON
        ========================================== */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              bg-gray-100
              hover:bg-emerald-50
              text-gray-700
              hover:text-emerald-700
              font-semibold
              text-sm
              rounded-xl
              transition
              duration-200
            "
          >
            ← {t("about.backHome")}
          </button>
        </div>

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <div
              className="
                w-20
                h-20
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
              <span className="text-4xl">♻️</span>
            </div>
          </div>

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
            🌱 {t("about.badge")}
          </span>

          <h1
            className="
              mt-5
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              text-gray-900
              tracking-tight
            "
          >
            {t("about.title")}
          </h1>

          <p
            className="
              mt-3
              text-sm
              sm:text-base
              text-gray-500
              max-w-2xl
              mx-auto
              leading-7
            "
          >
            {t("about.description")}
          </p>
        </div>

        {/* ==========================================
            ABOUT DEBRE MARKOS
        ========================================== */}
        <div
          className="
            bg-emerald-50
            border
            border-emerald-100
            rounded-2xl
            p-6
            sm:p-7
            mb-5
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex-shrink-0
                w-12
                h-12
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                text-2xl
                shadow-sm
              "
            >
              🏙️
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-emerald-800
                  mb-3
                "
              >
                {t("about.debreMarkos.title")}
              </h2>

              <p className="text-sm text-gray-600 leading-7">
                {t("about.debreMarkos.paragraph1")}
              </p>

              <p className="text-sm text-gray-600 leading-7 mt-3">
                {t("about.debreMarkos.paragraph2")}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            ABOUT THE SYSTEM
        ========================================== */}
        <div
          className="
            bg-blue-50
            border
            border-blue-100
            rounded-2xl
            p-6
            sm:p-7
            mb-5
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex-shrink-0
                w-12
                h-12
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                text-2xl
                shadow-sm
              "
            >
              🗑️
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-blue-800
                  mb-3
                "
              >
                {t("about.system.title")}
              </h2>

              <p className="text-sm text-gray-600 leading-7">
                {t("about.system.paragraph1")}
              </p>

              <p className="text-sm text-gray-600 leading-7 mt-3">
                {t("about.system.paragraph2")}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            WHY THE SYSTEM
        ========================================== */}
        <div
          className="
            bg-amber-50
            border
            border-amber-100
            rounded-2xl
            p-6
            sm:p-7
            mb-5
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex-shrink-0
                w-12
                h-12
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                text-2xl
                shadow-sm
              "
            >
              💡
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-amber-800
                  mb-3
                "
              >
                {t("about.why.title")}
              </h2>

              <p className="text-sm text-gray-600 leading-7">
                {t("about.why.paragraph1")}
              </p>

              <p className="text-sm text-gray-600 leading-7 mt-3">
                {t("about.why.paragraph2")}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            MAIN GOAL
        ========================================== */}
        <div
          className="
            bg-green-50
            border
            border-green-100
            rounded-2xl
            p-6
            sm:p-7
            mb-5
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex-shrink-0
                w-12
                h-12
                rounded-xl
                bg-white
                flex
                items-center
                justify-center
                text-2xl
                shadow-sm
              "
            >
              🌱
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-green-800
                  mb-3
                "
              >
                {t("about.goal.title")}
              </h2>

              <p className="text-sm text-gray-600 leading-7">
                {t("about.goal.description")}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            SYSTEM USERS
        ========================================== */}
        <div
          className="
            bg-gray-50
            border
            border-gray-100
            rounded-2xl
            p-6
            sm:p-7
          "
        >
          <div className="text-center mb-6">
            <div className="text-3xl mb-3">👥</div>

            <h2 className="text-xl font-bold text-gray-800">
              {t("about.users.title")}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              {t("about.users.description")}
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-4
              gap-4
            "
          >
            {/* BUSINESS OWNER */}
            <div
              className="
                bg-white
                rounded-xl
                p-5
                border
                border-gray-100
                text-center
                shadow-sm
                hover:shadow-md
                transition
                duration-200
              "
            >
              <div className="text-3xl mb-3">🏢</div>

              <p className="text-sm font-semibold text-gray-700">
                {t("about.users.businessOwner")}
              </p>
            </div>

            {/* COLLECTOR */}
            <div
              className="
                bg-white
                rounded-xl
                p-5
                border
                border-gray-100
                text-center
                shadow-sm
                hover:shadow-md
                transition
                duration-200
              "
            >
              <div className="text-3xl mb-3">🚛</div>

              <p className="text-sm font-semibold text-gray-700">
                {t("about.users.collector")}
              </p>
            </div>

            {/* MUNICIPAL ADMIN */}
            <div
              className="
                bg-white
                rounded-xl
                p-5
                border
                border-gray-100
                text-center
                shadow-sm
                hover:shadow-md
                transition
                duration-200
              "
            >
              <div className="text-3xl mb-3">🏛️</div>

              <p className="text-sm font-semibold text-gray-700">
                {t("about.users.municipalAdmin")}
              </p>
            </div>

            {/* SYSTEM ADMIN */}
            <div
              className="
                bg-white
                rounded-xl
                p-5
                border
                border-gray-100
                text-center
                shadow-sm
                hover:shadow-md
                transition
                duration-200
              "
            >
              <div className="text-3xl mb-3">🔐</div>

              <p className="text-sm font-semibold text-gray-700">
                {t("about.users.systemAdmin")}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            FOOTER
        ========================================== */}
        <div
          className="
            text-center
            text-xs
            text-gray-400
            mt-8
            pt-5
            border-t
            border-gray-100
          "
        >
          {t("about.footer")}
        </div>
      </div>
    </div>
  );
};

export default About;