import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    loadUser();
  }, []);

  return (
    <header
      className="
        fixed top-0 left-0 right-0 h-16
        bg-white/90
        border-b border-gray-200 shadow-sm
        z-50
        pointer-events-auto
      "
      style={{
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 pointer-events-auto">
          <img src="/logo.png" alt="GoEvent" className="h-7 w-auto" />
          <span className="text-lg font-bold text-gray-800">GoEvent</span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 text-gray-700 text-sm font-medium pointer-events-auto">
          <Link href="/search" className="hover:text-blue-600">
            Explorer
          </Link>
          <Link href="/favorites" className="hover:text-blue-600">
            Favoris
          </Link>

          {user ? (
            <Link href="/account/profile" className="hover:text-blue-600">
              Compte
            </Link>
          ) : (
            <Link href="/account/login" className="hover:text-blue-600">
              Compte
            </Link>
          )}
        </nav>

        {/* CTA */}
        <Link
          href="/organizer/create"
          className="
            hidden md:block
            bg-blue-600 text-white
            px-5 py-2 rounded-full
            text-sm font-semibold
            hover:bg-blue-700 transition
            pointer-events-auto
          "
        >
          + Publier
        </Link>
      </div>
    </header>
  );
}
