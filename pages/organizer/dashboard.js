import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_ID = "6554f8ad-e6ca-47b5-8a29-f899860769e9";

const CATEGORY_LABELS = {
  famille: "Famille",
  sport: "Sport",
  musique: "Musique",
  culture: "Culture",
  loisirs: "Loisirs",
  bienetre: "Bien-être",
  autre: "Autre",
};

const TABS = [
  { key: "en_verification", label: "En attente" },
  { key: "publie", label: "Publiés" },
  { key: "refuse", label: "Refusés" },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("en_verification");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [titleSearch, setTitleSearch] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    published: 0,
    refused: 0,
    activeOrganizers: 0,
  });

  // ------------------------------------------------
  // 🔐 CHECK ADMIN (UNE SEULE FOIS)
  // ------------------------------------------------
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/account/login";
        return;
      }

      setUser(data.user);

      if (data.user.id !== ADMIN_ID) {
        window.location.href = "/";
        return;
      }

      setAuthorized(true);
    };

    checkAdmin();
  }, []);

  if (!user || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  // ------------------------------------------------
  // STATS
  // ------------------------------------------------
  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from("events")
      .select("id, status, organizer_id");

    if (!data) return;

    const total = data.length;
    const pending = data.filter((e) => e.status === "en_verification").length;
    const published = data.filter((e) => e.status === "publie").length;
    const refused = data.filter((e) => e.status === "refuse").length;

    const organizersSet = new Set(
      data.filter((e) => e.status === "publie").map((e) => e.organizer_id)
    );

    setStats({
      total,
      pending,
      published,
      refused,
      activeOrganizers: organizersSet.size,
    });
  }, []);

  // ------------------------------------------------
  // EVENTS
  // ------------------------------------------------
  const fetchEvents = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("events")
      .select("*")
      .eq("status", activeTab)
      .order("created_at", { ascending: false });

    if (cityFilter) query = query.ilike("city", `%${cityFilter}%`);
    if (titleSearch) query = query.ilike("title", `%${titleSearch}%`);
    if (categoryFilter !== "all") query = query.eq("category", categoryFilter);

    if (dateFilter) {
      query = query
        .gte("start_date_time", `${dateFilter}T00:00:00`)
        .lte("start_date_time", `${dateFilter}T23:59:59`);
    }

    const { data } = await query;
    setEvents(data || []);
    setLoading(false);
  }, [activeTab, cityFilter, titleSearch, categoryFilter, dateFilter]);

  const moderate = async (id, status) => {
    await supabase.from("events").update({ status }).eq("id", id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ------------------------------------------------
  // PAGE
  // ------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f5f7fa]">

      {/* ESPACE HEADER GLOBAL */}
      <div className="h-16" />

      <main className="max-w-6xl mx-auto px-4 pb-10">
        {/* TITRE */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Console administrateur
          </h1>
          <Link href="/search" className="text-sm text-blue-600 hover:underline">
            ← Retour au site
          </Link>
        </div>

        {/* STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total événements" value={stats.total} />
          <StatCard label="En attente" value={stats.pending} accent="yellow" />
          <StatCard label="Publiés" value={stats.published} accent="green" />
          <StatCard label="Organisateurs actifs" value={stats.activeOrganizers} />
        </section>

        {/* TABS + FILTRES */}
        <section className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              placeholder="Ville"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="input"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input bg-white"
            >
              <option value="all">Toutes</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              placeholder="Rechercher"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              className="input"
            />
          </div>
        </section>

        {/* LISTE */}
        {loading && <p className="text-center text-gray-500">Chargement…</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <img
                src={event.image_url || "/placeholder.jpg"}
                className="h-32 w-full object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold text-sm">{event.title}</h3>
                <p className="text-xs text-gray-500">{event.city}</p>

                <Link
                  href={`/organizer/events/${event.id}`}
                  className="text-xs text-blue-600 hover:underline block mt-2"
                >
                  Voir la fiche →
                </Link>

                <div className="flex gap-2 mt-3">
                  {activeTab !== "refuse" && (
                    <button
                      onClick={() => moderate(event.id, "refuse")}
                      className="flex-1 border text-red-600 text-xs rounded-lg py-1"
                    >
                      Refuser
                    </button>
                  )}
                  {activeTab !== "publie" && (
                    <button
                      onClick={() => moderate(event.id, "publie")}
                      className="flex-1 bg-blue-600 text-white text-xs rounded-lg py-1"
                    >
                      Publier
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

// ------------------------------------
function StatCard({ label, value, accent = "blue" }) {
  const color =
    accent === "yellow"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : accent === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className={`rounded-xl border px-4 py-3 ${color}`}>
      <span className="text-xs font-semibold uppercase">{label}</span>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}