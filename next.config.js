/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ["fr", "en", "es", "de", "pt", "nl", "ar"],
    defaultLocale: "fr"
  },

  images: {
    domains: [
      "dmpbxpltbmmoniokthme.supabase.co"
      ],
    }, 
};

module.exports = nextConfig;