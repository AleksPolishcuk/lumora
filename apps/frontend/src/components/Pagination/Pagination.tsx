 "use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Pagination.module.css";

interface Props {
  page: number;
  totalPages: number;
  pathname: string;
  params: Record<string, string>;
}

const DESKTOP_BREAKPOINT = 1440;
const DESKTOP_PER_PAGE = "21";
const DEFAULT_PER_PAGE = "20";

function toHref(pathname: string, params: Record<string, string>, page: number) {
  const query = new URLSearchParams({ ...params, page: String(page) });
  return `${pathname}?${query.toString()}`;
}

export function Pagination({ page, totalPages, pathname, params }: Props) {
  const router = useRouter();
  const safeTotal = Math.max(1, Math.min(totalPages || 1, 500));

  useEffect(() => {
    const syncPerPage = () => {
      const desired = window.innerWidth >= DESKTOP_BREAKPOINT ? DESKTOP_PER_PAGE : DEFAULT_PER_PAGE;
      if ((params.perPage || DEFAULT_PER_PAGE) === desired) return;

      const query = new URLSearchParams({ ...params, perPage: desired });
      query.set("page", "1");
      router.replace(`${pathname}?${query.toString()}`);
    };

    syncPerPage();
    window.addEventListener("resize", syncPerPage);
    return () => window.removeEventListener("resize", syncPerPage);
  }, [params, pathname, router]);

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
