export const metadata = {
  title: '기념일 계산기',
  description: '100일 단위 기념일 계산기',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
