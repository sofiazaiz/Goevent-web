// pages/_app.js
import "../styles/globals.css";
import Header from "../components/Header";
import { I18nProvider } from "../lib/i18n";

export default function MyApp({ Component, pageProps }) {
  return (
    <I18nProvider>
      <Header /> {/* Header premium global */}

      <main className="pt-16">
        {/* pt-16 = évite que le contenu passe sous le header */}
        <Component {...pageProps} />
      </main>
    </I18nProvider>
  );
}