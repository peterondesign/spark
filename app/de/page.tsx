import { generateMetadata } from "../../utils/metadataUtils";

export const metadata = generateMetadata({
  title: 'Finde Verabredungs Ideen in deiner Nähe | Spark',
  description: 'Entdecke personalisierte Verabredungsideen für jede Gelegenheit',
  path: '/de',
  locale: 'de'
});

export default function GermanHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-6">Willkommen bei DateIdeas.cc</h1>
      <p>Entdecke personalisierte Verabredungsideen für jede Gelegenheit</p>
      {/* Content for German version will go here */}
    </main>
  );
}