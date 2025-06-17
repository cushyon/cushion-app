import type React from "react";
import "./global.css";
import localFont from "next/font/local";
import { ThemeProvider } from "../components/theme-provider";
import { Footer } from "../components/footer";
const pretendard = localFont({
  src: [
    {
      path: "../public/fonts/pretendard/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  variable: "--font-pretendard",
});

export const metadata = {
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
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
    <html lang="en" suppressHydrationWarning className={pretendard.variable}>
      <body className={pretendard.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}
