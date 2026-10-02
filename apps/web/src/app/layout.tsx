import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
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
  openGraph: {
    title: "Menitap — Find Your UGC Opportunity",
    description:
      "All-in-one platform for UGC creators and shoppers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
