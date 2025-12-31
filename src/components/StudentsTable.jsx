import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function StudentsTable({ refreshData }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [monthsPaid, setMonthsPaid] = useState(1);

  // Fetch all students
  async function fetchStudents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("next_fees_date", { ascending: true });

    if (error) console.error("Error fetching students:", error);
    else setStudents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🟢 Mark as Paid
  async function handleMarkAsPaid(studentId) {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const months = monthsPaid || 1;
    const currentNext = new Date(student.next_fees_date || new Date());
    currentNext.setMonth(currentNext.getMonth() + months);

    const { error } = await supabase
      .from("students")
      .update({
        next_fees_date: currentNext.toISOString(),
        pending_amount: 0,
      })
      .eq("id", studentId);

    if (error) alert(error.message);
    else {
      alert(`✅ ${student.name}'s payment marked for ${months} month(s)!`);
      setSelectedStudent(null);
      fetchStudents();
      refreshData && refreshData();
    }
  }

  // ✏️ Edit logic
  const handleEdit = (student) => {
    setEditingId(student.id);
    setFormData({ ...student });
  };

  const handleSave = async () => {
    const { id, ...updateData } = formData;
    const { error } = await supabase.from("students").update(updateData).eq("id", id);
    if (error) alert("Error updating: " + error.message);
    else {
      alert("✅ Updated successfully!");
      setEditingId(null);
      fetchStudents();
      refreshData && refreshData();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  // ❌ Delete
  async function handleDelete(id) {
    if (!confirm("Delete this student?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) alert(error.message);
    else {
      alert("🗑️ Deleted successfully!");
      fetchStudents();
      refreshData && refreshData();
    }
  }

  if (loading)
    return <p className="text-center text-gray-600">Loading students...</p>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Students List</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Floor</th>
              <th className="px-3 py-2">Seat</th>
              <th className="px-3 py-2">Months</th>
              <th className="px-3 py-2">Fees</th>
              <th className="px-3 py-2">Paid</th>
              <th className="px-3 py-2">Pending</th>
              <th className="px-3 py-2">Next Payment</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="border-t hover:bg-gray-50 transition"
              >
                {editingId === student.id ? (
                  <>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={formData.floor}
                        onChange={(e) =>
                          setFormData({ ...formData, floor: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      >
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={formData.seat_no}
                        onChange={(e) =>
                          setFormData({ ...formData, seat_no: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={formData.package_months}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            package_months: e.target.value,
                          })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={formData.fees}
                        onChange={(e) =>
                          setFormData({ ...formData, fees: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={formData.paid}
                        onChange={(e) =>
                          setFormData({ ...formData, paid: e.target.value })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={formData.pending_amount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pending_amount: e.target.value,
                          })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="date"
                        value={
                          formData.next_fees_date
                            ? formData.next_fees_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            next_fees_date: e.target.value,
                          })
                        }
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="px-3 py-2 text-center space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 font-medium">{student.name}</td>
                    <td className="px-3 py-2">{student.floor}</td>
                    <td className="px-3 py-2">{student.seat_no}</td>
                    <td className="px-3 py-2 text-center">
                      {student.package_months}
                    </td>
                    <td className="px-3 py-2">₹{student.fees}</td>
                    <td className="px-3 py-2">₹{student.paid}</td>
                    <td className="px-3 py-2 text-red-600 font-medium">
                      ₹{student.pending_amount}
                    </td>
                    <td className="px-3 py-2">
                      {student.next_fees_date
                        ? new Date(student.next_fees_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2 flex justify-center gap-2">
                      {selectedStudent === student.id ? (
                        <>
                          <select
                            value={monthsPaid}
                            onChange={(e) =>
                              setMonthsPaid(parseInt(e.target.value))
                            }
                            className="border rounded px-2 py-1"
                          >
                            {[1, 2, 3, 6, 12].map((m) => (
                              <option key={m} value={m}>
                                {m} mo
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleMarkAsPaid(student.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => setSelectedStudent(null)}
                            className="text-gray-500"
                          >
                            ✖
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
