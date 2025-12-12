import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const WEEKDAYS_FR = [
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
  ];

  // ---------------------------
  // Charger l’événement
  // ---------------------------
  const fetchEvent = async () => {
    if (!id) return;

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    setEvent(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // ---------------------------
  // Loading / erreurs
  // ---------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Événement introuvable.
      </div>
    );
  }

  // ---------------------------
  // RÉCURRENCE
  // ---------------------------
  let recurrenceText = null;
  if (event.recurrence_rule) {
    try {
      const rule = JSON.parse(event.recurrence_rule);
      if (rule.type === "weekly") {
        recurrenceText = `Tous les ${WEEKDAYS_FR[rule.weekday]}s`;
      }
    } catch {}
  }

  // ---------------------------
  // GOOGLE MAPS
  // ---------------------------
  const openMaps = () => {
    const q = encodeURIComponent(event.address_full || "");
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${q}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ESPACE POUR LE HEADER GLOBAL */}
      <div className="h-16" />

      {/* IMAGE PRINCIPALE */}
      <div className="w-full h-64 md:h-96 bg-gray-200">
        <img
          src={event.image_url || "/placeholder.jpg"}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* CONTENU */}
      <div className="max-w-4xl mx-auto p-6 mt-4">
        {/* RETOUR */}
        <button
          onClick={() => router.back()}
          className="text-blue-600 font-medium hover:underline mb-4"
        >
          ← Retour
        </button>

        {/* TITRE + CATÉGORIE */}
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            {event.title}
          </h1>

          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize shrink-0">
            {event.category}
          </span>
        </div>

        {/* DATE */}
        <p className="text-gray-600 mt-2 text-sm">
          {new Date(event.start_date_time).toLocaleString("fr-FR")}
          {event.end_date_time &&
            " → " +
              new Date(event.end_date_time).toLocaleTimeString("fr-FR")}
        </p>

        {recurrenceText && (
          <p className="text-blue-600 font-semibold text-sm mt-1">
            🔁 {recurrenceText}
          </p>
        )}

        {/* ADRESSE */}
        <button
          onClick={openMaps}
          className="mt-4 text-blue-600 font-semibold flex items-center gap-1 hover:underline"
        >
          📍 {event.address_full || "Adresse inconnue"}
        </button>

        {/* DESCRIPTION */}
        <h2 className="text-xl font-bold mt-8 mb-2">Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>

        {/* INFOS PRATIQUES */}
        <h2 className="text-xl font-bold mt-8 mb-2">Infos pratiques</h2>

        <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-3">
          <p className="text-gray-700 text-sm">
            <span className="font-semibold">Prix : </span>
            {event.price_type === "gratuit"
              ? "Gratuit"
              : event.price
              ? `${event.price} €`
              : "Payant"}
          </p>

          {event.tickets_url && (
            <a
              href={event.tickets_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              🎟️ Réserver / Billetterie
            </a>
          )}
        </div>

        {/* CONTACT */}
        <h2 className="text-xl font-bold mt-8 mb-2">Contact</h2>

        <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-1">
          {event.contact_name && (
            <p className="text-gray-700">👤 {event.contact_name}</p>
          )}
          {event.contact_email && (
            <p className="text-gray-700">📧 {event.contact_email}</p>
          )}
          {event.contact_phone && (
            <p className="text-gray-700">📞 {event.contact_phone}</p>
          )}
          {event.contact_website && (
            <a
              href={event.contact_website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline block"
            >
              🌐 Site web / Réseaux
            </a>
          )}
        </div>
      </div>
    </div>
  );
}