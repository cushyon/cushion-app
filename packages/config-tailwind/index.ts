import type { Config } from "tailwindcss";

export default {
  /**
   * Pick any legal strategy—or delete this key entirely
   * if you don’t want to generate dark-mode utilities.
   */
  darkMode: "class",          // ← "media" or selector-strategy also fine

  theme: {
    // put your shared theme tokens here (or leave empty)
  },

  plugins: [
    // shared Tailwind plugins (typography, forms, etc.)
  ],
} satisfies Config;