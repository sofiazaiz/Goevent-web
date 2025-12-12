import Link from "next/link";
import { useRouter } from "next/router";

export default function Sidebar({ open }) {
  const router = useRouter();

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
     ${router.pathname.startsWith(path)
       ? "bg-blue-50 text-blue-600"
       : "text-gray-700 hover:bg-gray-100"
     }`;

  return (
    <aside
      className={`fixed md:static top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200 shadow-xl md:shadow-none z-40 transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      <nav className="p-4 flex flex-col gap-2">

        <p className="text-xs tracking-wide text-gray-400 font-semibold px-2 mb-2">
          Tableau de bord
        </p>

        <Link href="/organizer/dashboard" className={linkClass("/organizer/dashboard")}>
          📊 Modération
        </Link>

        <Link href="/organizer/events" className={linkClass("/organizer/events")}>
          🗂️ Tous les événements
        </Link>

        <Link href="/organizer/create" className={linkClass("/organizer/create")}>
          ➕ Créer un événement
        </Link>

        <Link href="/account/login" className={linkClass("/account")}>
          👤 Compte admin
        </Link>

        <div className="border-t mt-4 pt-4">
          <Link href="/" className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm">
            ← Retour au site
          </Link>
        </div>
      </nav>
    </aside>
  );
}