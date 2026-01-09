import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import StudentsTable from "../components/StudentsTable";
import SeatLayout from "../components/SeatLayout";
import { Line } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function Dashboard({ user, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReports, setShowReports] = useState(false);
  const [filterFloor, setFilterFloor] = useState("All");

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
    payment_method: "",
    remarks: "",
    joining_date: "",
    allotted_date: "",
  });

  // Fetch all students
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
      payment_method,
      joining_date,
      allotted_date,
    } = newStudent;

    const pending_amount = fees - paid;
    const next_fees_date = allotted_date
      ? new Date(
          new Date(allotted_date).setMonth(
            new Date(allotted_date).getMonth() + Number(package_months)
          )
        ).toISOString()
      : null;

    const { error } = await supabase.from("students").insert([
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
        payment_method,
        joining_date,
        allotted_date,
        next_fees_date,
      },
    ]);

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
        payment_method: "",
        remarks: "",
        joining_date: "",
        allotted_date: "",
      });
      fetchStudents();
    }
  }

  // Dashboard Stats
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

  // Monthly Reports
  const reportMonths = {};
  students.forEach((s) => {
    if (!s.joining_date) return;
    const month = new Date(s.joining_date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!reportMonths[month])
      reportMonths[month] = { newStudents: 0, collected: 0, pending: 0 };
    reportMonths[month].newStudents++;
    reportMonths[month].collected += Number(s.paid || 0);
    reportMonths[month].pending += Number(s.pending_amount || 0);
  });

  const reportData = Object.entries(reportMonths).map(([month, stats]) => ({
    month,
    ...stats,
  }));

  const chartData = {
    labels: reportData.map((r) => r.month),
    datasets: [
      {
        label: "Collected (₹)",
        data: reportData.map((r) => r.collected),
        borderColor: "#f97316",
        backgroundColor: "#f97316",
        tension: 0.3,
      },
      {
        label: "Pending (₹)",
        data: reportData.map((r) => r.pending),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.3,
      },
    ],
  };

  const exportPDF = async () => {
    const input = document.getElementById("reports-section");
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("monthly_report.pdf");
  };

  const filteredStudents =
    filterFloor === "All"
      ? students
      : students.filter((s) => s.floor === filterFloor);

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
        {[
          { title: "Total Students", value: totalStudents, color: "from-orange-500 to-amber-400", icon: "👥" },
          { title: "Total Fees", value: `₹${totalFees}`, color: "from-yellow-400 to-orange-400", icon: "💰" },
          { title: "Total Paid", value: `₹${totalPaid}`, color: "from-green-400 to-emerald-500", icon: "✅" },
          { title: "Pending", value: `₹${totalPending}`, color: "from-red-400 to-rose-500", icon: "⚠️" },
        ].map((item, i) => (
          <div
            key={i}
            className={`flex flex-col justify-between p-6 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-xl transform hover:scale-105 hover:shadow-2xl transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider opacity-90">{item.title}</h3>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
              <span className="text-4xl">{item.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 🧾 Add New Student */}
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
                label: "Select Package (Months)",
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
            ].map((field, i) => (
              <div key={i} className="flex flex-col">
                <label className="text-sm font-semibold text-gray-600 mb-1">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    required
                    name={field.name}
                    value={newStudent[field.name]}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        [field.name]: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type={field.type}
                    name={field.name}
                    value={newStudent[field.name]}
                    onChange={(e) =>
                      setNewStudent({
                        ...newStudent,
                        [field.name]: e.target.value,
                      })
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-400"
                  />
                )}
              </div>
            ))}

            <div className="col-span-full flex justify-center mt-6">
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-10 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition-all duration-300"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🪑 Seat Layout */}
      <div className="px-8 mb-12">
        <SeatLayout students={students} />
      </div>

      {/* 🧍‍♂️ Floor Tabs */}
      <div className="flex justify-center mb-6 gap-3">
        {["All", "1st Floor", "2nd Floor", "Cabin"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterFloor(f)}
            className={`px-5 py-2 rounded-full font-semibold transition-all ${
              filterFloor === f
                ? "bg-gradient-to-r from-orange-500 to-yellow-400 text-white shadow-md"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 🧾 Students Table */}
      <div className="px-8 mb-12">
        <StudentsTable students={filteredStudents} refreshData={fetchStudents} />
      </div>

      {/* 📊 Reports */}
      <div className="flex justify-center mb-10">
        <button
          onClick={() => setShowReports(!showReports)}
          className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-10 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-all duration-300"
        >
          {showReports ? "Hide Reports 📉" : "View Reports 📈"}
        </button>
      </div>

      <AnimatePresence>
        {showReports && (
          <motion.div
            id="reports-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="px-8 mb-12"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Monthly Reports
              </h2>
              <div className="w-full h-[350px] mb-8">
                <Line data={chartData} options={{ responsive: true }} />
              </div>

              <table className="min-w-full border border-gray-200 rounded-lg text-sm">
                <thead className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Month</th>
                    <th className="px-4 py-2 text-left">New Students</th>
                    <th className="px-4 py-2 text-left">Collected (₹)</th>
                    <th className="px-4 py-2 text-left">Pending (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((r, i) => (
                    <tr key={i} className="border-t hover:bg-orange-50 transition">
                      <td className="px-4 py-2 font-medium">{r.month}</td>
                      <td className="px-4 py-2">{r.newStudents}</td>
                      <td className="px-4 py-2 text-green-600 font-semibold">
                        ₹{r.collected}
                      </td>
                      <td className="px-4 py-2 text-red-600 font-semibold">
                        ₹{r.pending}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mt-6">
                <button
                  onClick={exportPDF}
                  className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-2 rounded-full shadow-md hover:scale-105 transition-all duration-300"
                >
                  ⬇️ Download PDF
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📅 Upcoming Payments */}
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

      {/* ⚙️ Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-4 text-sm">
        © {new Date().getFullYear()}{" "}
        <span className="text-orange-400 font-semibold">
          Novamind Automation | Sofware | Digital Solutions
        </span>
        . All rights reserved.
      </footer>
    </div>
  );
}
