import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function FavoritesPage() {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Charger l'utilisateur
  // ---------------------------
  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }, []);

  // ---------------------------
  // Charger les événements favoris
  // ---------------------------
  const fetchFavorites = useCallback(async () => {
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) {
      setLoading(false);
      return;
    }

    const { data: favIds } = await supabase
      .from("favorites")
      .select("event_id")
      .eq("user_id", session.user.id);

    const ids = favIds?.map((f) => f.event_id) || [];

    if (ids.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .in("id", ids)
      .order("start_date_time", { ascending: true });

    setEvents(eventsData || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
    fetchFavorites();
  }, [fetchUser, fetchFavorites]);

  // ---------------------------
  // Retirer un favori
  // ---------------------------
  const removeFavorite = async (eventId) => {
    if (!user) return;

    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", eventId);

    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  // ---------------------------
  // Si pas connecté
  // ---------------------------
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <h1 className="text-3xl font-bold mb-2">Mes favoris</h1>
        <p className="text-gray-600 mb-4">
          Vous devez être connecté pour voir vos favoris.
        </p>
        <Link
          href="/account/login"
          className="px-5 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  // ---------------------------
  // PAGE FAVORIS
  // ---------------------------
  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      {/* TITRE PAGE */}
      <section className="max-w-6xl mx-auto px-6 mt-10 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Mes favoris ❤️
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Retrouvez tous les événements que vous avez aimés.
        </p>
      </section>

      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-6">
        {/* LOADING */}
        {loading && (
          <p className="text-center text-gray-500 mt-20">
            Chargement…
          </p>
        )}

        {/* Aucun favori */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-medium">
              Aucun favori pour le moment.
            </p>
            <Link
              href="/search"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Explorer des événements →
            </Link>
          </div>
        )}

        {/* LISTE FAVORIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 hover:shadow-md transition"
            >
              {/* IMAGE */}
              <img
                src={ev.image_url || "/placeholder.jpg"}
                className="w-28 h-24 object-cover rounded-lg"
                alt={ev.title}
              />

              {/* INFO */}
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <Link
                    href={`/event/${ev.id}`}
                    className="font-semibold text-gray-800 hover:underline"
                  >
                    {ev.title}
                  </Link>

                  {/* COEUR */}
                  <button
                    onClick={() => removeFavorite(ev.id)}
                    className="text-xl hover:scale-110 transition"
                    title="Retirer des favoris"
                  >
                    ❤️
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(ev.start_date_time).toLocaleString("fr-FR")}
                </p>

                <p className="text-xs text-gray-700">
                  {ev.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}