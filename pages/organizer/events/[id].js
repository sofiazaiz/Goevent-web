import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const CATEGORY_LABELS = {
  famille: "Famille",
  sport: "Sport",
  musique: "Musique",
  culture: "Culture",
  loisirs: "Loisirs",
  bienetre: "Bien-être",
  autre: "Autre",
};

const STATUS_LABELS = {
  en_verification: "En attente de validation",
  publie: "Publié",
  refuse: "Refusé",
};

export default function EventDetailAdminPage() {
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = async (eventId) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (!error) setEvent(data);
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchEvent(id);
  }, [id]);

  const moderate = async (status) => {
    if (!event) return;

    await supabase.from("events").update({ status }).eq("id", event.id);
    setEvent({ ...event, status });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Chargement…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
        <p>Événement introuvable.</p>
        <Link
          href="/organizer/dashboard"
          className="mt-3 text-blue-600 text-sm hover:underline"
        >
          ← Retour au dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-[system-ui]">
      {/* ESPACE HEADER GLOBAL */}
      <div className="h-16" />

      <main className="max-w-5xl mx-auto px-4 pb-10">
        {/* RETOUR */}
        <Link
          href="/organizer/dashboard"
          className="inline-block mb-4 text-blue-600 text-sm hover:underline"
        >
          ← Retour au dashboard
        </Link>

        {/* Image + statut */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
          <div className="relative h-56 w-full bg-gray-100">
            <img
              src={event.image_url || "/placeholder.jpg"}
              alt={event.title}
              className="w-full h-full object-cover"
            />

            <span
              className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${
                event.status === "publie"
                  ? "bg-emerald-500 text-white"
                  : event.status === "refuse"
                  ? "bg-red-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {STATUS_LABELS[event.status] || event.status}
            </span>

            {event.category && (
              <span className="absolute bottom-3 left-3 bg-black/70 text-white text-[11px] px-2 py-1 rounded-full">
                {CATEGORY_LABELS[event.category] || "Autre"}
              </span>
            )}
          </div>

          <div className="p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {event.title}
            </h2>

            <p className="text-sm text-gray-600 mb-4 whitespace-pre-line">
              {event.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800">Infos pratiques</h3>
                <p>📍 {event.place_name || "Lieu non précisé"}</p>
                <p>{event.address_full}</p>
                <p>{event.city}</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800">Dates</h3>
                <p>
                  Début :{" "}
                  {event.start_date_time &&
                    new Date(event.start_date_time).toLocaleString("fr-FR")}
                </p>
                <p>
                  Fin :{" "}
                  {event.end_date_time
                    ? new Date(event.end_date_time).toLocaleString("fr-FR")
                    : "Non renseignée"}
                </p>
                {event.recurrence_rule && (
                  <p className="text-xs text-gray-500">
                    Récurrence : {event.recurrence_rule}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800">Tarification</h3>
                <p>
                  Type :{" "}
                  {event.price_type === "payant" ? "Payant" : "Gratuit"}
                </p>
                {event.price_type === "payant" && (
                  <p>
                    Prix : {event.price ? `${event.price} €` : "Non précisé"}
                  </p>
                )}
                {event.tickets_url && (
                  <p>
                    Billetterie :{" "}
                    <a
                      href={event.tickets_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ouvrir le lien
                    </a>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800">
                  Contact organisateur
                </h3>
                <p>{event.contact_name || "Non renseigné"}</p>
                {event.contact_email && (
                  <p className="text-blue-600">{event.contact_email}</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Actions de modération */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="text-xs text-gray-500">
            Dernière mise à jour :{" "}
            {event.updated_at &&
              new Date(event.updated_at).toLocaleString("fr-FR")}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => moderate("refuse")}
              className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
            >
              Refuser
            </button>

            <button
              onClick={() => moderate("publie")}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              Publier
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
