import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
    <html lang="en" className={`scroll-smooth ${inter.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <PostHogProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}