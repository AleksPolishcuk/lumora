import { ContentCard } from "../../components/ContentCard/ContentCard";
import { Pagination } from "../../components/Pagination/Pagination";
import Link from "next/link";
import { api } from "../../lib/api";
import styles from "../BrowsePage.module.css";

export default async function SearchPage({ searchParams }: { searchParams: Record<string, string> }) {
  const q = searchParams.q || "";
  const page = searchParams.page || "1";
  const data = await api<{ items: any[]; page: number; totalPages: number }>(
    `/content/search?q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`
  ).catch(() => null);

  return (
    <main className={styles.page}>
      <h1>Search: {q}</h1>
      {!data ? (
        <div className={`${styles.stateCard} ${styles.stateError}`}>
          Failed to load search results.
          <br />
          <Link className={styles.retryLink} href={`/search?q=${encodeURIComponent(q)}&page=${encodeURIComponent(page)}`}>Retry</Link>
        </div>
      ) : data.items.length === 0 ? (
        <div className={styles.stateCard}>No results for your query.</div>
      ) : (
        <section className={styles.grid}>{data.items.map((item) => <ContentCard key={item.id} item={item} />)}</section>
      )}
      <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} pathname="/search" params={{ q }} />
    </main>
  );
}
