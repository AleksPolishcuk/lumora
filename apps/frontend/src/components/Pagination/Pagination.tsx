import Link from "next/link";
import styles from "./Pagination.module.css";

interface Props {
  page: number;
  totalPages: number;
  pathname: string;
  params: Record<string, string>;
}

function toHref(pathname: string, params: Record<string, string>, page: number) {
  const query = new URLSearchParams({ ...params, page: String(page) });
  return `${pathname}?${query.toString()}`;
}

export function Pagination({ page, totalPages, pathname, params }: Props) {
  const safeTotal = Math.max(1, Math.min(totalPages || 1, 500));
  return (
    <nav className={styles.wrap} aria-label="Pagination">
      <Link className={`${styles.btn} ${page <= 1 ? styles.disabled : ""}`} href={toHref(pathname, params, Math.max(1, page - 1))}>
        Prev
      </Link>
      <span className={styles.meta}>Page {page} / {safeTotal}</span>
      <Link className={`${styles.btn} ${page >= safeTotal ? styles.disabled : ""}`} href={toHref(pathname, params, Math.min(safeTotal, page + 1))}>
        Next
      </Link>
    </nav>
  );
}
