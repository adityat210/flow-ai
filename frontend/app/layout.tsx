import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlowIntel",
  description: "AI workflow balance for teams, assignments, and goals.",
};

/**
 * In App Router, wraps every page in application
 * place for
 * - auth/session providers
 * - full navigation
 * - theme setup
 * - notification providers
 */

export default function RootLayout({
    children,
    }: Readonly <{
        children: React.ReactNode;
    }>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
