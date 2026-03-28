import { ContentCard } from "../ContentCard/ContentCard";
import styles from "./ContentRow.module.css";

export function ContentRow({ title, items }: { title: string; items: any[] }) {
  return (
    <section className={styles.row}>
      <div className={`${styles.rowInner} lumoraContainer`}>
        <h2>{title}</h2>
        <div className={styles.list}>
          {items.map((item) => <ContentCard key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
}
