import { VideoPlayer } from "../../../components/VideoPlayer/VideoPlayer";
import { api } from "../../../lib/api";
import styles from "../../BrowsePage.module.css";

export default async function WatchPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: Record<string, string>;
}) {
  const type = searchParams.type === "tv" ? "tv" : "movie";
  const data = await api<{ item: any }>(`/content/${params.id}?type=${type}`).catch(() => ({ item: null }));
  const trailer = data.item?.videos?.results?.find((v: any) => v.site === "YouTube")?.key || "";
  return (
    <main className={styles.page}>
      <h1>Watch</h1>
      <div className={styles.watchEmbed}>
        <VideoPlayer keyId={trailer} />
      </div>
    </main>
  );
}
