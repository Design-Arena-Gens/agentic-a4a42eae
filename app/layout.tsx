"use client";

import "./globals.css";
import { ReactNode, useEffect } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem("call-agent-theme") ?? "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <html lang="en">
      <body className="bg-surface text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
