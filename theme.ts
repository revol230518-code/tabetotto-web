
/**
 * たべとっと。 デザインシステム定義
 * index.cssで定義されたCSS変数を参照することで、テーマ切り替えに対応
 */

export const THEME = {
  colors: {
    appBg: "var(--app-bg)",
    cardBg: "var(--card-bg)",
    border: "var(--border)",
    softNeutral: "var(--soft-neutral)",
    textPrimary: "var(--text-primary)",
    textMuted: "var(--text-muted)",
    textLight: "var(--text-light)",
    textOnAccent: "var(--text-on-accent)",
    mealPrimary: "var(--meal-primary)",
    mealSoft: "var(--meal-soft)",
    mealBorder: "var(--meal-border)",
    mealPressed: "var(--meal-pressed)",
    readPrimary: "var(--read-primary)",
    readSoft: "var(--read-soft)",
    readBorder: "var(--read-border)",
    readPressed: "var(--read-pressed)",
    posturePrimary: "var(--posture-primary)",
    postureSoft: "var(--posture-soft)",
    postureBorder: "var(--posture-border)",
    posturePressed: "var(--posture-pressed)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    dangerSoft: "var(--danger-soft)",
    info: "var(--info)",

    // Keeping old ones temporarily
    primary: "var(--meal-primary)",
    secondary: "var(--posture-primary)",
    tertiary: "var(--read-primary)",
    text: "var(--text-primary)",
    bg: "var(--app-bg)",
    album: "#F1EAE0",
    albumShadow: "var(--border)",
    record: "var(--meal-primary)",
    action: "var(--posture-primary)",
  },
  shapes: {
    paperPrimary: "24px 32px 28px 30px / 30px 28px 32px 24px",
    paperSecondary: "30px 28px 32px 24px / 24px 32px 28px 30px",
    paperAlbum: "20px",
    card: "32px",
    badge: "999px",
  },
  shadows: {
    deep: "0 4px 12px rgba(93, 87, 69, 0.08)",
    soft: "0 8px 24px rgba(93, 87, 69, 0.04)",
  }
};
