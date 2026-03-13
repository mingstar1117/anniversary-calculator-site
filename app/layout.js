export const metadata = {
  title: 'Playground 선택 화면',
  description: '물개 회피 놀이터와 기념일 계산기 중 원하는 페이지를 선택하세요.',
};

import './globals.css';
import AuthGate from './auth-gate';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
