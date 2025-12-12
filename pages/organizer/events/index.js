// pages/organizer/events/index.js
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const STATUS_LABELS = {
  en_verification: "En attente",
  publie: "Publié",
  refuse: "Refusé",
};

export default function AdminEventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [titleSearch, setTitleSearch] = useState("");

  const fetchAllEvents = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (cityFilter) {
      query = query.ilike("city", `%${cityFilter}%`);
    }
    if (titleSearch) {
      query = query.ilike("title", `%${titleSearch}%`);
    }

    const { data, error } = await query;
    if (!error) setEvents(data || []);
    setLoading(false);
  }, [statusFilter, cityFilter, titleSearch]);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-[system-ui]">
      {/* Header simple */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
        <Link
          href="/organizer/dashboard"
          className="text-blue-600 text-sm hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="font-semibold text-gray-900 text-sm">
          Tous les événements
        </h1>
        <div className="text-xs text-gray-500">{events.length} items</div>
      </header>

      <div className="h-16" />

      <main className="max-w-6xl mx-auto px-4 pb-10">
        {/* Filtres */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tous</option>
                <option value="en_verification">En attente</option>
                <option value="publie">Publiés</option>
                <option value="refuse">Refusés</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Ville</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Montpellier…"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block">
                Recherche par titre
              </label>
              <input
                type="text"
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Nom de l’événement…"
              />
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={fetchAllEvents}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              Filtrer
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">
                  Titre
                </th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">
                  Ville
                </th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">
                  Statut
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-6">
                    Chargement…
                  </td>
                </tr>
              )}

              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-6">
                    Aucun événement trouvé.
                  </td>
                </tr>
              )}

              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 truncate">{e.title}</td>
                  <td className="px-3 py-2">{e.city}</td>
                  <td className="px-3 py-2">
                    {new Date(e.start_date_time).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs">
                      {STATUS_LABELS[e.status] || e.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link
                      href={`/organizer/events/${e.id}`}
                      className="text-blue-600 text-xs font-semibold hover:underline"
                    >
                      Détails →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}