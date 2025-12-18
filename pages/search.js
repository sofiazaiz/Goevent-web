// pages/search.js
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import CategorySelector from "../components/CategorySelector";
import EventCard from "../components/EventCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [radius, setRadius] = useState(20);

  const [events, setEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const WEEKDAYS_FR = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  const getStartEndOfDayISO = (yyyyMmDd) => {
    // yyyyMmDd = "2025-12-01"
    const [y, m, d] = yyyyMmDd.split("-").map(Number);

    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);

    return { startISO: start.toISOString(), endISO: end.toISOString(), start, end };
  };

  const getWeekdayFromDateString = (yyyyMmDd) => {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.getDay(); // 0..6 (Dim..Sam)
  };

  const normalizeWeeklyDays = (recurrence_rule) => {
    try {
      const rule = typeof recurrence_rule === "string" ? JSON.parse(recurrence_rule) : recurrence_rule;
      if (!rule || rule.type !== "weekly") return [];
      if (Array.isArray(rule.weekdays)) return rule.weekdays;
      if (typeof rule.weekday === "number") return [rule.weekday];
      return [];
    } catch {
      return [];
    }
  };

  const eventMatchesSelectedDate = (ev, yyyyMmDd) => {
    if (!yyyyMmDd) return true;

    const { start, end } = getStartEndOfDayISO(yyyyMmDd);
    const selectedWeekday = getWeekdayFromDateString(yyyyMmDd);

    const evStart = ev.start_date_time ? new Date(ev.start_date_time) : null;
    const evEnd = ev.end_date_time ? new Date(ev.end_date_time) : null;

    // Sécurité si pas de start_date_time
    if (!evStart) return false;

    // Si récurrence hebdomadaire : présent seulement si le jour match + dans la fenêtre start/end
    if (ev.recurrence_rule) {
      const days = normalizeWeeklyDays(ev.recurrence_rule)
        .filter((d) => typeof d === "number" && d >= 0 && d <= 6);

      if (days.length === 0) return false;

      const inWindow =
        evStart <= end && (evEnd ? evEnd >= start : true);

      if (!inWindow) return false;

      return days.includes(selectedWeekday);
    }

    // Sans récurrence :
    // - si end_date_time existe => événement multi-jours => overlap
    if (evEnd) {
      return evStart <= end && evEnd >= start;
    }

    // - sinon => événement "ponctuel" => doit démarrer dans la journée
    return evStart >= start && evStart <= end;
  };

  /* -------------------------------
     FAVORIS
  ------------------------------- */
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

  /* -------------------------------
     CHARGEMENT DES ÉVÉNEMENTS
  ------------------------------- */
  const fetchEvents = useCallback(async () => {
    setLoading(true);

    let req = supabase
      .from("events")
      .select("*")
      .eq("status", "publie")
      .order("start_date_time", { ascending: true });

    if (query) req = req.ilike("city", `%${query}%`);
    if (categories.length > 0) req = req.in("category", categories);

    // ✅ Filtre date (supporte événements multi-jours + récurrence hebdo côté JS)
    if (selectedDate) {
      const { startISO, endISO } = getStartEndOfDayISO(selectedDate);

      // On récupère les événements qui peuvent POTENTIELLEMENT toucher cette journée :
      // start_date_time <= fin de journée
      // et (end_date_time est NULL OU end_date_time >= début de journée)
      req = req
        .lte("start_date_time", endISO)
        .or(`end_date_time.is.null,end_date_time.gte.${startISO}`);
    }

    const { data } = await req;

    let finalEvents = data || [];

    // ✅ Filtrage fin côté front (récurrence hebdo + éviter les faux positifs)
    if (selectedDate) {
      finalEvents = finalEvents.filter((ev) => eventMatchesSelectedDate(ev, selectedDate));
    }

    setEvents(finalEvents);
    setLoading(false);
  }, [query, categories, selectedDate]);

  useEffect(() => {
    fetchEvents();
    loadFavorites();
  }, [fetchEvents, loadFavorites]);

  /* -------------------------------
     PAGE UI PREMIUM++
  ------------------------------- */
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

      {/* CATÉGORIES — UTILISE LE NOUVEAU COMPONENT PREMIUM */}
      <section className="max-w-6xl mx-auto px-6 mb-4">
        <h2 className="text-sm font-bold text-gray-700 mb-2">Catégories</h2>

        <CategorySelector
          selected={categories}
          onChange={setCategories}
        />
      </section>

      {/* LISTE DES ÉVÉNEMENTS */}
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