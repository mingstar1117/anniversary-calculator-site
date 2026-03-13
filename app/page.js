import Link from 'next/link';

import styles from './page.module.css';

const ENTRIES = [
  {
    href: '/artist-match',
    title: '작품 성향 테스트',
    description: 'MBTI처럼 질문에 답하면 작품 취향과 작가/전시장 추천을 받아요.',
    tag: 'New',
  },
  {
    href: '/seal',
    title: '물개 회피 놀이터',
    description: '검은 바다에서 물개가 커서를 피해 도망다녀요.',
    tag: 'Interactive',
  },
  {
    href: '/anniversary',
    title: '기념일 계산기',
    description: '기준 날짜에서 100일 단위 기념일을 계산해요.',
    tag: 'Utility',
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />

      <section className={styles.panel} aria-labelledby="menu-title">
        <p className={styles.kicker}>Playground</p>
        <h1 id="menu-title">원하는 화면을 선택하세요</h1>
        <p className={styles.subtitle}>아래 카드 중 하나를 눌러 바로 이동할 수 있어요.</p>

        <div className={styles.grid}>
          {ENTRIES.map((entry) => (
            <Link key={entry.href} href={entry.href} className={styles.card}>
              <span className={styles.tag}>{entry.tag}</span>
              <strong>{entry.title}</strong>
              <span>{entry.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
