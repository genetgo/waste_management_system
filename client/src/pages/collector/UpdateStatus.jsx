import React, { useState } from "react";
import { useParams } from "react-router-dom";
import collectorService from "../../services/collectorService";

const UpdateStatus = () => {

  const { id } = useParams();

  const [status, setStatus] = useState("Completed");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {

    e.preventDefault();

    setSubmitting(true);
    setSuccess(false);
    setError("");


    try {

      await collectorService.updateRequestStatus(
        id,
        status
      );


      setSuccess(true);


    } catch (err) {

      console.error(
        "Update Status Error:",
        err
      );


      setError(
        err.response?.data?.message ||
        "Failed to update status."
      );


    } finally {

      setSubmitting(false);

    }

  };



  return (

    <div className="p-6 max-w-xl mx-auto">


      <h1 className="text-3xl font-bold mb-2">
        Update Service Status
      </h1>


      <p className="text-gray-500 mb-6">
        Update the progress of the waste collection task here.
      </p>



      {success && (

        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">

          Task status updated successfully!

        </div>

      )}



      {error && (

        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">

          {error}

        </div>

      )}



      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 border rounded-2xl shadow space-y-5"
      >


        <div>

          <label className="block text-sm font-semibold mb-2">

            Task Status

          </label>


          <select

            value={status}

            onChange={(e)=>
              setStatus(e.target.value)
            }

            className="w-full border rounded-xl p-3"

          >

            <option value="Completed">
              Completed
            </option>


            <option value="Cancelled">
              Cancelled
            </option>


          </select>

        </div>




        <div>

          <label className="block text-sm font-semibold mb-2">

            Additional Notes

          </label>


          <textarea

            value={notes}

            onChange={(e)=>
              setNotes(e.target.value)
            }

            rows="4"

            className="w-full border rounded-xl p-3"

            placeholder="Example: Waste collection completed successfully..."

          />

        </div>




        <button

          type="submit"

          disabled={submitting}

          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"

        >

          {
            submitting
            ? "Updating..."
            : "Update Status"
          }

        </button>



      </form>


    </div>

  );

};


export default UpdateStatus;