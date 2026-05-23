import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todd Hitzeman — Senior Software Engineer",
  description:
    "Senior software engineer specializing in frontend architecture, scalable Angular applications, SSR/SSG, .NET, and Azure. Based in Dallas–Fort Worth.",
  keywords: [
    "Todd Hitzeman",
    "Senior Software Engineer",
    "Frontend Architecture",
    "Angular",
    "SSR",
    "SSG",
    ".NET",
    "Azure",
    "Dallas",
  ],
  authors: [{ name: "Todd Hitzeman" }],
  openGraph: {
    title: "Todd Hitzeman — Senior Software Engineer",
    description:
      "Frontend architecture, Angular at scale, SSR/SSG, .NET, Azure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
