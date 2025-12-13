import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    // locale injectée automatiquement par Next.js (i18n)
    const locale = this.props.__NEXT_DATA__.locale || "fr";

    // RTL uniquement pour l’arabe
    const isRTL = locale === "ar";

    return (
      <Html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
        <Head>
          {/* Meta de base */}
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1"
          />

          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" href="/favicon.png" sizes="48x48" />
          <link rel="apple-touch-icon" href="/favicon.png" />

          {/* Amélioration rendu RTL */}
          {isRTL && (
            <style>{`
              body {
                direction: rtl;
                text-align: right;
              }
            `}</style>
          )}
        </Head>

        <body className="bg-white text-gray-900 antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}