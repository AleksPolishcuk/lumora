import styles from "./VideoPlayer.module.css";

export function VideoPlayer({ keyId }: { keyId: string }) {
  if (!keyId) return <p>Trailer unavailable</p>;
  return (
    <div className={styles.embed}>
      <iframe
        className={styles.iframe}
        src={`https://www.youtube.com/embed/${keyId}`}
        title="Video player"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    </div>
  );
}
