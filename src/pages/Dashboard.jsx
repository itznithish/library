import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import StudentsTable from "../components/StudentsTable";
import SeatLayout from "../components/SeatLayout";

export default function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1st Floor");
  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    floor: "",
    seat_no: "",
    package_months: "",
    receipt_no: "",
    fees: "",
    paid: "",
    pending_amount: "",
    remarks: "",
    joining_date: "",
    allotted_date: "",
    payment_method: "",
  });

  // Fetch students
  async function fetchStudents() {
    const { data, error } = await supabase.from("students").select("*");
    if (error) console.error(error);
    else setStudents(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add new student
  async function addStudent(e) {
    e.preventDefault();
    const {
      name,
      phone,
      floor,
      seat_no,
      package_months,
      receipt_no,
      fees,
      paid,
      remarks,
      joining_date,
      allotted_date,
      payment_method,
    } = newStudent;

    const pending_amount = fees - paid;
    const next_fees_date = allotted_date
      ? new Date(
          new Date(allotted_date).setMonth(
            new Date(allotted_date).getMonth() + Number(package_months)
          )
        ).toISOString()
      : null;

    const { data, error } = await supabase
      .from("students")
      .insert([
        {
          name,
          phone,
          floor,
          seat_no,
          package_months,
          receipt_no,
          fees,
          paid,
          pending_amount,
          remarks,
          joining_date,
          allotted_date,
          next_fees_date,
          payment_method,
        },
      ])
      .select();

    if (error) alert("❌ Error adding student: " + error.message);
    else {
      alert("✅ Student added successfully!");
      setNewStudent({
        name: "",
        phone: "",
        floor: "",
        seat_no: "",
        package_months: "",
        receipt_no: "",
        fees: "",
        paid: "",
        pending_amount: "",
        remarks: "",
        joining_date: "",
        allotted_date: "",
        payment_method: "",
      });
      fetchStudents();
    }
  }

  // Summary Calculations
  const totalStudents = students.length;
  const totalFees = students.reduce((a, b) => a + (Number(b.fees) || 0), 0);
  const totalPaid = students.reduce((a, b) => a + (Number(b.paid) || 0), 0);
  const totalPending = totalFees - totalPaid;

  const upcomingPayments = students
    .filter((s) => s.next_fees_date)
    .sort((a, b) => new Date(a.next_fees_date) - new Date(b.next_fees_date));

  const occupiedSeats = {
    floor1: students.filter((s) => s.floor === "1st Floor").length,
    floor2: students.filter((s) => s.floor === "2nd Floor").length,
    cabin: students.filter((s) => s.floor === "Cabin").length,
  };

  const totalSeats = { floor1: 42, floor2: 15, cabin: 4 };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-orange-50 to-amber-100">
        <p className="text-lg text-gray-700 animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-100 text-gray-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#4b4b4b] text-white px-8 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-orange-400">
          SRI SPARDHA ACADEMY
        </h1>
        <button
          onClick={onLogout}
          className="bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-bold px-6 py-2 rounded-full shadow-md transition-transform duration-200 hover:scale-105"
        >
          Logout
        </button>
      </nav>

      {/* Header */}
      <div className="text-center mt-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-gray-600">
          Manage students, payments, and seat allocations in real-time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
        {[
          {
            title: "Total Students",
            value: totalStudents,
            color: "from-orange-500 to-amber-400",
            icon: "👥",
          },
          {
            title: "Total Fees",
            value: `₹${totalFees}`,
            color: "from-yellow-400 to-orange-400",
            icon: "💰",
          },
          {
            title: "Total Paid",
            value: `₹${totalPaid}`,
            color: "from-green-400 to-emerald-500",
            icon: "✅",
          },
          {
            title: "Pending",
            value: `₹${totalPending}`,
            color: "from-red-400 to-rose-500",
            icon: "⚠️",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex flex-col justify-between p-6 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">
                  {item.title}
                </h3>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
              <span className="text-4xl">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floor Occupancy */}
      <div className="px-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Floor Occupancy
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {["floor1", "floor2", "cabin"].map((floorKey, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-lg font-semibold mb-2 capitalize text-gray-700">
                {floorKey === "floor1"
                  ? "1st Floor"
                  : floorKey === "floor2"
                  ? "2nd Floor"
                  : "Cabin"}{" "}
                ({occupiedSeats[floorKey]}/{totalSeats[floorKey]} occupied)
              </h3>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    occupiedSeats[floorKey] >= totalSeats[floorKey] * 0.8
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-green-400 to-lime-400"
                  }`}
                  style={{
                    width: `${
                      (occupiedSeats[floorKey] / totalSeats[floorKey]) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Student */}
      <div className="px-8 mb-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-orange-100 transition-all duration-500">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            Add New Student
          </h2>
          <form
            onSubmit={addStudent}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { label: "Full Name", name: "name", type: "text" },
              { label: "Phone Number", name: "phone", type: "number" },
              {
                label: "Select Floor",
                name: "floor",
                type: "select",
                options: ["1st Floor", "2nd Floor", "Cabin"],
              },
              { label: "Seat No", name: "seat_no", type: "text" },
              { label: "Receipt No", name: "receipt_no", type: "text" },
              {
                label: "Package (Months)",
                name: "package_months",
                type: "number",
              },
              { label: "Fees (₹)", name: "fees", type: "number" },
              { label: "Paid (₹)", name: "paid", type: "number" },
              {
                label: "Payment Method",
                name: "payment_method",
                type: "select",
                options: ["Cash", "Online"],
              },
              { label: "Remarks", name: "remarks", type: "text" },
              { label: "Payment Date", name: "joining_date", type: "date" },
              { label: "Allotted Date", name: "allotted_date", type: "date" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  {f.label}
                </label>
                {f.type === "select" ? (
                  <select
                    required
                    name={f.name}
                    value={newStudent[f.name]}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        [f.name]: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select</option>
                    {f.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type={f.type}
                    name={f.name}
                    value={newStudent[f.name]}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        [f.name]: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                )}
              </div>
            ))}

            <div className="col-span-full flex justify-center mt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-10 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="px-8 mb-12 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Seat Layout – {activeTab}
        </h2>
        <SeatLayout
          key={activeTab}
          students={students.filter((s) => s.floor === activeTab)}
          floor={activeTab}
          refreshData={fetchStudents}
        />
      </div>

      {/* Students Table */}
      <div className="px-8 mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Student Records
        </h2>
        <div className="bg-white rounded-2xl shadow-xl">
          <div className="flex justify-center md:justify-start border-b border-gray-200 bg-gradient-to-r from-orange-100 to-yellow-50 rounded-t-2xl">
            {["1st Floor", "2nd Floor", "Cabin"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab
                    ? "text-orange-600 border-b-4 border-orange-500 bg-gradient-to-r from-yellow-100 to-orange-50"
                    : "text-gray-500 hover:text-orange-600"
                }`}
              >
                {tab}
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                  {students.filter((s) => s.floor === tab).length}
                </span>
              </button>
            ))}
          </div>
          <div className="p-6 transition-all duration-300 animate-fadeIn">
            <StudentsTable
              refreshData={fetchStudents}
              students={students.filter((s) => s.floor === activeTab)}
            />
          </div>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="px-8 mb-16">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Upcoming Payments
        </h2>
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-xl text-sm">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Floor</th>
                <th className="px-4 py-2 text-left">Seat</th>
                <th className="px-4 py-2 text-left">Next Payment</th>
                <th className="px-4 py-2 text-left">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {upcomingPayments.map((s) => {
                const dueDate = new Date(s.next_fees_date);
                const today = new Date();
                const diffDays = Math.ceil(
                  (dueDate - today) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={s.id}
                    className="border-t hover:bg-orange-50 transition duration-200"
                  >
                    <td className="px-4 py-2 font-medium">{s.name}</td>
                    <td className="px-4 py-2">{s.floor}</td>
                    <td className="px-4 py-2">{s.seat_no}</td>
                    <td className="px-4 py-2 text-orange-600 font-semibold">
                      {new Date(s.next_fees_date).toLocaleDateString("en-GB")}
                    </td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        diffDays < 0
                          ? "text-red-600"
                          : diffDays < 15
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {diffDays >= 0
                        ? `${diffDays} days left`
                        : `${Math.abs(diffDays)} days overdue`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-4 text-sm">
        © {new Date().getFullYear()} Sri Spardha Academy. All rights reserved.
      </footer>
    </div>
  );
}
