import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SiteInfoProvider } from "@/components/providers/SiteInfoProvider";
import { getSiteInfo } from "@/lib/site-info";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteInfo = await getSiteInfo();

    return {
      title: siteInfo.title,
      description: siteInfo.description,
      metadataBase: new URL(siteInfo.siteUrl),
      openGraph: {
        title: siteInfo.title,
        description: siteInfo.description,
        url: siteInfo.siteUrl,
        type: "website",
        images: siteInfo.ogImage ? [{ url: siteInfo.ogImage }] : undefined,
      },
      icons: {
        icon: [
          {
            url: siteInfo.logo || "/icons/logo.png",
            type: "image/png",
          },
        ],
        shortcut: siteInfo.logo || "/icons/logo.png",
        apple: siteInfo.logo ? [
          {
            url: siteInfo.logo,
            type: "image/png",
          },
        ] : undefined,
      },
      twitter: {
        card: siteInfo.twitterCard as "summary" | "summary_large_image" | "app" | "player" | undefined,
        title: siteInfo.title,
        description: siteInfo.description,
        images: siteInfo.ogImage ? [siteInfo.ogImage] : undefined,
      },
    };
  } catch (error) {
    console.error("Không thể tạo metadata từ site info:", error);
    return {
      title: "AI Platform",
      description: "Khám phá sức mạnh của trí tuệ nhân tạo",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteInfo = await getSiteInfo();

  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} `}
      >
        <SiteInfoProvider siteInfo={siteInfo}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              {children}
              <Footer />
            </div>
          </Providers>
        </SiteInfoProvider>
      </body>
    </html>
  );
}
