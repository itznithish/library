export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-purple-700 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="text-xl font-bold">Sri Spardha Academy </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user}</span>
        <button
          onClick={onLogout}
          className="bg-white text-purple-700 px-3 py-1 rounded hover:bg-purple-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
