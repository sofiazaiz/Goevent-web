// pages/search.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import CategorySelector from "../components/CategorySelector";
import EventCard from "../components/EventCard";

const CATEGORY_ICONS = {
  famille: "👨‍👩‍👧",
  sport: "⚽️",
  musique: "🎵",
  culture: "🏛️",
  loisirs: "🎡",
  bienetre: "✨",
  autre: "📌",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_ICONS);

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [radius, setRadius] = useState(20);

  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------------
  // FAVORIS
  // -------------------------------
  const loadFavorites = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const { data } = await supabase
      .from("favorites")
      .select("event_id")
      .eq("user_id", sessionData.session.user.id);

    setFavorites(data ? data.map((f) => f.event_id) : []);
  }, []);

  const toggleFavorite = async (eventId) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session)
      return alert("Connectez-vous pour ajouter un favori.");

    const isFav = favorites.includes(eventId);

    if (isFav) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", sessionData.session.user.id)
        .eq("event_id", eventId);

      setFavorites((prev) => prev.filter((id) => id !== eventId));
    } else {
      await supabase.from("favorites").insert({
        user_id: sessionData.session.user.id,
        event_id: eventId,
      });

      setFavorites((prev) => [...prev, eventId]);
    }
  };

  // -------------------------------
  // CHARGEMENT DES ÉVÉNEMENTS
  // -------------------------------
  const fetchEvents = useCallback(async () => {
    setLoading(true);

    let req = supabase
      .from("events")
      .select("*")
      .eq("status", "publie")
      .order("start_date_time", { ascending: true });

    if (query) req = req.ilike("city", `%${query}%`);
    if (categories.length > 0) req = req.in("category", categories);

    if (selectedDate) {
      req = req
        .gte("start_date_time", `${selectedDate}T00:00:00`)
        .lte("start_date_time", `${selectedDate}T23:59:59`);
    }

    const { data } = await req;
    setEvents(data || []);
    setLoading(false);
  }, [query, categories, selectedDate]);

  useEffect(() => {
    fetchEvents();
    loadFavorites();
  }, [fetchEvents, loadFavorites]);

  // -------------------------------
  // PAGE
  // -------------------------------
  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">

      {/* TITRE */}
      <section className="max-w-6xl mx-auto px-6 mt-10 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Trouvez un événement près de chez vous 🎉
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Concerts, famille, loisirs… trouvez votre prochaine sortie !
        </p>
      </section>

      {/* BARRE RECHERCHE */}
      <section className="max-w-6xl mx-auto px-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border p-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* VILLE */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Ville</label>
              <input
                type="text"
                placeholder="Ex : Paris"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm"
              />
            </div>

            {/* DISTANCE */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Distance</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full"
                />
                <span className="text-xs">{radius} km</span>
              </div>
            </div>

          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={fetchEvents}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section className="max-w-6xl mx-auto px-6 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-2">Catégories</h2>
        <CategorySelector selected={categories} onChange={setCategories} />
      </section>

      {/* LISTE ÉVÉNEMENTS */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Résultats</h2>

        {loading && <p className="text-center text-gray-500">Chargement…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isFavorite={favorites.includes(ev.id)}
              onToggleFavorite={() => toggleFavorite(ev.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}