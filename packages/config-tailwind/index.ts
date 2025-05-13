import type { Config } from "tailwindcss";

export default {
  /* --- remove or change this line --- */
  // darkMode: false, ⇦ ❌ outdated
  // pick one of the valid values instead:
  darkMode: "class",                       // common
  // darkMode: "media",                    // follow OS
  // darkMode: ["selector", "[data-theme='dark']"], // v3.4+ selector strategy
  /* ----------------------------------- */
  theme: { /* … */ },
  plugins: [],
} satisfies Config;
