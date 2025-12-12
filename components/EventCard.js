// components/EventCard.js
import Link from "next/link";

export default function EventCard({ event, isFavorite, onToggleFavorite }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 hover:shadow-md transition">

      {/* IMAGE */}
      <img
        src={event.image_url}
        alt={event.title}
        className="w-28 h-24 object-cover rounded-lg"
      />

      {/* INFO */}
      <div className="flex flex-col flex-1">
        
        {/* TITRE + CŒUR */}
        <div className="flex justify-between items-start">
          <Link
            href={`/event/${event.id}`}
            className="font-semibold text-gray-900 hover:underline"
          >
            {event.title}
          </Link>

          <button
            onClick={onToggleFavorite}
            className="text-xl hover:scale-110 transition"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          {new Date(event.start_date_time).toLocaleString("fr-FR")}
        </p>

        <p className="text-xs text-gray-700">{event.city}</p>
      </div>
    </div>
  );
}