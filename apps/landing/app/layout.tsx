import type React from "react";
import "./global.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Cushion | Quantitative strategies for DeFi",
  description:
    "Cushion brings capital-protected strategies to DeFi, offering high-yield solutions with advanced risk management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
