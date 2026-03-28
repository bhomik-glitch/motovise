import styles from "./AnnouncementBars.module.css";

export interface AnnouncementBarsProps {
  announcements: readonly string[];
}

export function AnnouncementBars({
  announcements
}: Readonly<AnnouncementBarsProps>) {
  const displayAnnouncement =
    announcements[0] ?? "FREE NEXT-DAY SHIPPING ON ALL ORDERS OVER $100.";

  return (
    <div className={styles.announcement}>
      <div className={styles.announcementInner}>{displayAnnouncement}</div>
    </div>
  );
}
