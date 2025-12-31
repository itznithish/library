import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { supabase } from "../lib/supabaseClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RevenueChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("monthly_payments_summary")
        .select("*");

      if (error) {
        console.error(error);
        return;
      }

      const labels = data.map((item) =>
        new Date(item.month).toLocaleString("default", { month: "short" })
      );

      const totals = data.map((item) => item.total_amount);

      setChartData({
        labels,
        datasets: [
          {
            label: "Monthly Revenue (₹)",
            data: totals,
            backgroundColor: "rgba(139, 92, 246, 0.6)", // purple-500
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 1,
          },
        ],
      });
    };

    fetchData();
  }, []);

  if (!chartData) return <p className="text-gray-500">Loading chart...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Monthly Revenue
      </h2>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
        }}
      />
    </div>
  );
}
