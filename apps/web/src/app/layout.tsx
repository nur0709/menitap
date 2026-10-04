import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://menitap.vercel.app'
const siteUrl = rawAppUrl.startsWith('http') ? rawAppUrl : `https://${rawAppUrl}`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Menitap — Find Your UGC Opportunity",
  description:
    "Menitap is an all-in-one platform for UGC creators and shoppers. Access educational resources, produce UGC videos, and discover discounted products through curated affiliate networks.",
  keywords: [
    "Menitap",
    "UGC",
    "user generated content",
    "affiliate marketing",
    "content creator",
    "brand deals",
    "discount shopping",
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Menitap — Find Your UGC Opportunity",
    description:
      "All-in-one platform for UGC creators and shoppers.",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
