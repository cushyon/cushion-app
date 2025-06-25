import cors from "cors";

// You can extend this array to allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://cushion.trade",
  "https://app.cushion.trade",
  "https://ui-vault-git-unified-wallet-kit-3shop.vercel.app/",
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true, // if you want to allow cookies/auth headers
});
