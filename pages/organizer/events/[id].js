// pages/organizer/events/[id].js
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

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

const STATUS_LABELS = {
  en_verification: "En attente de validation",
  publie: "Publié",
  refuse: "Refusé",
};

export default function EventDetailAdminPage() {
  const router = useRouter();
  const { id } = router.query;

  const [authorized, setAuthorized] = useState(false);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ normalise id (Next peut donner string | string[])
  const eventId = Array.isArray(id) ? id[0] : id;

  // ------------------------------------------------
  // 🔐 SECURISER LA SESSION + CHECK ADMIN
  // ------------------------------------------------
  useEffect(() => {
    const protect = async () => {
      try {
        // 1) session
        const { data: sessionData, error: sessionErr } =
          await supabase.auth.getSession();

        if (sessionErr || !sessionData?.session) {
          // sécurité : si token cassé / pas de session -> login
          try {
            await supabase.auth.signOut();
          } catch {}
          router.replace("/account/login");
          return;
        }

        // 2) user
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();

        if (userErr || !userData?.user) {
          try {
            await supabase.auth.signOut();
          } catch {}
          router.replace("/account/login");
          return;
        }

        // 3) admin
        if (userData.user.id !== ADMIN_ID) {
          router.replace("/");
          return;
        }

        setAuthorized(true);
      } catch (e) {
        // dernier filet de sécurité
        try {
          await supabase.auth.signOut();
        } catch {}
        router.replace("/account/login");
      }
    };

    if (router.isReady) protect();
  }, [router.isReady, router]);

  // ------------------------------------------------
  // 📥 CHARGER EVENEMENT (seulement si autorisé)
  // ------------------------------------------------
  const fetchEvent = useCallback(async (idToFetch) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", idToFetch)
        .single();

      if (error) {
        console.log("fetchEvent error:", error);
        setEvent(null);
      } else {
        setEvent(data || null);
      }
    } catch (e) {
      console.log("fetchEvent crash:", e);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✅ évite les crashs : on attend router + admin + eventId
    if (!router.isReady) return;
    if (!authorized) return;
    if (!eventId) return;

    fetchEvent(eventId);
  }, [router.isReady, authorized, eventId, fetchEvent]);

  const moderate = async (status) => {
    if (!event) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({ status })
        .eq("id", event.id);

      if (error) {
        alert("Erreur lors de la mise à jour du statut.");
        return;
      }

      setEvent((prev) => ({ ...prev, status }));
    } catch (e) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  // ✅ Tant que la protection n’a pas fini, on évite de rendre la page
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Chargement…
      </div>
    );
  }

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
              alt={event.title || "Événement"}
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
                <p>{event.address_full || ""}</p>
                <p>{event.city || ""}</p>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-gray-800">Dates</h3>
                <p>
                  Début :{" "}
                  {event.start_date_time
                    ? new Date(event.start_date_time).toLocaleString("fr-FR")
                    : "Non renseignée"}
                </p>
                <p>
                  Fin :{" "}
                  {event.end_date_time
                    ? new Date(event.end_date_time).toLocaleString("fr-FR")
                    : "Non renseignée"}
                </p>
                {event.recurrence_rule && (
                  <p className="text-xs text-gray-500 break-all">
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
                  <p>Prix : {event.price ? `${event.price} €` : "Non précisé"}</p>
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
            {event.updated_at
              ? new Date(event.updated_at).toLocaleString("fr-FR")
              : "—"}
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