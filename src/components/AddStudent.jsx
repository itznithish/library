import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddStudent({ refreshData }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    floor: "",
    seat_no: "",
    receipt_no: "",
    package_months: 1,
    fees: "",
    paid: "",
    joining_date: "",
    allotted_date: "",
    remarks: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        name,
        phone,
        floor,
        seat_no,
        receipt_no,
        package_months,
        fees,
        paid,
        joining_date,
        allotted_date,
        remarks,
      } = formData;

      if (!name || !phone || !floor || !fees) {
        alert("⚠️ Please fill all required fields!");
        setLoading(false);
        return;
      }

      const joinDate = joining_date ? new Date(joining_date) : new Date();
      const allottedDate = allotted_date
        ? new Date(allotted_date)
        : new Date(joinDate);
      const nextPayment = new Date(allottedDate);
      nextPayment.setMonth(allottedDate.getMonth() + parseInt(package_months));

      const pending = Number(fees) - Number(paid || 0);

      const { error } = await supabase.from("students").insert([
        {
          name,
          phone,
          floor,
          seat_no,
          receipt_no,
          package_months: parseInt(package_months),
          fees: Number(fees),
          paid: Number(paid || 0),
          pending_amount: pending,
          joining_date: joinDate.toISOString(),
          allotted_date: allottedDate.toISOString(),
          next_payment: nextPayment.toISOString(),
          remarks,
        },
      ]);

      if (error) throw error;

      alert("✅ Student added successfully!");
      setFormData({
        name: "",
        phone: "",
        floor: "",
        seat_no: "",
        receipt_no: "",
        package_months: 1,
        fees: "",
        paid: "",
        joining_date: "",
        allotted_date: "",
        remarks: "",
      });

      refreshData && refreshData();
    } catch (error) {
      alert("Error adding student: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Add New Student
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          className="border rounded p-2"
        />
        <select
          name="floor"
          value={formData.floor}
          onChange={handleChange}
          className="border rounded p-2"
          required
        >
          <option value="">Select Floor</option>
          <option value="1st Floor">1st Floor</option>
          <option value="2nd Floor">2nd Floor</option>
        </select>

        <input
          type="text"
          name="seat_no"
          placeholder="Seat No (e.g., F1 or S10)"
          value={formData.seat_no}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <input
          type="text"
          name="receipt_no"
          placeholder="Receipt No"
          value={formData.receipt_no}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <select
          name="package_months"
          value={formData.package_months}
          onChange={handleChange}
          className="border rounded p-2"
        >
          <option value={1}>1 Month</option>
          <option value={2}>2 Months</option>
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
          <option value={12}>12 Months</option>
        </select>

        <input
          type="number"
          name="fees"
          placeholder="Total Fees (₹)"
          value={formData.fees}
          onChange={handleChange}
          className="border rounded p-2"
          required
        />

        <input
          type="number"
          name="paid"
          placeholder="Paid (₹)"
          value={formData.paid}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <input
          type="date"
          name="joining_date"
          value={formData.joining_date}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <input
          type="date"
          name="allotted_date"
          value={formData.allotted_date}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <input
          type="text"
          name="remarks"
          placeholder="Remarks (optional)"
          value={formData.remarks}
          onChange={handleChange}
          className="border rounded p-2 md:col-span-2"
        />

        <button
          type="submit"
          disabled={loading}
          className={`bg-purple-600 text-white font-medium py-2 rounded hover:bg-purple-700 transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding..." : "+ Add Student"}
        </button>
      </form>
    </div>
  );
}

