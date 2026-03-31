import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "College Sach - The Unfiltered Truth About Indian Colleges",
  description:
    "Real reviews from real students. Honest, anonymous confessions about placements, hostel life, professors, and more at Indian colleges. No sugarcoating. No paid promotions.",
  keywords: [
    "Indian colleges",
    "college reviews",
    "honest reviews",
    "placements",
    "hostel life",
    "college confessions",
    "IIT",
    "NIT",
    "college truth",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white relative">
        {/* Subtle gradient background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#0a0a0f]" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-3xl" />
        </div>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
