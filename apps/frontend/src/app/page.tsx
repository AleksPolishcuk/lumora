import { HeroBanner } from "../components/HeroBanner/HeroBanner";
import { ContentRow } from "../components/ContentRow/ContentRow";
import { api } from "../lib/api";

export default async function HomePage() {
  const featured = await api<{ items: any[] }>("/content/featured").catch(() => ({ items: [] }));
  const trending = await api<{ items: any[] }>("/content/featured").catch(() => ({ items: [] }));

  return (
    <main>
      <HeroBanner items={featured.items.slice(0, 5)} />
      <ContentRow title="Trending" items={trending.items.slice(0, 12)} />
      <ContentRow title="Recommended" items={featured.items.slice(5, 17)} />
    </main>
  );
}
