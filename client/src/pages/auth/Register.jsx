
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBuilding } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import ROUTES from "../../constants/routes";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-br
        from-green-700
        via-green-600
        to-emerald-500
        flex
        items-center
        justify-center
        px-4
        sm:px-6
        py-8
        sm:py-12
      "
    >
      <div
        className="
          bg-white
          w-full
          max-w-3xl
          rounded-2xl
          sm:rounded-3xl
          shadow-2xl
          p-5
          sm:p-8
          md:p-10
        "
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="text-center mb-7 sm:mb-10">
          <h1
            className="
              text-2xl
              sm:text-3xl
              md:text-4xl
              font-bold
              text-gray-800
            "
          >
            {t("register.title")}
          </h1>

          <p
            className="
              text-sm
              sm:text-base
              text-gray-500
              mt-2
              sm:mt-3
            "
          >
            {t("register.subtitle")}
          </p>
        </div>

        {/* ==========================================
            ACCOUNT TYPE CARDS
        ========================================== */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
            sm:gap-6
          "
        >
          {/* ========================================
              RESIDENT
          ======================================== */}

          <div
            onClick={() =>
              navigate(ROUTES.RESIDENT_REGISTER)
            }
            className="
              cursor-pointer
              border-2
              border-green-100
              rounded-2xl
              p-5
              sm:p-7
              md:p-8
              hover:border-green-600
              hover:shadow-xl
              transition
              duration-300
              flex
              flex-col
              items-center
            "
          >
            {/* ICON */}

            <div className="flex justify-center">
              <div
                className="
                  bg-green-100
                  p-4
                  sm:p-5
                  rounded-full
                "
              >
                <FaUser
                  className="
                    text-4xl
                    sm:text-5xl
                    text-green-600
                  "
                />
              </div>
            </div>

            {/* TITLE */}

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-center
                mt-4
                sm:mt-5
              "
            >
              {t("register.resident.title")}
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                text-center
                text-sm
                sm:text-base
                text-gray-500
                mt-2
                sm:mt-3
                leading-6
              "
            >
              {t("register.resident.description")}
            </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.RESIDENT_REGISTER);
              }}
              className="
                mt-6
                sm:mt-8
                w-fit
                mx-auto
                bg-green-600
                hover:bg-green-700
                text-white
                px-5
                sm:px-6
                py-3
                rounded-xl
                font-semibold
                text-sm
                sm:text-base
                transition
                duration-200
                text-center
              "
            >
              {t("register.resident.button")}
            </button>
          </div>

          {/* ========================================
              BUSINESS OWNER
          ======================================== */}

          <div
            onClick={() =>
              navigate(ROUTES.BUSINESS_REGISTER)
            }
            className="
              cursor-pointer
              border-2
              border-blue-100
              rounded-2xl
              p-5
              sm:p-7
              md:p-8
              hover:border-blue-600
              hover:shadow-xl
              transition
              duration-300
              flex
              flex-col
              items-center
            "
          >
            {/* ICON */}

            <div className="flex justify-center">
              <div
                className="
                  bg-blue-100
                  p-4
                  sm:p-5
                  rounded-full
                "
              >
                <FaBuilding
                  className="
                    text-4xl
                    sm:text-5xl
                    text-blue-600
                  "
                />
              </div>
            </div>

            {/* TITLE */}

            <h2
              className="
                text-xl
                sm:text-2xl
                font-bold
                text-center
                mt-4
                sm:mt-5
              "
            >
              {t("register.business.title")}
            </h2>

            {/* DESCRIPTION */}

            <p
              className="
                text-center
                text-sm
                sm:text-base
                text-gray-500
                mt-2
                sm:mt-3
                leading-6
              "
            >
              {t("register.business.description")}
            </p>

            {/* BUTTON */}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.BUSINESS_REGISTER);
              }}
              className="
                mt-6
                sm:mt-8
                w-fit
                mx-auto
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-5
                sm:px-6
                py-3
                rounded-xl
                font-semibold
                text-sm
                sm:text-base
                transition
                duration-200
                text-center
              "
            >
              {t("register.business.button")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
