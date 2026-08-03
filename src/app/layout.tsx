import type { Metadata } from "next";
import { Suspense } from "react";
import { neueHaas } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { TopLoader } from "@/components/top-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TalentForge — Find your next opportunity",
    template: "%s · TalentForge",
  },
  description:
    "TalentForge is a professional network for job seekers and employers — build a profile, share posts, discover jobs, and track applications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={neueHaas.variable}>
      <body className="min-h-screen font-sans">
        <Suspense>
          <TopLoader />
        </Suspense>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
