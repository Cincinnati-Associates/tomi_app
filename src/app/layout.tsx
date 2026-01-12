import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://livetomi.com"),
  title: {
    default: "Tomi | Co-Own Your Dream Home",
    template: "%s | Tomi",
  },
  description:
    "Tomi helps you buy a home with friends, family, or co-investors through tenants-in-common (TIC) structures. Make homeownership accessible through co-ownership.",
  keywords: [
    "co-ownership",
    "home buying",
    "tenants in common",
    "TIC",
    "co-buyers",
    "affordable housing",
    "shared homeownership",
  ],
  authors: [{ name: "Tomi" }],
  creator: "Tomi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://livetomi.com",
    siteName: "Tomi",
    title: "Tomi | Co-Own Your Dream Home",
    description:
      "Make homeownership accessible through co-ownership. Buy a home with friends, family, or co-investors.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tomi - Co-Own Your Dream Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tomi | Co-Own Your Dream Home",
    description:
      "Make homeownership accessible through co-ownership. Buy a home with friends, family, or co-investors.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}