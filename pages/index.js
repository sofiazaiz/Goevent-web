import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-14 z-10">

        {/* TEXTE */}
        <div className="flex-1 text-center md:text-left relative z-20">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
            Découvrez les meilleurs événements
            <br />
            près de chez vous 🎉
          </h1>

          <p className="text-gray-600 text-lg md:text-xl mt-4 max-w-xl">
            Concerts, soirées, festivals, activités en famille…
            GoEvent trouve tout ce qu’il se passe autour de vous.
          </p>

          <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/search"
              className="relative z-30 px-8 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Explorer les événements
            </Link>

            <Link
              href="/organizer/create"
              className="relative z-30 px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full text-lg font-semibold hover:bg-blue-50 transition"
            >
              Créer un événement
            </Link>
          </div>
        </div>

        {/* ILLUSTRATION (NE CAPTE PLUS AUCUN CLIC) */}
        <div
          className="flex-1 flex justify-center relative z-0 pointer-events-none"
          aria-hidden
        >
          <div className="relative w-80 h-80 md:w-[440px] md:h-[440px] pointer-events-none">
            <Image
              src="/illustration.png"
              alt=""
              fill
              priority
              unoptimized
              className="object-contain drop-shadow-xl pointer-events-none select-none"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20 border-t border-gray-200 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Pourquoi utiliser GoEvent ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-semibold text-xl">Trouve rapidement</h3>
              <p className="text-gray-600 text-sm mt-2">
                Filtre par ville, date et catégorie.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
              <div className="text-5xl mb-4">👨‍👩‍👧</div>
              <h3 className="font-semibold text-xl">Adapté à tous</h3>
              <p className="text-gray-600 text-sm mt-2">
                Famille, sport, musique, loisirs…
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="font-semibold text-xl">Publie ton événement</h3>
              <p className="text-gray-600 text-sm mt-2">
                Simple, rapide et gratuit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-gray-500 text-sm border-t bg-white">
        © {new Date().getFullYear()} GoEvent
      </footer>
    </div>
  );
}