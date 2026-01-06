// pages/organizer/create.js
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import CategorySelector from "../../components/CategorySelector";

// Jours semaine pour la récurrence
const WEEKDAYS = [
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Jeu", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sam", value: 6 },
  { label: "Dim", value: 0 },
];

const pad2 = (n) => String(n).padStart(2, "0");

const combineDateAndTimeToISO = (dateStr, timeStr) => {
  // dateStr: "YYYY-MM-DD"
  // timeStr: "HH:MM"
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return dt.toISOString();
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const toDateInputValue = (date) => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

const getFirstWeeklyOccurrenceDate = (baseDateStr, weekdays) => {
  // baseDateStr: "YYYY-MM-DD"
  // weekdays: array of 0..6
  if (!baseDateStr || !Array.isArray(weekdays) || weekdays.length === 0) return null;

  const [y, m, d] = baseDateStr.split("-").map(Number);
  const base = new Date(y, m - 1, d, 0, 0, 0, 0);

  // On cherche la prochaine date (à partir de base) qui matche un weekday sélectionné,
  // dans une fenêtre de 0..13 jours pour être safe.
  let best = null;

  for (let i = 0; i <= 13; i++) {
    const candidate = addDays(base, i);
    if (weekdays.includes(candidate.getDay())) {
      best = candidate;
      break;
    }
  }

  return best;
};

export default function CreateEventPage() {
  const [user, setUser] = useState(null);

  // Champs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [priceType, setPriceType] = useState("gratuit");
  const [price, setPrice] = useState("");
  const [ticketsUrl, setTicketsUrl] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState(""); // ✅ AJOUT TEL
  const [imageFile, setImageFile] = useState(null);

  // Dates (mode non récurrent)
  const [startDate, setStartDate] = useState(""); // datetime-local
  const [endDate, setEndDate] = useState(""); // datetime-local

  // Récurrence
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState([]); // ⬅️ MULTI

  // ✅ Mode récurrent: date de départ + horaires par jour
  const [recurrenceStartDate, setRecurrenceStartDate] = useState(""); // date: YYYY-MM-DD
  const [weeklyTimes, setWeeklyTimes] = useState({}); 
  // weeklyTimes = { [weekdayNumber]: { start: "HH:MM", end: "HH:MM" } }

  // Charger utilisateur
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/account/login";
        return;
      }
      setUser(data.user);
    });
  }, []);

  // ✅ Initialiser une date de départ par défaut quand on passe en hebdo
  useEffect(() => {
    if (recurrenceType === "weekly" && !recurrenceStartDate) {
      setRecurrenceStartDate(toDateInputValue(new Date()));
    }
  }, [recurrenceType, recurrenceStartDate]);

  const toggleWeekday = (weekdayValue) => {
    setRecurrenceWeekdays((prev) => {
      const exists = prev.includes(weekdayValue);
      const next = exists ? prev.filter((v) => v !== weekdayValue) : [...prev, weekdayValue];

      // ✅ Si on ajoute un jour, on prépare des horaires par défaut
      if (!exists) {
        setWeeklyTimes((t) => {
          const nextTimes = { ...t };
          if (!nextTimes[weekdayValue]) {
            nextTimes[weekdayValue] = { start: "10:00", end: "" };
          }
          return nextTimes;
        });
      }

      // ✅ Si on enlève un jour, on peut garder les horaires en mémoire (pratique),
      // mais si tu préfères supprimer, décommente:
      // if (exists) {
      //   setWeeklyTimes((t) => {
      //     const nextTimes = { ...t };
      //     delete nextTimes[weekdayValue];
      //     return nextTimes;
      //   });
      // }

      return next;
    });
  };

  const setDayTime = (weekday, field, value) => {
    setWeeklyTimes((prev) => ({
      ...prev,
      [weekday]: {
        ...(prev[weekday] || { start: "10:00", end: "" }),
        [field]: value,
      },
    }));
  };

  /* ----------------------------------------------------
     SOUMISSION DU FORMULAIRE
  ---------------------------------------------------- */
  const handleSubmit = async () => {
    // ✅ SÉCURITÉ : si user pas encore chargé, on bloque
    if (!user) {
      alert("Chargement du compte… réessaie dans 2 secondes.");
      return;
    }

    // ✅ city rendue obligatoire
    if (!title || !description || !address || !city) {
      return alert("Merci de remplir tous les champs obligatoires.");
    }

    // ✅ Validation dates selon récurrence
    if (recurrenceType === "none") {
      if (!startDate) return alert("Merci de renseigner la date/heure de début.");
    }

    if (recurrenceType === "weekly") {
      if (!recurrenceStartDate) return alert("Merci de renseigner une date de départ pour la récurrence.");
      if (!recurrenceWeekdays || recurrenceWeekdays.length === 0) {
        return alert("Merci de sélectionner au moins un jour de la semaine.");
      }
      for (const wd of recurrenceWeekdays) {
        const t = weeklyTimes[wd];
        if (!t || !t.start) {
          return alert("Merci de renseigner l’heure de début pour chaque jour sélectionné.");
        }
      }
    }

    let imageUrl = null;

    // Upload image
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: imageFile.type,
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    // ✅ Construire start/end selon le mode
    let startISO = null;
    let endISO = null;

    if (recurrenceType === "none") {
      startISO = new Date(startDate).toISOString();
      endISO = endDate ? new Date(endDate).toISOString() : null;
    } else if (recurrenceType === "weekly") {
      // On fixe start_date_time sur la 1ère occurrence calculée
      const firstDate = getFirstWeeklyOccurrenceDate(recurrenceStartDate, recurrenceWeekdays);
      if (!firstDate) {
        return alert("Impossible de calculer la première occurrence. Vérifie la date de départ.");
      }

      // Trouver quel weekday correspond à cette première date
      const wd = firstDate.getDay();
      const t = weeklyTimes[wd] || { start: "10:00", end: "" };

      const firstDateStr = toDateInputValue(firstDate);
      startISO = combineDateAndTimeToISO(firstDateStr, t.start);

      // end optionnel: si l’utilisateur a mis une heure de fin pour ce jour
      endISO = t.end ? combineDateAndTimeToISO(firstDateStr, t.end) : null;
    }

    // Récurrence MULTI + horaires par jour
    let recurrenceRule = null;
    if (recurrenceType === "weekly" && recurrenceWeekdays.length > 0) {
      const timesPayload = {};
      recurrenceWeekdays.forEach((wd) => {
        const t = weeklyTimes[wd] || { start: "10:00", end: "" };
        timesPayload[String(wd)] = { start: t.start || "10:00", end: t.end || "" };
      });

      recurrenceRule = JSON.stringify({
        type: "weekly",
        start_date: recurrenceStartDate, // date de départ (utile côté back)
        weekdays: recurrenceWeekdays,
        times: timesPayload, // ✅ horaires différents par jour
      });
    }

    // Insert DB
    const { error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title,
      description,
      category: categories[0] || "autre",
      start_date_time: startISO,
      end_date_time: endISO,
      address_full: address,
      place_name: placeName,
      city,
      price_type: priceType,
      price: priceType === "payant" ? Number(price) : null,
      tickets_url: ticketsUrl || null,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null, // ✅ ENVOI TEL
      visibility_mode: "publie",
      status: "en_verification",
      image_url: imageUrl,
      recurrence_rule: recurrenceRule,
    });

    if (error) {
      console.error(error);
      return alert("Erreur lors de la création.");
    }

    alert("Événement envoyé pour validation !");
    window.location.href = "/account/profile";
  };

  /* ----------------------------------------------------
     PAGE UI
  ---------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      {/* ESPACE HEADER GLOBAL */}
      <div className="h-16" />

      {/* TITRE */}
      <div className="text-center mt-6">
        <h1 className="text-2xl font-bold text-gray-900">Créer un événement</h1>
      </div>

      {/* CONTAINER */}
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-6 border border-gray-100 mt-6">
        <h2 className="text-xl font-bold mb-4">Informations générales</h2>

        <input
          className="input"
          placeholder="Titre de l’événement *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <h3 className="font-semibold mt-4 mb-2">Catégories</h3>
        <CategorySelector selected={categories} onChange={setCategories} />

        <textarea
          className="input h-24"
          placeholder="Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <h2 className="text-xl font-bold mt-6 mb-3">Photo</h2>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        {imageFile && (
          <img
            src={URL.createObjectURL(imageFile)}
            alt="preview"
            className="w-full h-52 object-cover rounded-xl mt-3"
          />
        )}

        {/* ✅ RÉCURRENCE AVANT DATES & HORAIRES */}
        <h2 className="text-xl font-bold mt-6 mb-3">Récurrence</h2>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setRecurrenceType("none");
              setRecurrenceWeekdays([]);
            }}
            className={`toggle ${recurrenceType === "none" ? "toggle-active" : ""}`}
          >
            Pas de récurrence
          </button>

          <button
            onClick={() => setRecurrenceType("weekly")}
            className={`toggle ${recurrenceType === "weekly" ? "toggle-active" : ""}`}
          >
            Hebdomadaire
          </button>
        </div>

        {recurrenceType === "weekly" && (
          <>
            <label className="small-label mt-3">Date de départ (semaine de départ) *</label>
            <input
              type="date"
              className="input"
              value={recurrenceStartDate}
              onChange={(e) => setRecurrenceStartDate(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {WEEKDAYS.map((d) => {
                const active = recurrenceWeekdays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    onClick={() => toggleWeekday(d.value)}
                    className={`weekday ${active ? "weekday-active" : ""}`}
                    type="button"
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            {/* ✅ Horaires différents par jour sélectionné */}
            {recurrenceWeekdays.length > 0 && (
              <div className="timesBox">
                <div className="timesTitle">Horaires par jour</div>

                {recurrenceWeekdays
                  .slice()
                  .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
                  .map((wd) => {
                    const label = WEEKDAYS.find((x) => x.value === wd)?.label || String(wd);
                    const t = weeklyTimes[wd] || { start: "10:00", end: "" };
                    return (
                      <div key={wd} className="timeRow">
                        <div className="timeDay">{label}</div>

                        <div className="timeInputs">
                          <div className="timeField">
                            <label className="small-label">Début *</label>
                            <input
                              type="time"
                              className="input"
                              value={t.start || ""}
                              onChange={(e) => setDayTime(wd, "start", e.target.value)}
                            />
                          </div>

                          <div className="timeField">
                            <label className="small-label">Fin (optionnel)</label>
                            <input
                              type="time"
                              className="input"
                              value={t.end || ""}
                              onChange={(e) => setDayTime(wd, "end", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {/* ✅ DATES & HORAIRES APRÈS LA RÉCURRENCE */}
        <h2 className="text-xl font-bold mt-6 mb-3">Dates & horaires</h2>

        {recurrenceType === "none" ? (
          <>
            <label className="small-label">Début *</label>
            <input
              type="datetime-local"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <label className="small-label mt-2">Fin (optionnel)</label>
            <input
              type="datetime-local"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </>
        ) : (
          <div className="hintBox">
            <b>Mode récurrent :</b> les horaires se règlent dans “Récurrence” (par jour).
            <br />
            La date/heure enregistrée correspond à la <b>première occurrence</b>, puis la récurrence gère le reste.
          </div>
        )}

        <h2 className="text-xl font-bold mt-6 mb-3">Lieu</h2>

        <input
          className="input"
          placeholder="Adresse complète *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          className="input"
          placeholder="Ville *"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <input
          className="input"
          placeholder="Nom du lieu"
          value={placeName}
          onChange={(e) => setPlaceName(e.target.value)}
        />

        <h2 className="text-xl font-bold mt-6 mb-3">Prix</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setPriceType("gratuit")}
            className={`toggle ${priceType === "gratuit" ? "toggle-active" : ""}`}
            type="button"
          >
            Gratuit
          </button>

          <button
            onClick={() => setPriceType("payant")}
            className={`toggle ${priceType === "payant" ? "toggle-active" : ""}`}
            type="button"
          >
            Payant
          </button>
        </div>

        {priceType === "payant" && (
          <input
            className="input mt-3"
            placeholder="Prix (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        )}

        <input
          className="input mt-2"
          placeholder="Lien billetterie"
          value={ticketsUrl}
          onChange={(e) => setTicketsUrl(e.target.value)}
        />

        <h2 className="text-xl font-bold mt-6 mb-3">Contact</h2>

        <input
          className="input"
          placeholder="Nom"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />

        <input
          className="input"
          placeholder="Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Téléphone (optionnel)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={!user}
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-6 hover:bg-blue-700 transition ${
            !user ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Publier mon événement
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .small-label {
          font-size: 12px;
          color: #555;
          display: block;
        }
        .toggle {
          flex: 1;
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 13px;
          background: white;
        }
        .toggle-active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .weekday {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          font-size: 13px;
          background: white;
        }
        .weekday-active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .timesBox {
          margin-top: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 12px;
          background: #fafafa;
        }
        .timesTitle {
          font-weight: 700;
          margin-bottom: 10px;
          font-size: 14px;
          color: #111827;
        }
        .timeRow {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: white;
          margin-bottom: 10px;
        }
        .timeDay {
          font-weight: 700;
          font-size: 13px;
          color: #111827;
        }
        .timeInputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .timeField .input {
          margin-bottom: 0;
        }
        .hintBox {
          border: 1px dashed #d1d5db;
          background: #f9fafb;
          border-radius: 12px;
          padding: 12px;
          color: #374151;
          font-size: 13px;
        }
        @media (max-width: 520px) {
          .timeInputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}