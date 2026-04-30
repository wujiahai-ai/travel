import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '智能旅行规划助手',
    template: '%s | 智能旅行规划助手',
  },
  description:
    'AI 驱动的个性化旅行攻略与行李清单生成工具，输入目的地和时间，即可获得专属旅行方案。',
  keywords: [
    '旅行规划',
    '旅行攻略',
    'AI旅行',
    '行程规划',
    '行李清单',
    '旅游推荐',
    '景点推荐',
    '美食推荐',
  ],
  authors: [{ name: 'Travel AI', url: process.env.COZE_PROJECT_DOMAIN_DEFAULT }],
  generator: 'Coze Code',
  openGraph: {
    title: '智能旅行规划助手',
    description:
      '使用 AI 技术，为您打造专属旅行体验。智能生成行程规划、景点推荐、美食建议和行李清单。',
    url: process.env.COZE_PROJECT_DOMAIN_DEFAULT,
    siteName: '智能旅行规划助手',
    locale: 'zh_CN',
    type: 'website',
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
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
