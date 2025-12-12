// pages/account/profile.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_ID = "6554f8ad-e6ca-47b5-8a29-f899860769e9";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Charger l'utilisateur + profil
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (!data.user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      setProfile(profileData);
    };

    load();
  }, []);

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/account/login";
  };

  // Suppression compte
  const handleDeleteAccount = async () => {
    if (!confirm("Voulez-vous vraiment supprimer votre compte ?")) return;

    const { error } = await supabase.rpc("delete_current_user_hard");

    if (error) {
      alert("Erreur : impossible de supprimer le compte");
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/account/login";
  };

  // ---------------------------------------------
  // SI NON CONNECTÉ
  // ---------------------------------------------
  if (!user)
    return (
      <div className="max-w-xl mx-auto py-32 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">Mon compte</h1>
        <p className="text-gray-600 mb-4">Vous devez être connecté.</p>
        <Link
          href="/account/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Se connecter →
        </Link>
      </div>
    );

  // ---------------------------------------------
  // PAGE PROFIL PREMIUM++
  // ---------------------------------------------
  return (
    <div className="max-w-2xl mx-auto py-20 px-4 text-gray-900">

      {/* TITRE */}
      <h1 className="text-3xl font-extrabold mb-8">Mon compte</h1>

      {/* ------------------------------------ */}
      {/* INFORMATIONS PERSONNELLES */}
      {/* ------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>

        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Email :</span> {profile?.email || user.email}
          </p>
        </div>
      </div>

      {/* ------------------------------------ */}
      {/* MODE ORGANISATEUR */}
      {/* ------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Mode organisateur</h2>

        <p className="text-gray-600">
          {profile?.is_organizer
            ? "Votre compte est en mode organisateur."
            : "Vous pouvez activer le mode organisateur pour créer des événements."}
        </p>

        <Link href="/organizer/create">
          <button className="mt-4 w-full py-3 bg-blue-600 text-white text-sm rounded-full font-semibold hover:bg-blue-700 transition">
            Passer en mode organisateur / Créer un événement
          </button>
        </Link>
      </div>

      {/* ------------------------------------ */}
      {/* LÉGAL & SUPPORT */}
      {/* ------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Légal & support</h2>

        <ul className="space-y-3 text-blue-600 text-sm">
          <li>
            <a href="https://goeventlegales.netlify.app/privacy" target="_blank" className="hover:underline">
              Politique de confidentialité
            </a>
          </li>
          <li>
            <a href="https://goeventlegales.netlify.app/terms" target="_blank" className="hover:underline">
              Conditions d’utilisation
            </a>
          </li>
          <li>
            <a href="https://goeventlegales.netlify.app/legal" target="_blank" className="hover:underline">
              Mentions légales
            </a>
          </li>
          <li>
            <a href="https://goeventlegales.netlify.app/contact" target="_blank" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </div>

      {/* ------------------------------------ */}
      {/* SÉCURITÉ */}
      {/* ------------------------------------ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Sécurité</h2>

        <button
          onClick={handleDeleteAccount}
          className="w-full mb-3 py-2.5 bg-red-100 text-red-700 rounded-full font-semibold hover:bg-red-200 transition"
        >
          Supprimer mon compte
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 bg-red-100 text-red-700 rounded-full font-semibold hover:bg-red-200 transition"
        >
          Se déconnecter
        </button>
      </div>

      {/* ------------------------------------ */}
      {/* ADMIN PANEL */}
      {/* ------------------------------------ */}
      {user?.id === ADMIN_ID && (
        <div className="bg-black text-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">Administration</h2>

          <Link href="/organizer/dashboard">
            <button className="w-full py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition">
              Modération des événements
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}