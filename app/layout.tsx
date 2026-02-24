// app/layout.tsx — Updated with cache-bust
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "MediBook - Book Doctor Appointments",
  description: "Book appointments with top-rated doctors near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Clear stale appointment data on version change */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var ver = 'v2';
                if (localStorage.getItem('app_version') !== ver) {
                  localStorage.removeItem('appointments');
                  localStorage.setItem('app_version', ver);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}