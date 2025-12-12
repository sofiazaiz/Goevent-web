// components/Layout.js
import { useRouter } from "next/router";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Link from "next/link";

export default function Layout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdminPage = router.pathname.startsWith("/organizer");

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-[system-ui]">

      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="pt-16 flex">

        {/* --- SIDEBAR ADMIN --- */}
        {isAdminPage && (
          <>
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/30 z-30 md:hidden"
              />
            )}

            <aside
              className={`fixed md:static top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 shadow-lg md:shadow-none z-40 transition-transform duration-300
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
            >
              <nav className="p-4 flex flex-col gap-2">

                <p className="text-xs uppercase text-gray-400 font-semibold px-2 mb-2">
                  Tableau de bord
                </p>

                <Link
                  href="/organizer/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition ${
                    router.pathname === "/organizer/dashboard"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  📊 Modération
                </Link>

                <Link
                  href="/organizer/events"
                  className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition ${
                    router.pathname.startsWith("/organizer/events")
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  🗂️ Tous les événements
                </Link>

                <Link
                  href="/organizer/create"
                  className={`px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition ${
                    router.pathname === "/organizer/create"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  ➕ Créer un événement
                </Link>

                <div className="border-t mt-4 pt-4">
                  <Link
                    href="/"
                    className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition"
                  >
                    ← Retour au site
                  </Link>
                </div>
              </nav>
            </aside>
          </>
        )}

        {/* CONTENT */}
        <main className="flex-1 px-4 md:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}