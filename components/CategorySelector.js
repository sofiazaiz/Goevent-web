// components/CategorySelector.js
import { useMemo } from "react";
import {
  Music2,
  ShoppingBag,
  Wrench,
  Dumbbell,
  Martini,
  Drama,
  Baby,
  Utensils,
  Sparkles,
  Ghost,
  Rabbit,
  CircleDashed,
  Gamepad2,
} from "lucide-react";

// 🔹 Config officielle des catégories GoEvent (alignée avec l'app)
const CATEGORY_CONFIG = [
  { key: "concert", label: "Concert / Musique", Icon: Music2 },
  { key: "marche", label: "Marché / Salon", Icon: ShoppingBag },
  { key: "atelier", label: "Atelier / Workshop", Icon: Wrench },
  { key: "sport", label: "Sport", Icon: Dumbbell },
  { key: "loisirs", label: "Loisirs", Icon: Gamepad2 },
  { key: "soiree", label: "Soirée / Bar / Club", Icon: Martini },
  { key: "theatre", label: "Théâtre / Spectacle", Icon: Drama },
  { key: "enfants", label: "Enfants / Famille", Icon: Baby },
  { key: "gastronomie", label: "Gastronomie", Icon: Utensils },
  { key: "conference", label: "Noël", Icon: Sparkles },
  { key: "halloween", label: "Halloween", Icon: Ghost },
  { key: "pâques", label: "Pâques", Icon: Rabbit },
  { key: "autre", label: "Autre", Icon: CircleDashed },
];

// Export si tu veux réutiliser la liste brute
export const CATEGORY_KEYS = CATEGORY_CONFIG.map((c) => c.key);

export default function CategorySelector({ selected, onChange, dense = false }) {
  const selectedSet = useMemo(() => new Set(selected || []), [selected]);

  const toggleCategory = (key) => {
    const next = selectedSet.has(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];

    onChange(next);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${dense ? "-mx-1" : ""}`}>
      {CATEGORY_CONFIG.map(({ key, label, Icon }) => {
        const active = selectedSet.has(key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => toggleCategory(key)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border text-xs md:text-sm px-3 py-1.5 transition " +
              (active
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
            }
          >
            <Icon
              className="w-3.5 h-3.5 md:w-4 md:h-4"
              strokeWidth={2.2}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}