import { FilterBlockWithSuspense } from "../../components/FilterBlock/FilterBlock";
import { ContentCard } from "../../components/ContentCard/ContentCard";
import { Pagination } from "../../components/Pagination/Pagination";
import Link from "next/link";
import { api } from "../../lib/api";
import styles from "../BrowsePage.module.css";

export default async function SeriesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const q = new URLSearchParams({ ...searchParams, type: "series" }).toString();
  const data = await api<{ items: any[]; page: number; totalPages: number }>(`/content?${q}`).catch(() => null);
  return (
    <main className={styles.page}>
      <h1>Series</h1>
      <FilterBlockWithSuspense />
      {!data ? (
        <div className={`${styles.stateCard} ${styles.stateError}`}>
          Failed to load content. Please try again.
          <br />
          <Link className={styles.retryLink} href={`/series?${new URLSearchParams(searchParams).toString()}`}>Retry</Link>
        </div>
      ) : data.items.length === 0 ? (
        <div className={styles.stateCard}>No titles found for current filters.</div>
      ) : (
        <section className={styles.grid}>{data.items.map((item) => <ContentCard key={item.id} item={item} />)}</section>
      )}
      <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} pathname="/series" params={searchParams} />
    </main>
  );
}
