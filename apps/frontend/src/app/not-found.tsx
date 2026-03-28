import Link from "next/link";
import styles from "./BrowsePage.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <h1>Page not found</h1>
      <div className={styles.stateCard}>
        The page you are looking for does not exist.
        <br />
        <Link href="/" style={{ color: "#b78bff" }}>Return to Home</Link>
      </div>
    </main>
  );
}
