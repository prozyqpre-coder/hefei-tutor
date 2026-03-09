import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileLayout } from "@/components/layout/MobileLayout";

export const metadata: Metadata = {
  title: "合肥学子家教平台",
  description: "找家教、做家教，大学生与家长对接平台",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  );
}
