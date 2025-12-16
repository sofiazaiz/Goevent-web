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

  // Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Récurrence
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState([]); // ⬅️ MULTI

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

  /* ----------------------------------------------------
     SOUMISSION DU FORMULAIRE
  ---------------------------------------------------- */
  const handleSubmit = async () => {
    if (!title || !description || !startDate || !address) {
      return alert("Merci de remplir tous les champs obligatoires.");
    }

    let imageUrl = null;

    // Upload image
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile);

      if (!uploadError) {
        const { data } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    // Récurrence MULTI
    let recurrenceRule = null;
    if (recurrenceType === "weekly" && recurrenceWeekdays.length > 0) {
      recurrenceRule = JSON.stringify({
        type: "weekly",
        weekdays: recurrenceWeekdays,
      });
    }

    // Insert DB
    const { error } = await supabase.from("events").insert({
      organizer_id: user.id,
      title,
      description,
      category: categories[0] || "autre",
      start_date_time: new Date(startDate).toISOString(),
      end_date_time: endDate ? new Date(endDate).toISOString() : null,
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
        <h1 className="text-2xl font-bold text-gray-900">
          Créer un événement
        </h1>
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

        <h2 className="text-xl font-bold mt-6 mb-3">Dates & horaires</h2>

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

        <h2 className="text-xl font-bold mt-6 mb-3">Récurrence</h2>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setRecurrenceType("none");
              setRecurrenceWeekdays([]);
            }}
            className={`toggle ${
              recurrenceType === "none" ? "toggle-active" : ""
            }`}
          >
            Pas de récurrence
          </button>

          <button
            onClick={() => setRecurrenceType("weekly")}
            className={`toggle ${
              recurrenceType === "weekly" ? "toggle-active" : ""
            }`}
          >
            Hebdomadaire
          </button>
        </div>

        {recurrenceType === "weekly" && (
          <div className="flex flex-wrap gap-2 mt-3">
            {WEEKDAYS.map((d) => {
              const active = recurrenceWeekdays.includes(d.value);
              return (
                <button
                  key={d.value}
                  onClick={() => {
                    setRecurrenceWeekdays((prev) =>
                      prev.includes(d.value)
                        ? prev.filter((v) => v !== d.value)
                        : [...prev, d.value]
                    );
                  }}
                  className={`weekday ${active ? "weekday-active" : ""}`}
                >
                  {d.label}
                </button>
              );
            })}
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
          placeholder="Ville"
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
            className={`toggle ${
              priceType === "gratuit" ? "toggle-active" : ""
            }`}
          >
            Gratuit
          </button>

          <button
            onClick={() => setPriceType("payant")}
            className={`toggle ${
              priceType === "payant" ? "toggle-active" : ""
            }`}
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
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl mt-6 hover:bg-blue-700 transition"
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
        }
        .weekday-active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}