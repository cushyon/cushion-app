// packages/config-tailwind/index.ts
import type { Config } from "tailwindcss";

export default {
  //  ✘ darkMode: false,
  // choose one of the new values ──────────────────────┐
  darkMode: "class",            // keep the old behaviour
  // darkMode: "media",          // system preference
  // darkMode: ["selector", "[data-theme='dark']"], // custom
  // ───────────────────────────────────────────────────┘
  theme: { /* … */ },
} satisfies Config;
