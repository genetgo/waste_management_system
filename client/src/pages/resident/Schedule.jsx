import React, { useState, useEffect } from "react";
import scheduleService from "../../services/scheduleService";

// Shared Components
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import ErrorBoundary from "../../components/common/ErrorBoundary";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await scheduleService.getMySchedule();
console.log("Response:", response);
console.log("Schedules:", response.data);
      if (response.success) {
        setSchedules(response.data);
      }
    } catch (error) {
      console.error("Schedule Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto p-6">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Waste Collection Schedule
          </h1>

          <p className="text-gray-500 mt-2">
            Your assigned waste collection schedule.
          </p>
        </div>

        {schedules.length === 0 ? (

          <Card className="text-center py-10">

            <div className="text-6xl mb-4">
              📅
            </div>

            <h2 className="text-xl font-semibold text-gray-700">
              No Schedule Found
            </h2>

            <p className="text-gray-500 mt-2">
              There is no collection schedule assigned to your address.
            </p>

          </Card>

        ) : (

          <div className="grid md:grid-cols-2 gap-6">

            {schedules.map((schedule) => (

              <Card
                key={schedule.schedule_id}
                className="p-6 shadow-lg rounded-2xl border"
              >

                <div className="flex justify-between items-center mb-5">

                  <h2 className="text-lg font-bold text-blue-700">
                    {schedule.day_of_week}
                  </h2>

                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {schedule.status}
                  </span>

                </div>

                <div className="space-y-3">

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Kifle Ketema
                    </span>

                    <span className="font-bold">
                      {schedule.kifle_ketema}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Kebele
                    </span>

                    <span className="font-bold">
                      {schedule.kebele}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Sefer
                    </span>

                    <span className="font-bold">
                      {schedule.sefer}
                    </span>
                  </div>

                  <hr />

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Frequency
                    </span>

                    <span className="font-bold text-green-700">
                      {schedule.frequency}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Collection Time
                    </span>

                    <span className="font-bold">
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                  </div>

                  <hr />

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Collector
                    </span>

                    <span className="font-bold">
                      {schedule.collector_name || "Not Assigned"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">
                      Phone
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
                        N/A
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