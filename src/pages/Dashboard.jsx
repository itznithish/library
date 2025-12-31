import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import StudentsTable from "../components/StudentsTable";

export default function Dashboard({ session }) {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    floor: "",
    seat_no: "",
    package_months: "",
    fees: "",
    paid: "",
    balance: "",
    next_fees_date: "",
  });

  // 🟣 Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase.from("students").select("*");
      const { data: paymentsData } = await supabase.from("payments").select("*");
      setStudents(studentsData || []);
      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 📊 Stats
  const totalStudents = students.length;
  const totalPayments = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const floorStats = students.reduce((acc, s) => {
    const floor = s.floor || "Unknown";
    acc[floor] = (acc[floor] || 0) + 1;
    return acc;
  }, {});

  // 🧮 Auto balance + next payment date
  useEffect(() => {
    const fees = parseFloat(newStudent.fees) || 0;
    const paid = parseFloat(newStudent.paid) || 0;
    const balance = Math.max(fees - paid, 0);

    const months = parseInt(newStudent.package_months) || 0;
    let nextDate = "";
    if (months > 0) {
      const today = new Date();
      today.setMonth(today.getMonth() + months);
      nextDate = today.toISOString().split("T")[0];
    }

    setNewStudent((prev) => ({
      ...prev,
      balance,
      next_fees_date: nextDate,
    }));
  }, [newStudent.fees, newStudent.paid, newStudent.package_months]);

  // 🚪 Logout
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // ➕ Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();

    const {
      name,
      phone,
      floor,
      seat_no,
      package_months,
      fees,
      paid,
      balance,
      next_fees_date,
    } = newStudent;

    if (!name || !floor || !seat_no || !package_months || !fees) {
      alert("⚠️ Please fill all required fields (including seat no).");
      return;
    }

    try {
      const { data: insertedStudent, error: studentError } = await supabase
        .from("students")
        .insert([
          {
            name,
            phone,
            floor,
            seat_no,
            package_months: parseInt(package_months),
            fees: parseFloat(fees),
            paid: parseFloat(paid) || 0,
            pending_amount: parseFloat(balance) || 0,
            next_fees_date: next_fees_date || null,
          },
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      if (insertedStudent && paid > 0) {
        await supabase.from("payments").insert([
          {
            student_id: insertedStudent.id,
            amount: parseFloat(paid),
            date: new Date().toISOString(),
            next_due_date: next_fees_date,
          },
        ]);
      }

      alert("✅ Student added successfully!");
      setNewStudent({
        name: "",
        phone: "",
        floor: "",
        seat_no: "",
        package_months: "",
        fees: "",
        paid: "",
        balance: "",
        next_fees_date: "",
      });
      fetchData();
    } catch (err) {
      console.error("Error adding student:", err.message);
      alert("❌ Error adding student");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600 animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={logout} user={session?.user?.email} />

      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Academy Dashboard
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <StatCard title="Total Students" value={totalStudents} />
          <StatCard title="Total Payments (₹)" value={totalPayments} />
        </div>

        {/* Floor Stats */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Floor Occupancy
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {Object.entries(floorStats).map(([floor, count]) => (
            <div
              key={floor}
              className="bg-white shadow-md p-4 rounded-lg hover:shadow-xl transition-all"
            >
              <p className="text-gray-600 font-medium">{floor}</p>
              <p className="text-2xl font-bold text-purple-700">
                {count} students
              </p>
            </div>
          ))}
        </div>

        {/* ➕ Add Student Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Add New Student
          </h2>
          <form
            onSubmit={handleAddStudent}
            className="grid md:grid-cols-3 gap-4 items-end"
          >
            <input
              type="text"
              placeholder="Full Name"
              className="border p-2 rounded"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="border p-2 rounded"
              value={newStudent.phone}
              onChange={(e) =>
                setNewStudent({ ...newStudent, phone: e.target.value })
              }
            />
            <select
              className="border p-2 rounded"
              value={newStudent.floor}
              onChange={(e) =>
                setNewStudent({ ...newStudent, floor: e.target.value })
              }
            >
              <option value="">Select Floor</option>
              <option value="1st Floor">1st Floor</option>
              <option value="2nd Floor">2nd Floor</option>
            </select>

            {/* 🪑 Seat Number */}
            <input
              type="text"
              placeholder="Seat No (e.g., F1 or S10)"
              className="border p-2 rounded"
              value={newStudent.seat_no}
              onChange={(e) =>
                setNewStudent({ ...newStudent, seat_no: e.target.value })
              }
              required
            />

            <select
              className="border p-2 rounded"
              value={newStudent.package_months}
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  package_months: e.target.value,
                })
              }
            >
              <option value="">Select Package</option>
              <option value="1">1 Month</option>
              <option value="2">2 Months</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
            </select>
            <input
              type="number"
              placeholder="Total Fees (₹)"
              className="border p-2 rounded"
              value={newStudent.fees}
              onChange={(e) =>
                setNewStudent({ ...newStudent, fees: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Paid (₹)"
              className="border p-2 rounded"
              value={newStudent.paid}
              onChange={(e) =>
                setNewStudent({ ...newStudent, paid: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Balance (₹)"
              className="border p-2 rounded bg-gray-100 cursor-not-allowed"
              value={newStudent.balance}
              readOnly
            />
            <input
              type="date"
              className="border p-2 rounded bg-gray-50"
              value={newStudent.next_fees_date}
              readOnly
            />

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded transition-all"
            >
              ➕ Add Student
            </button>
          </form>
        </div>

        {/* Students Table */}
        <StudentsTable students={students} refreshData={fetchData} />

        {/* Revenue Chart */}
        <RevenueChart payments={payments} />

        {/* Upcoming Payments */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Upcoming Payments
          </h2>

          {students.length === 0 ? (
            <p className="text-gray-500 italic">No students yet.</p>
          ) : (
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-left">Floor</th>
                  <th className="py-2 px-3 text-left">Seat No</th>
                  <th className="py-2 px-3 text-left">Next Payment Date</th>
                  <th className="py-2 px-3 text-left">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((s) => s.next_fees_date)
                  .sort(
                    (a, b) =>
                      new Date(a.next_fees_date) - new Date(b.next_fees_date)
                  )
                  .map((student) => {
                    const today = new Date();
                    const nextDate = new Date(student.next_fees_date);
                    const daysLeft = Math.ceil(
                      (nextDate - today) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{student.name}</td>
                        <td className="py-2 px-3">{student.floor}</td>
                        <td className="py-2 px-3">{student.seat_no || "-"}</td>
                        <td className="py-2 px-3 text-purple-700 font-semibold">
                          {new Date(
                            student.next_fees_date
                          ).toLocaleDateString()}
                        </td>
                        <td
                          className={`py-2 px-3 font-semibold ${
                            daysLeft <= 3
                              ? "text-red-600"
                              : daysLeft <= 7
                              ? "text-orange-500"
                              : "text-green-600"
                          }`}
                        >
                          {daysLeft > 0
                            ? `${daysLeft} days left`
                            : daysLeft === 0
                            ? "Due Today"
                            : `Overdue (${Math.abs(daysLeft)} days)`}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
