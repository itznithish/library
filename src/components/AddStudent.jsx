import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AddStudent({ refreshData }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [floor, setFloor] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [months, setMonths] = useState(1);
  const [fees, setFees] = useState("");
  const [paid, setPaid] = useState("");
  const [nextPayment, setNextPayment] = useState("");

  // Automatically calculate next payment date
  const calculateNextPayment = (months) => {
    const today = new Date();
    today.setMonth(today.getMonth() + Number(months));
    return today.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pending = fees - paid;
    const next_date = calculateNextPayment(months);

    const { error } = await supabase.from("students").insert([
      {
        name,
        phone,
        floor,
        seat_no: seatNo,
        months,
        fees,
        paid,
        pending_amount: pending,
        next_payment_date: next_date,
      },
    ]);

    if (error) {
      alert("Error adding student: " + error.message);
      return;
    }

    alert("✅ Student added successfully!");
    refreshData();

    // Reset
    setName("");
    setPhone("");
    setFloor("");
    setSeatNo("");
    setMonths(1);
    setFees("");
    setPaid("");
    setNextPayment("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Add New Student
      </h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-md"
            placeholder="Enter name"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Phone Number
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-md"
            placeholder="Enter phone"
            required
          />
        </div>

        {/* Floor */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Select Floor</label>
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="w-full p-3 border rounded-md"
            required
          >
            <option value="">Select Floor</option>
            <option value="1st Floor">1st Floor</option>
            <option value="2nd Floor">2nd Floor</option>
          </select>
        </div>

        {/* Seat Number */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Seat No</label>
          <input
            value={seatNo}
            onChange={(e) => setSeatNo(e.target.value)}
            className="w-full p-3 border rounded-md"
            placeholder="e.g. F1 or S10"
            required
          />
        </div>

        {/* Package Duration */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Package</label>
          <select
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="w-full p-3 border rounded-md"
          >
            <option value={1}>1 Month</option>
            <option value={2}>2 Months</option>
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
          </select>
        </div>

        {/* Fees */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Total Fees (₹)</label>
          <input
            type="number"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            className="w-full p-3 border rounded-md"
            required
          />
        </div>

        {/* Paid */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">Paid (₹)</label>
          <input
            type="number"
            value={paid}
            onChange={(e) => setPaid(e.target.value)}
            className="w-full p-3 border rounded-md"
            required
          />
        </div>

        {/* Next Payment Date */}
        <div>
          <label className="block text-sm text-gray-600 mb-2">
            Next Payment Date
          </label>
          <input
            type="date"
            value={nextPayment || calculateNextPayment(months)}
            onChange={(e) => setNextPayment(e.target.value)}
            className="w-full p-3 border rounded-md"
          />
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition"
          >
            + Add Student
          </button>
        </div>
      </form>
    </div>
  );
}
