// pages/account/login.js
import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return alert("Merci de remplir tous les champs.");

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/explore";
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
      {/* CARD */}
      <div className="bg-white w-full max-w-md shadow-lg rounded-2xl p-8 border border-gray-200">
        
        {/* TITRE */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Connexion à GoEvent
        </h1>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* MOT DE PASSE */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* BOUTON */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {/* SEPARATEUR */}
        <div className="text-center text-gray-500 text-sm mt-6">
          Pas de compte ?
          <Link href="/account/register">
            <span className="text-blue-600 hover:underline ml-1 font-medium cursor-pointer">
              Créer un compte
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}