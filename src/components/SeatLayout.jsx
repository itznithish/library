import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SeatLayout({ onSeatSelect }) {
  const [students, setStudents] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // 🟡 Fetch current booked seats
  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("seat_no, floor");
    if (error) console.error("Error fetching seats:", error);
    else setStudents(data || []);
  };

  // 🔴 Get list of booked seat numbers
  const bookedSeats = students
    .filter((s) => s.seat_no && s.seat_no.trim() !== "")
    .map((s) => s.seat_no.toUpperCase());

  // 🟦 When seat is clicked
  const handleSeatClick = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return; // already booked → ignore

    setSelectedSeat(seatNumber);
    if (onSeatSelect) onSeatSelect(seatNumber);
  };

  // 🎨 Seat color logic
  const getSeatColor = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return "bg-red-500"; // booked
    if (selectedSeat === seatNumber) return "bg-blue-500"; // selected
    return "bg-green-500"; // available
  };

  // 🔢 Generate seat boxes
  const generateSeats = (prefix, count) => {
    const seats = [];
    for (let i = 1; i <= count; i++) {
      const seatNumber = `${prefix}${i}`;
      seats.push(
        <div
          key={seatNumber}
          onClick={() => handleSeatClick(seatNumber)}
          className={`w-10 h-10 flex items-center justify-center m-1 rounded text-sm font-semibold text-white cursor-pointer shadow-md hover:scale-105 transition-transform duration-150 ${getSeatColor(
            seatNumber
          )}`}
        >
          {seatNumber}
        </div>
      );
    }
    return seats;
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        🪑 Seat Layout Overview 🪑
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 🧡 1st Floor */}
        <div className="p-4 border rounded-lg shadow-md bg-gradient-to-b from-yellow-50 to-orange-100">
          <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
            1st Floor (15 Seats)
          </h3>
          <div className="flex flex-wrap justify-center">
            {generateSeats("F", 15)}
          </div>
        </div>

        {/* 💛 2nd Floor */}
        <div className="p-4 border rounded-lg shadow-md bg-gradient-to-b from-yellow-50 to-orange-100">
          <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
            2nd Floor (42 Seats)
          </h3>
          <div className="flex flex-wrap justify-center">
            {generateSeats("S", 42)}
          </div>
        </div>

        {/* 🤎 Cabin */}
        <div className="p-4 border rounded-lg shadow-md bg-gradient-to-b from-yellow-50 to-orange-100">
          <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
            Cabin (4 Seats)
          </h3>
          <div className="flex flex-wrap justify-center">
            {generateSeats("C", 4)}
          </div>
        </div>
      </div>
    </div>
  );
}
