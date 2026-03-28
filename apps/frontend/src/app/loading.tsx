import styles from "./BrowsePage.module.css";
import { SkeletonCard } from "../components/SkeletonCard/SkeletonCard";

export default function RootLoading() {
  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <SkeletonCard key={idx} />
        ))}
      </div>
    </main>
  );
}
