import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | NextJs Study',
    default: 'NextJs Study',
  },
  // title: 'NextJs Study',
  description: 'A Dashboard Project Practice',
  keywords: ['nextjs14', 'react', 'typescript'],
  // 当页面被分享到社交平台时，会显示该图片
  openGraph: {
    images: '/opengraph-image.png',
  },
  // 这个地址作为某些配置项的前缀
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
