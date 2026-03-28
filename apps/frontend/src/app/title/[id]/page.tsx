import { TitleDetails } from "../../../components/TitleDetails/TitleDetails";
import { api } from "../../../lib/api";
import styles from "./TitlePage.module.css";

export default async function TitlePage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: Record<string, string>;
}) {
  const type = searchParams.type === "tv" ? "tv" : "movie";
  const data = await api<{ item: any }>(`/content/${params.id}?type=${type}`).catch(() => ({ item: null }));
  const related = await api<{ items: any[] }>(`/content/${params.id}/related?type=${type}`).catch(() => ({ items: [] }));

  if (!data.item) return <main className={styles.page}><div className={styles.section}><h2>Not found</h2></div></main>;

  const item = data.item;
  const recommendations = (item.recommendations?.results || []).slice(0, 12);
  const similar = related.items.slice(0, 12);
  const cast = (item.credits?.cast || []).slice(0, 12);

  return (
    <TitleDetails item={item} cast={cast} recommendations={recommendations} similar={similar} />
  );
}
