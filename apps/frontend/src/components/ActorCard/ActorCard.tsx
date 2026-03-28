import styles from "./ActorCard.module.css";
import Image from "next/image";

export function ActorCard({ actor }: { actor: any }) {
  const photo = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : "";
  return (
    <div className={styles.card}>
      {photo ? (
        <Image className={styles.photo} src={photo} alt={actor.name || "Actor"} width={185} height={278} sizes="(max-width: 768px) 35vw, 185px" />
      ) : (
        <div className={styles.photo} />
      )}
      <div>{actor.name}</div>
      <small>{actor.character}</small>
    </div>
  );
}
