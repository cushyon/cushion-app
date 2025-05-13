import base from "@repo/config-tailwind";
import type { Config } from "tailwindcss";

const config: Config = {
  presets: [base],                       // pull in the shared rules
  content: [
    "./src/app/**/*.{ts,tsx}",           // the app itself
    "../../packages/**/*.{ts,tsx}",      // any package that ships JSX/TSX
  ],
};

export default config;

