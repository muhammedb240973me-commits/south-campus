import { Providers } from "@/components/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Syndicate - SSF Kozhikode South",
  description: "Official Campus Portal for SSF Kozhikode South District Committee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Forced bg-slate-50 prevents any black backgrounds from bleeding through */}
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-gray-900 m-0 p-0`}>
        <Providers>
          {/* flex-grow and flex-col allow the page content to perfectly fill the screen */}
          <main className="flex-grow flex flex-col w-full bg-slate-50">
            {children}
          </main>

          {/* Reduced padding (py-2) and text size (text-xs) */}
          <footer className="bg-blue-900 text-white py-2 mt-auto shrink-0 z-50">
            <div className="container mx-auto px-4 text-center text-[11px] md:text-xs font-medium tracking-wide">
              © 2026 Campus Syndicate SSF Kozhikode South
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}