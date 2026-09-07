
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import scheduleService from "../../services/scheduleService";

import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const Schedule = () => {
  // =====================================================
  // TRANSLATION
  // =====================================================
  const { t } = useTranslation();

  // =====================================================
  // STATES
  // =====================================================
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD SCHEDULES
  // =====================================================
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await scheduleService.getMySchedule();

        console.log("Business Schedule Response:", response);

        if (response.success) {
          setSchedules(response.data);
        }
      } catch (error) {
        console.error("Business Schedule Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <ErrorBoundary>
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("schedule.title")}
          </h1>

          <p className="text-sm text-gray-500">
            {t("schedule.subtitle")}
          </p>
        </div>

        {/* =================================================
            EMPTY
        ================================================= */}
        {schedules.length === 0 ? (
          <Card className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-3">
              📅
            </div>

            {t("schedule.empty")}
          </Card>
        ) : (

          /* =================================================
             SCHEDULE CARDS
          ================================================= */
          <div className="grid md:grid-cols-2 gap-5">

            {schedules.map((schedule) => (

              <Card
                key={schedule.schedule_id}
                className="p-5 shadow-sm hover:shadow-lg transition"
              >

                {/* =================================================
                    TOP
                ================================================= */}
                <div className="flex justify-between">

                  <div>
                    <h2 className="font-bold text-lg text-blue-700">
                      {schedule.day_of_week}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {schedule.frequency}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      schedule.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {schedule.status === "ACTIVE"
                      ? t("schedule.status.active")
                      : t("schedule.status.inactive")}
                  </span>

                </div>

                {/* =================================================
                    SCHEDULE INFORMATION
                ================================================= */}
                <div className="mt-5 space-y-3 text-sm">

                  {/* KIFLE KETEMA */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.kifleKetema")}
                    </span>

                    <span className="font-bold">
                      {schedule.kifle_ketema ||
                        t("schedule.common.notAvailable")}
                    </span>
                  </div>

                  {/* KEBELE */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.kebele")}
                    </span>

                    <span className="font-bold">
                      {schedule.kebele ||
                        t("schedule.common.notAvailable")}
                    </span>
                  </div>

                  {/* SEFER */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.sefer")}
                    </span>

                    <span className="font-bold">
                      {schedule.sefer ||
                        t("schedule.common.notAvailable")}
                    </span>
                  </div>

                  <hr />

                  {/* FREQUENCY */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.frequency")}
                    </span>

                    <span className="font-bold text-green-700">
                      {schedule.frequency ||
                        t("schedule.common.notAvailable")}
                    </span>
                  </div>

                  {/* COLLECTION TIME */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.collectionTime")}
                    </span>

                    <span className="font-bold">
                      {schedule.start_time && schedule.end_time
                        ? `${schedule.start_time} - ${schedule.end_time}`
                        : t("schedule.common.notAvailable")}
                    </span>
                  </div>

                  <hr />

                  {/* COLLECTOR */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.collector")}
                    </span>

                    <span className="font-bold">
                      {schedule.collector_name ||
                        t("schedule.common.notAssigned")}
                    </span>
                  </div>

                  {/* PHONE */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      {t("schedule.fields.phone")}
                    </span>

                    {schedule.collector_phone ? (
                      <a
                        href={`tel:${schedule.collector_phone}`}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {schedule.collector_phone}
                      </a>
                    ) : (
                      <span className="text-gray-500">
                        {t("schedule.common.notAvailable")}
                      </span>
                    )}
                  </div>

                </div>

              </Card>
            ))}

          </div>
        )}

      </div>
    </ErrorBoundary>
  );
};

export default Schedule;
