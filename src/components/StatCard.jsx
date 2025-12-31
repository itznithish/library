export default function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg hover:shadow-xl transition-all">
      <h3 className="text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-semibold text-purple-700">{value}</p>
    </div>
  );
}
