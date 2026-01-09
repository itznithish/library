import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Line } from "react-chartjs-2";
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

export default function HistoryReports() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🟢 Fetch data
  async function fetchStudents() {
    const { data, error } = await supabase.from("students").select("*");
    if (error) console.error(error);
    else {
      setStudents(data);
      setReport(generateMonthlyReport(data));
    }
    setLoading(false);
  }

  // 🧮 Generate Monthly Report
  function generateMonthlyReport(students) {
    const months = {};

    students.forEach((s) => {
      if (!s.joining_date) return;
      const date = new Date(s.joining_date);
      const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" });

      if (!months[monthKey]) {
        months[monthKey] = {
          month: monthKey,
          newStudents: 0,
          totalCollected: 0,
          pending: 0,
        };
      }

      months[monthKey].newStudents += 1;
      months[monthKey].totalCollected += Number(s.paid || 0);
      months[monthKey].pending += Number(s.pending_amount || 0);
    });

    return Object.values(months).sort((a, b) => new Date(b.month) - new Date(a.month));
  }

  // 📊 Chart data
  const chartData = {
    labels: report.map((r) => r.month),
    datasets: [
      {
        label: "Fees Collected (₹)",
        data: report.map((r) => r.totalCollected),
        fill: false,
        borderColor: "#f97316",
        backgroundColor: "#f97316",
        tension: 0.3,
      },
      {
        label: "Pending (₹)",
        data: report.map((r) => r.pending),
        fill: false,
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.3,
      },
    ],
  };

  // 🧾 Export PDF
  const exportPDF = async () => {
    const input = document.getElementById("report-section");
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save("monthly_report.pdf");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-orange-50 to-yellow-100">
        <p className="text-gray-700 animate-pulse text-lg">Loading Reports...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-100 text-gray-800 px-8 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        📊 Monthly Performance Report
      </h1>

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={exportPDF}
          className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white px-6 py-2 rounded-full shadow-md hover:scale-105 transition-all duration-300"
        >
          ⬇️ Download PDF
        </button>
      </div>

      {/* Chart */}
      <div id="report-section" className="bg-white shadow-2xl rounded-2xl p-8 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Fees Overview</h2>
        <div className="w-full h-[350px]">
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>

        {/* Summary Table */}
        <div className="mt-10 overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm rounded-lg">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Month</th>
                <th className="px-4 py-2 text-left">New Students</th>
                <th className="px-4 py-2 text-left">Fees Collected (₹)</th>
                <th className="px-4 py-2 text-left">Pending (₹)</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r, i) => (
                <tr key={i} className="border-t hover:bg-orange-50 transition duration-200">
                  <td className="px-4 py-2 font-medium">{r.month}</td>
                  <td className="px-4 py-2">{r.newStudents}</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">₹{r.totalCollected}</td>
                  <td className="px-4 py-2 text-red-600 font-semibold">₹{r.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
