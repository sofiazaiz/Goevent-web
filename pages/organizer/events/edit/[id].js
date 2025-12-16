import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import CategorySelector from "../../../../components/CategorySelector";

const ADMIN_EMAIL = "sofia.zaiz14@hotmail.com";

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

export default function EditEventPage() {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Champs événement
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
  const [contactPhone, setContactPhone] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Image
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Récurrence
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState([]);

  // ---------------------------
  // Vérifier utilisateur admin
  // ---------------------------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.replace("/");
        return;
      }
      setUser(data.user);
    });
  }, []);

  // ---------------------------
  // Charger événement
  // ---------------------------
  useEffect(() => {
    if (!id) return;

    const loadEvent = async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (!data) {
        router.replace("/");
        return;
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      setCategories(data.category ? [data.category] : []);
      setAddress(data.address_full || "");
      setCity(data.city || "");
      setPlaceName(data.place_name || "");
      setPriceType(data.price_type || "gratuit");
      setPrice(data.price || "");
      setTicketsUrl(data.tickets_url || "");
      setContactName(data.contact_name || "");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setCurrentImage(data.image_url || null);

      setStartDate(data.start_date_time?.slice(0, 16) || "");
      setEndDate(data.end_date_time?.slice(0, 16) || "");

      if (data.recurrence_rule) {
        try {
          const rule = JSON.parse(data.recurrence_rule);
          if (rule.type === "weekly") {
            setRecurrenceType("weekly");
            setRecurrenceWeekdays(rule.weekdays || []);
          }
        } catch {}
      }

      setLoading(false);
    };

    loadEvent();
  }, [id]);

  // ---------------------------
  // Sauvegarde
  // ---------------------------
  const handleSave = async () => {
    let imageUrl = currentImage;

    // Upload nouvelle image si sélectionnée
    if (imageFile && user) {
      const ext = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, imageFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage
          .from("event-images")
          .getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    let recurrenceRule = null;
    if (recurrenceType === "weekly" && recurrenceWeekdays.length > 0) {
      recurrenceRule = JSON.stringify({
        type: "weekly",
        weekdays: recurrenceWeekdays,
      });
    }

    const { error } = await supabase
      .from("events")
      .update({
        title,
        description,
        category: categories[0] || "autre",
        address_full: address,
        city,
        place_name: placeName,
        price_type: priceType,
        price: priceType === "payant" ? Number(price) : null,
        tickets_url: ticketsUrl || null,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        start_date_time: new Date(startDate).toISOString(),
        end_date_time: endDate ? new Date(endDate).toISOString() : null,
        recurrence_rule: recurrenceRule,
        image_url: imageUrl,
      })
      .eq("id", id);

    if (error) {
      alert("Erreur lors de la mise à jour");
      return;
    }

    alert("Événement mis à jour !");
    router.push(`/event/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      <div className="h-16" />

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow border mt-6">
        <h1 className="text-2xl font-bold mb-6">✏️ Modifier l’événement</h1>

        {/* IMAGE */}
        {currentImage && (
          <img
            src={currentImage}
            alt="image actuelle"
            className="w-full h-52 object-cover rounded-xl mb-3"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        {imageFile && (
          <img
            src={URL.createObjectURL(imageFile)}
            className="w-full h-52 object-cover rounded-xl mt-3"
          />
        )}

        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input h-24" value={description} onChange={(e) => setDescription(e.target.value)} />

        <CategorySelector selected={categories} onChange={setCategories} />

        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
        <input className="input" value={placeName} onChange={(e) => setPlaceName(e.target.value)} />

        <input type="datetime-local" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="datetime-local" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <div className="flex flex-wrap gap-2 mt-4">
          {WEEKDAYS.map((d) => (
            <button
              key={d.value}
              onClick={() =>
                setRecurrenceWeekdays((prev) =>
                  prev.includes(d.value)
                    ? prev.filter((v) => v !== d.value)
                    : [...prev, d.value]
                )
              }
              className={`weekday ${
                recurrenceWeekdays.includes(d.value) ? "weekday-active" : ""
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <input className="input mt-4" placeholder="Contact nom" value={contactName} onChange={(e) => setContactName(e.target.value)} />
        <input className="input" placeholder="Contact email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        <input className="input" placeholder="Téléphone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 rounded-xl mt-6 font-semibold hover:bg-blue-700"
        >
          💾 Enregistrer les modifications
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 10px;
        }
        .weekday {
          padding: 6px 12px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
        }
        .weekday-active {
          background: #2563eb;
          color: white;
        }
      `}</style>
    </div>
  );
}