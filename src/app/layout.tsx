import type { Metadata } from "next";
import "./globals.css";
import { MobileLayout } from "@/components/layout/MobileLayout";

export const metadata: Metadata = {
  title: "合肥学子家教平台",
  description: "找家教、做家教，大学生与家长对接平台",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover",
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
