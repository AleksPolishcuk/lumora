import styles from "./SkeletonCard.module.css";

export function SkeletonCard() {
  return (
    <article className={styles.card} aria-hidden="true">
      <div className={styles.poster} />
      <div className={styles.meta}>
        <div className={styles.line} />
        <div className={`${styles.line} ${styles.lineShort}`} />
      </div>
    </article>
  );
}
