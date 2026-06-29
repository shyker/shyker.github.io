import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BrokenRecord from "@/components/magicui/broken-record";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "𝓼𝓱𝔂𝓵𝓮𝓻 𝓫𝓵𝓸𝓰",
  description: "一位uestc的普通本科生",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* ✨ 全局唱片 —— 跨页面常驻，音乐不中断 */}
        <div className={`fixed top-15 right-73 z-[99999] pointer-events-auto w-70 h-70`}>
          <BrokenRecord songs={[
            "/audio/seeu.m4a",
            "/audio/alex1.m4a",
            "/audio/light.m4a",
          ]} />
        </div>
      </body>
    </html>
  );
}
