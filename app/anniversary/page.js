'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import styles from './page.module.css';

const DAY_STEPS = Array.from({ length: 10 }, (_, index) => (index + 1) * 100);
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createLocalDate(isoDateText) {
  const [year, month, day] = isoDateText.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

const HEARTS = [
  { left: '6%', delay: '0s', duration: '13s', size: '14px' },
  { left: '14%', delay: '1.2s', duration: '12s', size: '20px' },
  { left: '24%', delay: '2.3s', duration: '15s', size: '16px' },
  { left: '32%', delay: '0.8s', duration: '11s', size: '12px' },
  { left: '42%', delay: '3s', duration: '14s', size: '18px' },
  { left: '50%', delay: '1.8s', duration: '10s', size: '13px' },
  { left: '58%', delay: '2.8s', duration: '16s', size: '22px' },
  { left: '66%', delay: '0.6s', duration: '12s', size: '15px' },
  { left: '74%', delay: '4s', duration: '14s', size: '17px' },
  { left: '82%', delay: '1.5s', duration: '11s', size: '13px' },
  { left: '90%', delay: '2.1s', duration: '15s', size: '19px' },
  { left: '96%', delay: '3.2s', duration: '13s', size: '14px' },
];

const BURST_EMOTICONS = ['>_<', "'ㅅ'", 'ㅇㅅㅇ7', 'ㅇ3ㅇ'];
const BURST_PER_EMOTICON = 20;
const BURST_PARTICLES = BURST_EMOTICONS.flatMap((symbol, symbolIndex) =>
  Array.from({ length: BURST_PER_EMOTICON }, (_, itemIndex) => {
    const particleIndex = symbolIndex * BURST_PER_EMOTICON + itemIndex;
    const angle = (particleIndex / (BURST_EMOTICONS.length * BURST_PER_EMOTICON)) * Math.PI * 2 + symbolIndex * 0.12;
    const distance = 130 + ((itemIndex * 17 + symbolIndex * 23) % 170);
    const x = Math.round(Math.cos(angle) * distance);
    const y = Math.round(Math.sin(angle) * distance);
    const size = 16 + ((itemIndex + symbolIndex) % 6) * 2;
    const delay = (0.58 + symbolIndex * 0.03 + itemIndex * 0.017).toFixed(2);
    const duration = (0.78 + ((itemIndex + symbolIndex) % 5) * 0.06).toFixed(2);

    return {
      symbol,
      x: `${x}px`,
      y: `${y}px`,
      size: `${size}px`,
      delay: `${delay}s`,
      duration: `${duration}s`,
    };
  }),
);

export default function AnniversaryPage() {
  const [startDate, setStartDate] = useState(() => formatIsoDate(new Date()));
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setShowIntro(false);
    }, 2200);

    return () => clearTimeout(timerId);
  }, []);

  const results = useMemo(() => {
    if (!startDate) return [];
    const base = createLocalDate(startDate);

    return DAY_STEPS.map((days) => {
      const targetDate = addDays(base, days);
      return {
        days,
        label: formatDate(targetDate),
        iso: formatIsoDate(targetDate),
      };
    });
  }, [startDate]);

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.homeLink}>
        메뉴로
      </Link>

      {showIntro && (
        <div className={styles.intro} aria-hidden="true">
          <span className={styles.introHeart} />
          <p className={styles.introText}>{'귀여운 멋진 쫑이이 >_<'}</p>
          <div className={styles.burstEmoticons}>
            {BURST_PARTICLES.map((particle, index) => (
              <span
                key={`${particle.symbol}-${index}`}
                style={{
                  '--tx': particle.x,
                  '--ty': particle.y,
                  '--burst-size': particle.size,
                  '--burst-delay': particle.delay,
                  '--burst-duration': particle.duration,
                }}
              >
                {particle.symbol}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.hearts} aria-hidden="true">
        {HEARTS.map((heart, index) => (
          <span
            key={`${heart.left}-${index}`}
            style={{
              '--left': heart.left,
              '--delay': heart.delay,
              '--duration': heart.duration,
              '--size': heart.size,
            }}
          />
        ))}
      </div>

      <section
        className={`${styles.app} ${showIntro ? styles.appHidden : styles.appReady}`}
        aria-labelledby="anniversary-title"
      >
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Anniversary Calculator</p>
          <h1 id="anniversary-title">기념일 계산기</h1>
          <p className={styles.subtitle}>날짜를 입력하면 100일부터 1000일까지 100일 단위 기념일을 계산해드려요.</p>
        </header>

        <section className={styles.panel} aria-label="날짜 입력">
          <form className={styles.form} onSubmit={(event) => event.preventDefault()}>
            <label className={styles.label} htmlFor="start-date">
              기준 날짜
            </label>

            <div className={styles.formRow}>
              <input
                id="start-date"
                name="start-date"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={styles.dateInput}
              />
              <button type="submit" className={styles.button}>
                계산하기
              </button>
            </div>
            <p className={styles.hint}>예: 2026-03-04</p>
          </form>
        </section>

        <section className={styles.panel} aria-live="polite" aria-label="계산 결과">
          <h2 className={styles.resultTitle}>결과</h2>
          <div className={styles.resultGrid}>
            {results.map((item) => (
              <article className={styles.card} key={item.days}>
                <strong>{item.days}일</strong>
                <time dateTime={item.iso}>{item.label}</time>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
